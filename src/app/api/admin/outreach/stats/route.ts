import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";

// GET — aggregated outreach KPIs
export async function GET() {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const [
    totalContacts,
    totalSent,
    sentToday,
    sentThisWeek,
    activeCampaigns,
    totalBounced,
    totalUnsubscribed,
    accounts,
    recentSends,
  ] = await Promise.all([
    prisma.outreachContact.count(),
    prisma.outreachSend.count({ where: { status: "sent" } }),
    prisma.outreachSend.count({ where: { status: "sent", sentAt: { gte: today } } }),
    prisma.outreachSend.count({ where: { status: "sent", sentAt: { gte: weekAgo } } }),
    prisma.outreachCampaign.count({ where: { status: "active" } }),
    prisma.outreachContact.count({ where: { status: "bounced" } }),
    prisma.outreachContact.count({ where: { status: "unsubscribed" } }),
    prisma.emailAccount.findMany({
      where: { isActive: true },
      select: {
        id: true,
        label: true,
        status: true,
        warmupPhase: true,
        warmupDay: true,
        dailyLimit: true,
        sentToday: true,
        totalSent: true,
        consecutiveErrors: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.outreachSend.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        status: true,
        sentAt: true,
        renderedSubject: true,
        renderedHtml: true,
        contact: { select: { email: true, businessName: true } },
        template: { select: { name: true } },
        account: { select: { label: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalContacts,
    totalSent,
    sentToday,
    sentThisWeek,
    activeCampaigns,
    totalBounced,
    totalUnsubscribed,
    accounts,
    recentSends: recentSends.map((s) => ({
      id: s.id,
      contactEmail: s.contact.email,
      contactBusiness: s.contact.businessName,
      templateName: s.template.name,
      accountLabel: s.account.label,
      status: s.status,
      sentAt: s.sentAt,
      renderedSubject: s.renderedSubject,
      renderedHtml: s.renderedHtml,
    })),
  });
}
