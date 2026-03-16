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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

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
    totalFailed,
    totalBouncedSends,
    totalAttempted30d,
    activeCampaignDetails,
    distinctCategories,
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
        errorMessage: true,
        renderedSubject: true,
        renderedHtml: true,
        renderedText: true,
        contact: { select: { email: true, businessName: true } },
        template: { select: { name: true } },
        account: { select: { label: true } },
      },
    }),
    prisma.outreachSend.count({ where: { status: "failed" } }),
    prisma.outreachSend.count({ where: { status: "bounced" } }),
    prisma.outreachSend.count({
      where: {
        status: { in: ["sent", "bounced", "failed"] },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.outreachCampaign.findMany({
      where: { status: { in: ["active", "paused"] } },
      select: {
        id: true,
        name: true,
        status: true,
        sentCount: true,
        failedCount: true,
        totalContacts: true,
        lastSendAt: true,
        list: { select: { name: true, contactCount: true } },
      },
      orderBy: { lastSendAt: "desc" },
      take: 5,
    }),
    prisma.outreachContact.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  // Compute delivery metrics (last 30 days)
  const totalDelivered30d = totalAttempted30d - totalBouncedSends - totalFailed;
  const deliveryMetrics = {
    totalAttempted: totalAttempted30d,
    bounceRate: totalAttempted30d > 0 ? totalBouncedSends / totalAttempted30d : 0,
    failRate: totalAttempted30d > 0 ? totalFailed / totalAttempted30d : 0,
    deliveryRate: totalAttempted30d > 0 ? Math.max(0, totalDelivered30d) / totalAttempted30d : 1,
  };

  return NextResponse.json({
    totalContacts,
    totalSent,
    sentToday,
    sentThisWeek,
    activeCampaigns,
    totalBounced,
    totalUnsubscribed,
    accounts,
    categories: distinctCategories.map((c) => c.category),
    recentSends: recentSends.map((s) => ({
      id: s.id,
      contactEmail: s.contact.email,
      contactBusiness: s.contact.businessName,
      templateName: s.template.name,
      accountLabel: s.account.label,
      status: s.status,
      sentAt: s.sentAt,
      errorMessage: s.errorMessage,
      renderedSubject: s.renderedSubject,
      renderedHtml: s.renderedHtml,
      renderedText: s.renderedText,
    })),
    totalFailed,
    totalBouncedSends,
    deliveryMetrics,
    activeCampaignDetails: activeCampaignDetails.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      sentCount: c.sentCount,
      failedCount: c.failedCount,
      totalContacts: c.totalContacts,
      lastSendAt: c.lastSendAt,
      listName: c.list.name,
    })),
  });
}
