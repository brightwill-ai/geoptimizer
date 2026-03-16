import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";

export async function GET() {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const today = new Date().toISOString().slice(0, 10);

  // Get pool accounts
  const poolAccounts = await prisma.emailAccount.findMany({
    where: { warmupPoolEnabled: true, isActive: true },
    select: {
      id: true,
      label: true,
      fromEmail: true,
      fromName: true,
      accountType: true,
      warmupPoolDay: true,
      warmupDailyTarget: true,
      warmupSentToday: true,
      warmupReplyRate: true,
      warmupOpenRate: true,
      warmupSpamRescueRate: true,
      warmupImportantRate: true,
      imapStatus: true,
      imapHost: true,
      imapLastError: true,
      status: true,
    },
  });

  // Get today's stats per account
  const todayStats = await prisma.warmupDailyStats.findMany({
    where: { date: today },
  });

  const todayStatsMap = new Map(todayStats.map((s) => [s.accountId, s]));

  // Aggregate today totals
  const totals = todayStats.reduce(
    (acc, s) => ({
      emailsSent: acc.emailsSent + s.emailsSent,
      emailsReceived: acc.emailsReceived + s.emailsReceived,
      opens: acc.opens + s.opens,
      replies: acc.replies + s.replies,
      spamRescues: acc.spamRescues + s.spamRescues,
      markedImportant: acc.markedImportant + s.markedImportant,
    }),
    { emailsSent: 0, emailsReceived: 0, opens: 0, replies: 0, spamRescues: 0, markedImportant: 0 }
  );

  // Active conversations count
  const activeConversations = await prisma.warmupConversation.count({
    where: { status: "active" },
  });

  const totalConversations = await prisma.warmupConversation.count();

  // 7-day chart data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const chartStats = await prisma.warmupDailyStats.groupBy({
    by: ["date"],
    where: { date: { gte: sevenDaysAgo.toISOString().slice(0, 10) } },
    _sum: {
      emailsSent: true,
      emailsReceived: true,
      opens: true,
      replies: true,
      spamRescues: true,
      markedImportant: true,
    },
    orderBy: { date: "asc" },
  });

  const dailyChart = chartStats.map((d) => ({
    date: d.date,
    sent: d._sum.emailsSent || 0,
    received: d._sum.emailsReceived || 0,
    opens: d._sum.opens || 0,
    replies: d._sum.replies || 0,
    spamRescues: d._sum.spamRescues || 0,
  }));

  // Recent activity
  const recentEmails = await prisma.warmupEmail.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      senderAccount: { select: { fromEmail: true, label: true } },
      receiverAccount: { select: { fromEmail: true, label: true } },
    },
  });

  const recentActivity = recentEmails.map((e) => ({
    id: e.id,
    fromEmail: e.senderAccount.fromEmail,
    toEmail: e.receiverAccount.fromEmail,
    subject: e.subject,
    bodyText: e.bodyText,
    turnNumber: e.turnNumber,
    sentAt: e.sentAt?.toISOString() || null,
    opened: e.opened,
    openedAt: e.openedAt?.toISOString() || null,
    replied: e.replied,
    repliedAt: e.repliedAt?.toISOString() || null,
    spamRescued: e.spamRescued,
    spamRescuedAt: e.spamRescuedAt?.toISOString() || null,
    markedImportant: e.markedImportant,
    markedImportantAt: e.markedImportantAt?.toISOString() || null,
    status: e.status,
  }));

  // Build account stats
  const accountStats = poolAccounts.map((a) => {
    const stats = todayStatsMap.get(a.id);
    return {
      ...a,
      todayStats: {
        sent: stats?.emailsSent || 0,
        received: stats?.emailsReceived || 0,
        opens: stats?.opens || 0,
        replies: stats?.replies || 0,
        spamRescues: stats?.spamRescues || 0,
        markedImportant: stats?.markedImportant || 0,
      },
    };
  });

  return NextResponse.json({
    poolSize: poolAccounts.length,
    totalConversations,
    activeConversations,
    emailsSentToday: totals.emailsSent,
    emailsReceivedToday: totals.emailsReceived,
    opensToday: totals.opens,
    repliesToday: totals.replies,
    spamRescuesToday: totals.spamRescues,
    markedImportantToday: totals.markedImportant,
    accountStats,
    recentActivity,
    dailyChart,
  });
}
