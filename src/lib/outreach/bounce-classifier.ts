// Classifies SMTP errors into permanent bounces vs transient failures
// Permanent bounces → mark contact as "bounced" (excluded from future sends)
// Transient failures → mark as "failed" (may retry)

const PERMANENT_BOUNCE_CODES = [550, 551, 552, 553, 554];
const TRANSIENT_CODES = [421, 450, 451, 452];

const PERMANENT_PATTERNS = [
  "address not found",
  "user unknown",
  "mailbox not found",
  "no such user",
  "does not exist",
  "invalid recipient",
  "recipient rejected",
  "undeliverable",
  "unknown user",
  "account has been disabled",
  "mailbox unavailable",
  "address rejected",
  "relay not permitted",
  "no mailbox here",
  "user not found",
];

export type BounceClassification = "permanent_bounce" | "transient_failure" | "unknown_error";

export function classifySmtpError(error: unknown): BounceClassification {
  const msg = typeof error === "string" ? error : error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();

  for (const code of PERMANENT_BOUNCE_CODES) {
    if (msg.includes(String(code))) return "permanent_bounce";
  }

  for (const pattern of PERMANENT_PATTERNS) {
    if (lower.includes(pattern)) return "permanent_bounce";
  }

  for (const code of TRANSIENT_CODES) {
    if (msg.includes(String(code))) return "transient_failure";
  }

  return "unknown_error";
}
