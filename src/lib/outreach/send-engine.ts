import { prisma } from "@/lib/prisma";
import { advanceWarmup } from "./warmup";
import { renderTemplate } from "./renderer";
import { createTransport, sendEmail } from "./smtp";

let sendCycleRunning = false;

interface SendCycleResult {
  skipped?: boolean;
  sent: number;
  failed: number;
  campaignsProcessed: number;
  details: string[];
}

export async function runSendCycle(): Promise<SendCycleResult> {
  if (sendCycleRunning) {
    return { skipped: true, sent: 0, failed: 0, campaignsProcessed: 0, details: ["Cycle already running"] };
  }

  sendCycleRunning = true;
  const result: SendCycleResult = { sent: 0, failed: 0, campaignsProcessed: 0, details: [] };

  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1. Daily reset + warmup advancement for all accounts
    const accounts = await prisma.emailAccount.findMany({
      where: { isActive: true, status: "active" },
    });

    for (const account of accounts) {
      if (account.sentTodayDate !== today) {
        const warmup = advanceWarmup({
          warmupDay: account.warmupDay,
          warmupPhase: account.warmupPhase,
          dailyLimit: account.dailyLimit,
          consecutiveErrors: account.consecutiveErrors,
          warmupEnabled: account.warmupEnabled,
        });

        await prisma.emailAccount.update({
          where: { id: account.id },
          data: {
            sentToday: 0,
            sentTodayDate: today,
            warmupDay: warmup.warmupDay,
            warmupPhase: warmup.phase,
            dailyLimit: warmup.dailyLimit,
          },
        });

        // Update in-memory for this cycle
        account.sentToday = 0;
        account.sentTodayDate = today;
        account.warmupDay = warmup.warmupDay;
        account.warmupPhase = warmup.phase;
        account.dailyLimit = warmup.dailyLimit;
      }
    }

    // 2. Get active campaigns with their templates
    const campaigns = await prisma.outreachCampaign.findMany({
      where: { status: "active" },
      include: {
        templates: { include: { template: true } },
        list: true,
      },
    });

    // 3. Process each campaign
    for (const campaign of campaigns) {
      result.campaignsProcessed++;

      // a. Send window check
      const now = new Date();
      const tzHour = getHourInTimezone(now, campaign.timezone);
      if (tzHour < campaign.sendWindowStart || tzHour >= campaign.sendWindowEnd) {
        result.details.push(`${campaign.name}: outside send window (${tzHour}h, window ${campaign.sendWindowStart}-${campaign.sendWindowEnd})`);
        continue;
      }

      // b. Weekend check
      if (campaign.skipWeekends) {
        const dayInTz = getDayInTimezone(now, campaign.timezone);
        if (dayInTz === 0 || dayInTz === 6) {
          result.details.push(`${campaign.name}: skipping weekend`);
          continue;
        }
      }

      // c. Delay check
      if (campaign.lastSendAt) {
        const elapsed = now.getTime() - campaign.lastSendAt.getTime();
        const jitter = Math.floor(Math.random() * campaign.jitterSeconds * 1000);
        const requiredDelay = campaign.delayMinutes * 60 * 1000 + jitter;
        if (elapsed < requiredDelay) {
          result.details.push(`${campaign.name}: delay not met (${Math.round(elapsed / 1000)}s / ${Math.round(requiredDelay / 1000)}s)`);
          continue;
        }
      }

      // d. Get next eligible contact
      const sentContactIds = await prisma.outreachSend.findMany({
        where: { campaignId: campaign.id },
        select: { contactId: true },
      });
      const sentIds = new Set(sentContactIds.map((s) => s.contactId));

      // Cross-campaign dedup
      let recentlySentIds = new Set<string>();
      if (campaign.allowResendDays > 0) {
        const cutoff = new Date(now.getTime() - campaign.allowResendDays * 24 * 60 * 60 * 1000);
        const recentSends = await prisma.outreachSend.findMany({
          where: { sentAt: { gte: cutoff }, status: "sent" },
          select: { contactId: true },
          distinct: ["contactId"],
        });
        recentlySentIds = new Set(recentSends.map((s) => s.contactId));
      } else {
        // allowResendDays = 0 means never resend — get ALL previously sent contacts
        const allSends = await prisma.outreachSend.findMany({
          where: { status: "sent" },
          select: { contactId: true },
          distinct: ["contactId"],
        });
        recentlySentIds = new Set(allSends.map((s) => s.contactId));
      }

      // Find eligible contact from the campaign's list
      const listMembers = await prisma.outreachListMember.findMany({
        where: { listId: campaign.listId },
        include: { contact: true },
        orderBy: { contact: { createdAt: "asc" } },
      });

      const eligible = listMembers.find(
        (m) =>
          !sentIds.has(m.contactId) &&
          !recentlySentIds.has(m.contactId) &&
          m.contact.status !== "unsubscribed" &&
          m.contact.status !== "bounced"
      );

      if (!eligible) {
        // Check if campaign is complete
        const totalEligible = listMembers.filter(
          (m) => m.contact.status !== "unsubscribed" && m.contact.status !== "bounced"
        ).length;
        if (sentIds.size >= totalEligible) {
          await prisma.outreachCampaign.update({
            where: { id: campaign.id },
            data: { status: "complete", completedAt: now },
          });
          result.details.push(`${campaign.name}: completed (all contacts sent)`);
        } else {
          result.details.push(`${campaign.name}: no eligible contacts right now`);
        }
        continue;
      }

      // e. Pick email account (least-loaded first)
      const freshAccounts = await prisma.emailAccount.findMany({
        where: { isActive: true, status: "active" },
        orderBy: { sentToday: "asc" },
      });
      const account = freshAccounts.find((a) => a.sentToday < a.dailyLimit);
      if (!account) {
        result.details.push(`${campaign.name}: all accounts at daily limit`);
        continue;
      }

      // f. Select template (weighted random)
      const template = selectWeightedTemplate(campaign.templates);
      if (!template) {
        result.details.push(`${campaign.name}: no templates assigned`);
        continue;
      }

      // g. Render
      const contact = eligible.contact;
      const renderedSubject = renderTemplate(template.template.subject, {
        email: contact.email,
        businessName: contact.businessName,
        firstName: contact.firstName,
        category: contact.category,
        city: contact.city,
        cuisineType: contact.cuisineType,
        website: contact.website,
        phone: contact.phone,
        address: contact.address,
        zipCode: contact.zipCode,
        unsubscribeToken: contact.unsubscribeToken,
      });
      const renderedHtml = renderTemplate(template.template.htmlBody, {
        email: contact.email,
        businessName: contact.businessName,
        firstName: contact.firstName,
        category: contact.category,
        city: contact.city,
        cuisineType: contact.cuisineType,
        website: contact.website,
        phone: contact.phone,
        address: contact.address,
        zipCode: contact.zipCode,
        unsubscribeToken: contact.unsubscribeToken,
      });
      const renderedText = renderTemplate(template.template.plainTextBody, {
        email: contact.email,
        businessName: contact.businessName,
        firstName: contact.firstName,
        category: contact.category,
        city: contact.city,
        cuisineType: contact.cuisineType,
        website: contact.website,
        phone: contact.phone,
        address: contact.address,
        zipCode: contact.zipCode,
        unsubscribeToken: contact.unsubscribeToken,
      });

      // h. Create OutreachSend record
      let send;
      try {
        send = await prisma.outreachSend.create({
          data: {
            campaignId: campaign.id,
            contactId: contact.id,
            templateId: template.templateId,
            accountId: account.id,
            renderedSubject,
            renderedHtml,
            status: "pending",
          },
        });
      } catch (err: unknown) {
        // Unique constraint violation — already sent to this contact in this campaign
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Unique constraint")) {
          result.details.push(`${campaign.name}: duplicate send prevented for ${contact.email}`);
          continue;
        }
        throw err;
      }

      // i. Send via nodemailer
      try {
        const transporter = createTransport(account);
        const fromStr = `${account.fromName} <${account.fromEmail}>`;
        const { messageId } = await sendEmail(transporter, {
          from: fromStr,
          to: contact.email,
          subject: renderedSubject,
          html: renderedHtml,
          text: renderedText,
          replyTo: account.replyTo || account.fromEmail,
        });

        // j. Update records — success
        await Promise.all([
          prisma.outreachSend.update({
            where: { id: send.id },
            data: { status: "sent", sentAt: now, messageId },
          }),
          prisma.emailAccount.update({
            where: { id: account.id },
            data: {
              sentToday: { increment: 1 },
              totalSent: { increment: 1 },
              consecutiveErrors: 0,
            },
          }),
          prisma.outreachContact.update({
            where: { id: contact.id },
            data: { status: "sent" },
          }),
          prisma.outreachCampaign.update({
            where: { id: campaign.id },
            data: {
              sentCount: { increment: 1 },
              lastSendAt: now,
            },
          }),
        ]);

        result.sent++;
        result.details.push(`${campaign.name}: sent to ${contact.email} via ${account.label}`);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);

        // Update records — failure
        await Promise.all([
          prisma.outreachSend.update({
            where: { id: send.id },
            data: { status: "failed", errorMessage: errMsg },
          }),
          prisma.emailAccount.update({
            where: { id: account.id },
            data: {
              consecutiveErrors: { increment: 1 },
              lastError: errMsg,
              lastErrorAt: now,
              // Auto-pause at 5 consecutive errors
              ...(account.consecutiveErrors + 1 >= 5 ? { status: "error" } : {}),
            },
          }),
          prisma.outreachCampaign.update({
            where: { id: campaign.id },
            data: {
              failedCount: { increment: 1 },
              lastSendAt: now,
            },
          }),
        ]);

        result.failed++;
        result.details.push(`${campaign.name}: FAILED ${contact.email} — ${errMsg}`);
      }
    }

    return result;
  } finally {
    sendCycleRunning = false;
  }
}

function selectWeightedTemplate(
  templates: { templateId: string; template: { id: string; subject: string; htmlBody: string; plainTextBody: string }; weight: number }[]
): (typeof templates)[0] | null {
  if (templates.length === 0) return null;
  const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of templates) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return templates[0];
}

function getHourInTimezone(date: Date, tz: string): number {
  try {
    const str = date.toLocaleString("en-US", { timeZone: tz, hour: "numeric", hour12: false });
    return parseInt(str);
  } catch {
    return date.getUTCHours();
  }
}

function getDayInTimezone(date: Date, tz: string): number {
  try {
    const str = date.toLocaleString("en-US", { timeZone: tz, weekday: "short" });
    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return dayMap[str] ?? date.getDay();
  } catch {
    return date.getDay();
  }
}
