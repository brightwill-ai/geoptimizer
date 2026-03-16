import { ImapFlow } from "imapflow";
import { decrypt } from "./encryption";

interface ImapAccountConfig {
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  imapUser: string;
  imapPass: string; // encrypted
  fromEmail: string;
}

export interface WarmupSearchResult {
  uid: number;
  mailbox: string; // "INBOX" or spam folder name
  messageId?: string;
}

export function createImapClient(account: ImapAccountConfig): ImapFlow {
  const password = decrypt(account.imapPass);
  return new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapSecure,
    auth: {
      user: account.imapUser,
      pass: password,
    },
    logger: false,
    emitLogs: false,
  });
}

const SPAM_FOLDER_NAMES = [
  "[Gmail]/Spam",
  "Junk",
  "Spam",
  "Junk E-mail",
  "Bulk Mail",
  "[Gmail]/Junk",
];

export async function getSpamFolder(client: ImapFlow): Promise<string | null> {
  const mailboxes = await client.list();
  // Check by special-use flag first
  for (const mb of mailboxes) {
    if (mb.specialUse === "\\Junk") {
      return mb.path;
    }
  }
  // Fallback: check by name
  const paths = mailboxes.map((m) => m.path);
  for (const name of SPAM_FOLDER_NAMES) {
    if (paths.includes(name)) return name;
  }
  return null;
}

export async function findWarmupEmail(
  client: ImapFlow,
  warmupId: string,
  messageIdFallback?: string
): Promise<WarmupSearchResult | null> {
  // Search INBOX first
  const inboxResult = await searchInMailbox(client, "INBOX", warmupId, messageIdFallback);
  if (inboxResult) return inboxResult;

  // Search spam folder
  const spamFolder = await getSpamFolder(client);
  if (spamFolder) {
    const spamResult = await searchInMailbox(client, spamFolder, warmupId, messageIdFallback);
    if (spamResult) return spamResult;
  }

  return null;
}

async function searchInMailbox(
  client: ImapFlow,
  mailbox: string,
  warmupId: string,
  messageIdFallback?: string
): Promise<WarmupSearchResult | null> {
  try {
    const lock = await client.getMailboxLock(mailbox);
    try {
      // Search by X-Warmup-Id header
      const rawResults = await client.search({ header: { "X-Warmup-Id": warmupId } });
      const results = Array.isArray(rawResults) ? rawResults : [];
      if (results.length > 0) {
        return { uid: results[0], mailbox };
      }

      // Fallback: search by Message-ID
      if (messageIdFallback) {
        const msgIdClean = messageIdFallback.replace(/[<>]/g, "");
        const rawFallback = await client.search({
          header: { "Message-ID": msgIdClean },
        });
        const fallbackResults = Array.isArray(rawFallback) ? rawFallback : [];
        if (fallbackResults.length > 0) {
          return { uid: fallbackResults[0], mailbox };
        }
      }
    } finally {
      lock.release();
    }
  } catch {
    // Mailbox might not exist or access denied
  }
  return null;
}

export async function markAsRead(
  client: ImapFlow,
  uid: number,
  mailbox: string
): Promise<void> {
  const lock = await client.getMailboxLock(mailbox);
  try {
    await client.messageFlagsAdd({ uid }, ["\\Seen"], { uid: true });
  } finally {
    lock.release();
  }
}

export async function markAsImportant(
  client: ImapFlow,
  uid: number,
  mailbox: string
): Promise<void> {
  const lock = await client.getMailboxLock(mailbox);
  try {
    await client.messageFlagsAdd({ uid }, ["\\Flagged"], { uid: true });
  } finally {
    lock.release();
  }
}

export async function moveFromSpamToInbox(
  client: ImapFlow,
  uid: number,
  spamMailbox: string
): Promise<void> {
  const lock = await client.getMailboxLock(spamMailbox);
  try {
    await client.messageMove({ uid }, "INBOX", { uid: true });
  } finally {
    lock.release();
  }
}

export async function testImapConnection(
  account: ImapAccountConfig
): Promise<{ success: boolean; error?: string }> {
  const client = createImapClient(account);
  try {
    await client.connect();
    // Try listing INBOX to verify access
    const lock = await client.getMailboxLock("INBOX");
    lock.release();
    await client.logout();
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    try {
      await client.logout();
    } catch {
      // Already disconnected
    }
    return { success: false, error: msg };
  }
}
