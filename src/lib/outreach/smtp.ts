import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { decrypt } from "./encryption";

interface AccountConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string; // encrypted
  fromName: string;
  fromEmail: string;
  replyTo?: string | null;
}

export function createTransport(account: AccountConfig): Transporter {
  const password = decrypt(account.smtpPass);
  return nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpSecure,
    auth: {
      user: account.smtpUser,
      pass: password,
    },
  });
}

interface SendOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(
  transporter: Transporter,
  options: SendOptions
): Promise<{ messageId: string }> {
  const info = await transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });
  return { messageId: info.messageId };
}
