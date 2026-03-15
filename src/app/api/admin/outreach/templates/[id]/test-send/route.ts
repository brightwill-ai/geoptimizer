import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";
import { renderTemplate, SAMPLE_CONTACT } from "@/lib/outreach/renderer";
import { createTransport, sendEmail } from "@/lib/outreach/smtp";

type Params = { params: Promise<{ id: string }> };

// POST — send test email using a rendered template via selected SMTP account
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;

  const body = await req.json();
  const { testEmail, accountId } = body;

  if (!testEmail || !accountId) {
    return NextResponse.json({ error: "testEmail and accountId are required" }, { status: 400 });
  }

  const [template, account] = await Promise.all([
    prisma.outreachTemplate.findUnique({ where: { id } }),
    prisma.emailAccount.findUnique({ where: { id: accountId } }),
  ]);

  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const contact = { ...SAMPLE_CONTACT, ...body.sampleData };
  const subject = renderTemplate(template.subject, contact);
  const html = renderTemplate(template.htmlBody, contact);
  const text = renderTemplate(template.plainTextBody, contact);

  try {
    const transporter = createTransport(account);
    const { messageId } = await sendEmail(transporter, {
      from: `${account.fromName} <${account.fromEmail}>`,
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html,
      text,
      replyTo: account.replyTo || account.fromEmail,
    });

    return NextResponse.json({ success: true, messageId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
