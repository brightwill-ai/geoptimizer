import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";
import { encrypt } from "@/lib/outreach/encryption";

// PATCH — update warmup pool settings + IMAP credentials
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};

  // Warmup pool settings
  if (body.warmupPoolEnabled !== undefined) updateData.warmupPoolEnabled = body.warmupPoolEnabled;
  if (body.warmupReplyRate !== undefined) updateData.warmupReplyRate = body.warmupReplyRate;
  if (body.warmupOpenRate !== undefined) updateData.warmupOpenRate = body.warmupOpenRate;
  if (body.warmupSpamRescueRate !== undefined) updateData.warmupSpamRescueRate = body.warmupSpamRescueRate;
  if (body.warmupImportantRate !== undefined) updateData.warmupImportantRate = body.warmupImportantRate;

  // IMAP credentials
  if (body.imapHost !== undefined) updateData.imapHost = body.imapHost;
  if (body.imapPort !== undefined) updateData.imapPort = body.imapPort;
  if (body.imapSecure !== undefined) updateData.imapSecure = body.imapSecure;
  if (body.imapUser !== undefined) updateData.imapUser = body.imapUser;
  if (body.imapPass !== undefined && body.imapPass !== "") {
    updateData.imapPass = encrypt(body.imapPass);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const account = await prisma.emailAccount.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      label: true,
      fromEmail: true,
      warmupPoolEnabled: true,
      warmupReplyRate: true,
      warmupOpenRate: true,
      warmupSpamRescueRate: true,
      warmupImportantRate: true,
      imapHost: true,
      imapPort: true,
      imapSecure: true,
      imapUser: true,
      imapStatus: true,
    },
  });

  return NextResponse.json(account);
}
