import { prisma } from "@/lib/prisma";
import { createTransport, sendEmail } from "./smtp";
import {
  createImapClient,
  findWarmupEmail,
  markAsRead,
  markAsImportant,
  moveFromSpamToInbox,
  getSpamFolder,
} from "./imap";
import { pickRandomTopic, generateWarmupEmail } from "./warmup-content";

let warmupCycleRunning = false;
let lastWarmupCycleAt = 0;

const WARMUP_CYCLE_MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Pool warmup ramp schedule (separate from cold email ramp)
const POOL_RAMP = [
  { maxDay: 2, target: 2 },
  { maxDay: 5, target: 4 },
  { maxDay: 10, target: 8 },
  { maxDay: 15, target: 12 },
  { maxDay: 20, target: 16 },
  { maxDay: Infinity, target: 20 },
];

function getPoolDailyTarget(day: number): number {
  const phase = POOL_RAMP.find((p) => day <= p.maxDay) || POOL_RAMP[POOL_RAMP.length - 1];
  return phase.target;
}

export interface WarmupCycleResult {
  skipped?: boolean;
  skipReason?: string;
  emailsSent: number;
  emailsFailed: number;
  emailsOpened: number;
  emailsReplied: number;
  spamRescues: number;
  markedImportant: number;
  imapErrors: number;
  accountsProcessed: number;
  details: string[];
}

export async function runWarmupCycle(): Promise<WarmupCycleResult> {
  // Throttle: skip if last run was < 5 min ago
  const now = Date.now();
  if (now - lastWarmupCycleAt < WARMUP_CYCLE_MIN_INTERVAL_MS) {
    return {
      skipped: true,
      skipReason: "Throttled (last run < 5 min ago)",
      emailsSent: 0,
      emailsFailed: 0,
      emailsOpened: 0,
      emailsReplied: 0,
      spamRescues: 0,
      markedImportant: 0,
      imapErrors: 0,
      accountsProcessed: 0,
      details: ["Warmup cycle throttled"],
    };
  }

  if (warmupCycleRunning) {
    return {
      skipped: true,
      skipReason: "Already running",
      emailsSent: 0,
      emailsFailed: 0,
      emailsOpened: 0,
      emailsReplied: 0,
      spamRescues: 0,
      markedImportant: 0,
      imapErrors: 0,
      accountsProcessed: 0,
      details: ["Warmup cycle already running"],
    };
  }

  warmupCycleRunning = true;
  lastWarmupCycleAt = now;

  const result: WarmupCycleResult = {
    emailsSent: 0,
    emailsFailed: 0,
    emailsOpened: 0,
    emailsReplied: 0,
    spamRescues: 0,
    markedImportant: 0,
    imapErrors: 0,
    accountsProcessed: 0,
    details: [],
  };

  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1. Get all pool-enabled accounts
    const accounts = await prisma.emailAccount.findMany({
      where: { warmupPoolEnabled: true, isActive: true },
    });

    if (accounts.length < 2) {
      result.details.push(`Need at least 2 pool accounts (have ${accounts.length})`);
      return result;
    }

    // 2. Daily reset + pool day advancement
    for (const account of accounts) {
      if (account.warmupSentTodayDate !== today) {
        const newDay = account.warmupPoolDay + 1;
        const newTarget = getPoolDailyTarget(newDay);

        await prisma.emailAccount.update({
          where: { id: account.id },
          data: {
            warmupSentToday: 0,
            warmupSentTodayDate: today,
            warmupPoolDay: newDay,
            warmupDailyTarget: newTarget,
          },
        });

        account.warmupSentToday = 0;
        account.warmupSentTodayDate = today;
        account.warmupPoolDay = newDay;
        account.warmupDailyTarget = newTarget;
      }
    }

    // 3. Phase A: Send warmup emails
    await sendWarmupEmails(accounts, result);

    // 4. Phase B: Process received emails via IMAP
    await processReceivedEmails(accounts, result);

    // 5. Mark stale conversations
    await prisma.warmupConversation.updateMany({
      where: {
        status: "active",
        lastMessageAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      },
      data: { status: "stale" },
    });

    return result;
  } finally {
    warmupCycleRunning = false;
  }
}

