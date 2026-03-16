import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";

// GET — paginated warmup activity log
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
  const skip = (page - 1) * limit;

  const [emails, total] = await Promise.all([
    prisma.warmupEmail.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        senderAccount: { select: { fromEmail: true, label: true, fromName: true } },
        receiverAccount: { select: { fromEmail: true, label: true, fromName: true } },
        conversation: { select: { topicKey: true, threadId: true, turnCount: true, maxTurns: true } },
      },
    }),
    prisma.warmupEmail.count(),
  ]);

  const items = emails.map((e) => ({
    id: e.id,
    conversationId: e.conversationId,
    topicKey: e.conversation.topicKey,
    threadId: e.conversation.threadId,
    turnNumber: e.turnNumber,
    totalTurns: e.conversation.maxTurns,
    fromEmail: e.senderAccount.fromEmail,
    fromLabel: e.senderAccount.label,
    toEmail: e.receiverAccount.fromEmail,
    toLabel: e.receiverAccount.label,
    subject: e.subject,
    bodyText: e.bodyText,
    status: e.status,
    sentAt: e.sentAt?.toISOString() || null,
    opened: e.opened,
    openedAt: e.openedAt?.toISOString() || null,
    replied: e.replied,
    spamRescued: e.spamRescued,
    markedImportant: e.markedImportant,
  }));

  return NextResponse.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}
