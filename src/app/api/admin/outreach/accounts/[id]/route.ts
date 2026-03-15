import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";
import { encrypt } from "@/lib/outreach/encryption";
import { createTransport, sendEmail } from "@/lib/outreach/smtp";

type Params = { params: Promise<{ id: string }> };

// PATCH — update account settings / pause / resume
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};

  if (body.label !== undefined) data.label = body.label;
  if (body.smtpHost !== undefined) data.smtpHost = body.smtpHost;
  if (body.smtpPort !== undefined) data.smtpPort = body.smtpPort;
  if (body.smtpSecure !== undefined) data.smtpSecure = body.smtpSecure;
  if (body.smtpUser !== undefined) data.smtpUser = body.smtpUser;
  if (body.smtpPass !== undefined) data.smtpPass = encrypt(body.smtpPass);
  if (body.fromName !== undefined) data.fromName = body.fromName;
  if (body.fromEmail !== undefined) data.fromEmail = body.fromEmail;
  if (body.replyTo !== undefined) data.replyTo = body.replyTo || null;
  if (body.warmupEnabled !== undefined) data.warmupEnabled = body.warmupEnabled;
  if (body.dailyLimit !== undefined) data.dailyLimit = body.dailyLimit;
  if (body.status !== undefined) data.status = body.status;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  // Reset consecutive errors when resuming
  if (body.status === "active") {
    data.consecutiveErrors = 0;
    data.lastError = null;
  }

  const account = await prisma.emailAccount.update({ where: { id }, data });
  return NextResponse.json(account);
}

// DELETE — soft-delete (set isActive = false)
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;

  await prisma.emailAccount.update({
    where: { id },
    data: { isActive: false, status: "disabled" },
  });

  return NextResponse.json({ success: true });
}

// POST — test send
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;
  const body = await req.json();
  const { testEmail } = body;

  if (!testEmail) {
    return NextResponse.json({ error: "testEmail is required" }, { status: 400 });
  }

  const account = await prisma.emailAccount.findUnique({ where: { id } });
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  try {
    const transporter = createTransport(account);
    const { messageId } = await sendEmail(transporter, {
      from: `${account.fromName} <${account.fromEmail}>`,
      to: testEmail,
      subject: "BrightWill SMTP Test",
      html: `<div style="font-family: -apple-system, sans-serif; font-size: 14px; color: #1a1a1a; max-width: 560px;">
        <p>This is a test email from your BrightWill outreach account.</p>
        <p><strong>Account:</strong> ${account.label}</p>
        <p><strong>SMTP:</strong> ${account.smtpHost}:${account.smtpPort}</p>
        <p style="color: #16a34a;">SMTP connection successful.</p>
      </div>`,
      text: `BrightWill SMTP Test\n\nAccount: ${account.label}\nSMTP: ${account.smtpHost}:${account.smtpPort}\n\nSMTP connection successful.`,
      replyTo: account.replyTo || account.fromEmail,
    });

    return NextResponse.json({ success: true, messageId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
