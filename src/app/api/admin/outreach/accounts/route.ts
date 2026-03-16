import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";
import { encrypt } from "@/lib/outreach/encryption";

// GET — list all accounts
export async function GET() {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const accounts = await prisma.emailAccount.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      accountType: true,
      smtpHost: true,
      smtpPort: true,
      smtpSecure: true,
      smtpUser: true,
      fromName: true,
      fromEmail: true,
      replyTo: true,
      warmupEnabled: true,
      warmupStartDate: true,
      warmupDay: true,
      warmupPhase: true,
      dailyLimit: true,
      sentToday: true,
      sentTodayDate: true,
      imapHost: true,
      imapPort: true,
      imapSecure: true,
      imapUser: true,
      imapStatus: true,
      warmupPoolEnabled: true,
      warmupPoolDay: true,
      warmupDailyTarget: true,
      warmupSentToday: true,
      warmupReplyRate: true,
      warmupOpenRate: true,
      warmupSpamRescueRate: true,
      warmupImportantRate: true,
      status: true,
      lastError: true,
      lastErrorAt: true,
      consecutiveErrors: true,
      totalSent: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(accounts);
}

// POST — create new account
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const body = await req.json();
  const {
    label, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, fromName, fromEmail, replyTo, warmupEnabled,
    accountType, imapHost, imapPort, imapSecure, imapUser, imapPass, warmupPoolEnabled,
  } = body;

  if (!smtpUser || !smtpPass || !fromEmail) {
    return NextResponse.json({ error: "smtpUser, smtpPass, and fromEmail are required" }, { status: 400 });
  }

  const encryptedPass = encrypt(smtpPass);

  const account = await prisma.emailAccount.create({
    data: {
      label: label || fromEmail,
      smtpHost: smtpHost || "smtp.zoho.com",
      smtpPort: smtpPort || 465,
      smtpSecure: smtpSecure ?? true,
      smtpUser,
      smtpPass: encryptedPass,
      fromName: fromName || "William",
      fromEmail,
      replyTo: replyTo || null,
      warmupEnabled: warmupEnabled ?? true,
      accountType: accountType || "outreach",
      ...(imapHost ? { imapHost } : {}),
      ...(imapPort ? { imapPort } : {}),
      ...(imapSecure !== undefined ? { imapSecure } : {}),
      ...(imapUser ? { imapUser } : {}),
      ...(imapPass ? { imapPass: encrypt(imapPass) } : {}),
      ...(warmupPoolEnabled !== undefined ? { warmupPoolEnabled } : {}),
    },
  });

  return NextResponse.json(account, { status: 201 });
}