async function sendWarmupEmails(
  accounts: Awaited<ReturnType<typeof prisma.emailAccount.findMany>>,
  result: WarmupCycleResult
): Promise<void> {
  // Create pairings from shuffled accounts
  const shuffled = [...accounts].sort(() => Math.random() - 0.5);
  const pairings: { sender: (typeof accounts)[0]; receiver: (typeof accounts)[0] }[] = [];

  for (let i = 0; i < shuffled.length; i++) {
    const sender = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length];
    if (sender.id !== receiver.id && sender.warmupSentToday < sender.warmupDailyTarget) {
      pairings.push({ sender, receiver });
    }
  }

  // Add reverse pairings for more coverage (if quota allows)
  for (let i = 0; i < shuffled.length; i++) {
    const sender = shuffled[(i + 1) % shuffled.length];
    const receiver = shuffled[i];
    if (
      sender.id !== receiver.id &&
      sender.warmupSentToday < sender.warmupDailyTarget &&
      !pairings.find((p) => p.sender.id === sender.id && p.receiver.id === receiver.id)
    ) {
      pairings.push({ sender, receiver });
    }
  }

  for (const { sender, receiver } of pairings) {
    if (sender.warmupSentToday >= sender.warmupDailyTarget) continue;

    try {
      // Check for active conversation to continue
      const activeConversation = await prisma.warmupConversation.findFirst({
        where: {
          OR: [
            { senderAccountId: sender.id, receiverAccountId: receiver.id },
            { senderAccountId: receiver.id, receiverAccountId: sender.id },
          ],
          status: "active",
          lastMessageAt: { lt: new Date(Date.now() - 4 * 60 * 60 * 1000) }, // > 4h ago
        },
        include: {
          emails: { orderBy: { turnNumber: "desc" }, take: 1 },
        },
      });

      let conversation: { id: string; topicKey: string; turnCount: number; maxTurns: number; threadId: string };
      let turnNumber: number;
      let inReplyTo: string | null = null;

      if (activeConversation && activeConversation.turnCount < activeConversation.maxTurns) {
        // Continue existing conversation
        conversation = activeConversation;
        turnNumber = activeConversation.turnCount;
        inReplyTo = activeConversation.emails[0]?.messageId || null;
      } else {
        // Start new conversation
        if (activeConversation && activeConversation.turnCount >= activeConversation.maxTurns) {
          await prisma.warmupConversation.update({
            where: { id: activeConversation.id },
            data: { status: "completed" },
          });
        }

        const topic = pickRandomTopic();
        const maxTurns = Math.floor(Math.random() * 4) + 2; // 2-5 turns
        const newConv = await prisma.warmupConversation.create({
          data: {
            senderAccountId: sender.id,
            receiverAccountId: receiver.id,
            subject: "",
            topicKey: topic.key,
            maxTurns,
            status: "active",
          },
        });
        conversation = { ...newConv, turnCount: 0 };
        turnNumber = 0;
      }

      // Find the topic from the bank
      const { WARMUP_TOPICS } = await import("./warmup-content");
      const topic = WARMUP_TOPICS.find((t) => t.key === conversation.topicKey) || pickRandomTopic();

      // Generate email content
      const { subject, body } = generateWarmupEmail({
        topic,
        turnNumber,
        maxTurns: conversation.maxTurns,
        senderName: sender.fromName,
        receiverName: receiver.fromName,
      });

      // Create WarmupEmail record
      const warmupEmail = await prisma.warmupEmail.create({
        data: {
          conversationId: conversation.id,
          senderAccountId: sender.id,
          receiverAccountId: receiver.id,
          subject,
          bodyText: body,
          turnNumber,
          inReplyTo,
          status: "sent",
          sentAt: new Date(),
        },
      });

      // Send via SMTP
      const transporter = createTransport(sender);
      const fromStr = `${sender.fromName} <${sender.fromEmail}>`;

      const headers: Record<string, string> = {
        "X-Warmup-Id": warmupEmail.warmupId,
        "X-Warmup-Thread": conversation.threadId,
      };

      if (inReplyTo) {
        headers["In-Reply-To"] = inReplyTo;
        headers["References"] = inReplyTo;
      }

      const { messageId } = await sendEmail(transporter, {
        from: fromStr,
        to: receiver.fromEmail,
        subject,
        html: body.replace(/\n/g, "<br>"), // Simple text-to-html
        text: body,
        replyTo: sender.fromEmail,
        headers,
      });

      // Update records
      await Promise.allSettled([
        prisma.warmupEmail.update({
          where: { id: warmupEmail.id },
          data: { messageId },
        }),
        prisma.warmupConversation.update({
          where: { id: conversation.id },
          data: {
            turnCount: turnNumber + 1,
            lastMessageAt: new Date(),
            subject: turnNumber === 0 ? subject : undefined,
          },
        }),
        prisma.emailAccount.update({
          where: { id: sender.id },
          data: { warmupSentToday: { increment: 1 } },
        }),
        // Update daily stats
        prisma.warmupDailyStats.upsert({
          where: { accountId_date: { accountId: sender.id, date: new Date().toISOString().slice(0, 10) } },
          create: { accountId: sender.id, date: new Date().toISOString().slice(0, 10), emailsSent: 1 },
          update: { emailsSent: { increment: 1 } },
        }),
        prisma.warmupDailyStats.upsert({
          where: { accountId_date: { accountId: receiver.id, date: new Date().toISOString().slice(0, 10) } },
          create: { accountId: receiver.id, date: new Date().toISOString().slice(0, 10), emailsReceived: 1 },
          update: { emailsReceived: { increment: 1 } },
        }),
      ]);

      sender.warmupSentToday++;
      result.emailsSent++;
      result.details.push(`Sent warmup: ${sender.fromEmail} → ${receiver.fromEmail} (${topic.key}, turn ${turnNumber})`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      result.emailsFailed++;
      result.details.push(`Failed warmup: ${sender.fromEmail} → ${receiver.fromEmail} — ${errMsg}`);
    }
  }
}

