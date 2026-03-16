import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";
import { testImapConnection } from "@/lib/outreach/imap";

// POST — test IMAP connection for an account
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const { id } = await params;

  const account = await prisma.emailAccount.findUnique({
    where: { id },
    select: {
      imapHost: true,
      imapPort: true,
      imapSecure: true,
      imapUser: true,
      imapPass: true,
      fromEmail: true,
    },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (!account.imapHost || !account.imapUser || !account.imapPass) {
    return NextResponse.json({ error: "IMAP credentials not configured" }, { status: 400 });
  }

  const result = await testImapConnection({
    imapHost: account.imapHost,
    imapPort: account.imapPort || 993,
    imapSecure: account.imapSecure,
    imapUser: account.imapUser,
    imapPass: account.imapPass,
    fromEmail: account.fromEmail,
  });

  // Update IMAP status
  await prisma.emailAccount.update({
    where: { id },
    data: {
      imapStatus: result.success ? "connected" : "error",
      imapLastError: result.error || null,
      imapLastCheckedAt: new Date(),
    },
  });

  return NextResponse.json(result);
}
