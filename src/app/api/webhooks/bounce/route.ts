import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/app/api/admin/auth";

// POST /api/webhooks/bounce
// Marks contacts as bounced by email, email array, or messageId.
// Auth: admin cookie OR Bearer CRON_SECRET (same dual-auth as send route)
export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    const authHeader = req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json();
  const results: { email: string; status: string }[] = [];

  // Collect emails to process
  let emailsToProcess: string[] = [];

  if (body.email) {
    emailsToProcess = [body.email.toLowerCase().trim()];
  } else if (body.emails && Array.isArray(body.emails)) {
    emailsToProcess = body.emails.map((e: string) => e.toLowerCase().trim());
  } else if (body.messageId) {
    const send = await prisma.outreachSend.findFirst({
      where: { messageId: body.messageId },
      include: { contact: { select: { email: true } } },
    });
    if (send) {
      emailsToProcess = [send.contact.email];
    } else {
      return NextResponse.json({ error: "Send not found for messageId" }, { status: 404 });
    }
  } else {
    return NextResponse.json({ error: "Provide email, emails[], or messageId" }, { status: 400 });
  }

  for (const email of emailsToProcess) {
    const contact = await prisma.outreachContact.findUnique({
      where: { email },
    });

    if (!contact) {
      results.push({ email, status: "not_found" });
      continue;
    }

    if (contact.status === "bounced") {
      results.push({ email, status: "already_bounced" });
      continue;
    }

    // Mark contact as bounced
    await prisma.outreachContact.update({
      where: { id: contact.id },
      data: { status: "bounced" },
    });

    // Mark their "sent" OutreachSend records as bounced too
    await prisma.outreachSend.updateMany({
      where: { contactId: contact.id, status: "sent" },
      data: { status: "bounced" },
    });

    results.push({ email, status: "marked_bounced" });
  }

  return NextResponse.json({ processed: results.length, results });
}