async function processReceivedEmails(
  accounts: Awaited<ReturnType<typeof prisma.emailAccount.findMany>>,
  result: WarmupCycleResult
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  for (const account of accounts) {
    // Skip accounts without IMAP config
    if (!account.imapHost || !account.imapUser || !account.imapPass) {
      continue;
    }

    result.accountsProcessed++;

    // Find unprocessed warmup emails received by this account
    const unprocessed = await prisma.warmupEmail.findMany({
      where: {
        receiverAccountId: account.id,
        status: "sent",
        opened: false,
        sentAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // last 24h
      },
      orderBy: { sentAt: "asc" },
    });

    if (unprocessed.length === 0) continue;

    let client;
    try {
      client = createImapClient({
        imapHost: account.imapHost,
        imapPort: account.imapPort || 993,
        imapSecure: account.imapSecure,
        imapUser: account.imapUser,
        imapPass: account.imapPass,
        fromEmail: account.fromEmail,
      });

      await client.connect();

      // Update IMAP status
      await prisma.emailAccount.update({
        where: { id: account.id },
        data: { imapStatus: "connected", imapLastCheckedAt: new Date(), imapLastError: null },
      });

      const spamFolder = await getSpamFolder(client);

      for (const email of unprocessed) {
        // Skip if too recent (< 5 min, might not have arrived yet)
        if (email.sentAt && Date.now() - email.sentAt.getTime() < 5 * 60 * 1000) {
          continue;
        }

        try {
          const found = await findWarmupEmail(client, email.warmupId, email.messageId || undefined);

          if (!found) {
            // Skip if < 30 min old
            if (email.sentAt && Date.now() - email.sentAt.getTime() < 30 * 60 * 1000) {
              continue;
            }
            result.details.push(`Warmup email not found in mailbox: ${email.warmupId}`);
            continue;
          }

          const updates: Record<string, unknown> = {};
          const statsUpdates: Record<string, { increment: number }> = {};

          // Handle spam rescue
          if (found.mailbox !== "INBOX" && spamFolder && found.mailbox === spamFolder) {
            if (Math.random() * 100 < account.warmupSpamRescueRate) {
              await moveFromSpamToInbox(client, found.uid, found.mailbox);
              updates.spamRescued = true;
              updates.spamRescuedAt = new Date();
              statsUpdates.spamRescues = { increment: 1 };
              result.spamRescues++;
              result.details.push(`Spam rescued: ${email.warmupId} for ${account.fromEmail}`);
              // After moving, the email is now in INBOX
              found.mailbox = "INBOX";
            }
          }

          // Mark as read
          if (Math.random() * 100 < account.warmupOpenRate) {
            await markAsRead(client, found.uid, found.mailbox);
            updates.opened = true;
            updates.openedAt = new Date();
            updates.status = "opened";
            statsUpdates.opens = { increment: 1 };
            result.emailsOpened++;
          }

          // Mark as important
          if (Math.random() * 100 < account.warmupImportantRate) {
            await markAsImportant(client, found.uid, found.mailbox);
            updates.markedImportant = true;
            updates.markedImportantAt = new Date();
            statsUpdates.markedImportant = { increment: 1 };
            result.markedImportant++;
          }

          // Update warmup email record
          if (Object.keys(updates).length > 0) {
            await prisma.warmupEmail.update({
              where: { id: email.id },
              data: updates,
            });
          }

          // Update daily stats
          if (Object.keys(statsUpdates).length > 0) {
            await prisma.warmupDailyStats.upsert({
              where: { accountId_date: { accountId: account.id, date: today } },
              create: { accountId: account.id, date: today, ...Object.fromEntries(Object.entries(statsUpdates).map(([k, v]) => [k, v.increment])) },
              update: statsUpdates,
            });
          }
        } catch (emailErr: unknown) {
          const errMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
          result.details.push(`IMAP error processing ${email.warmupId}: ${errMsg}`);
        }
      }

      await client.logout();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      result.imapErrors++;
      result.details.push(`IMAP connection failed for ${account.fromEmail}: ${errMsg}`);

      await prisma.emailAccount.update({
        where: { id: account.id },
        data: { imapStatus: "error", imapLastError: errMsg, imapLastCheckedAt: new Date() },
      });

      // Update daily stats with IMAP error
      await prisma.warmupDailyStats.upsert({
        where: { accountId_date: { accountId: account.id, date: today } },
        create: { accountId: account.id, date: today, imapErrors: 1 },
        update: { imapErrors: { increment: 1 } },
      });

      try {
        if (client) await client.logout();
      } catch {
        // Already disconnected
      }
    }
  }
}
