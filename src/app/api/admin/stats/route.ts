import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "../auth";

export async function GET() {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalAnalyses,
      paidAnalyses,
      strategyAnalyses,
      signupsThisWeek,
      freeAnalyses,
      recentPaid,
      recentFree,
      recentSignups,
    ] = await Promise.all([
      prisma.analysis.count(),
      prisma.analysis.count({ where: { paid: true, priceTier: "full_audit" } }),
      prisma.analysis.count({ where: { paid: true, priceTier: "audit_strategy" } }),
      prisma.signup.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.analysis.count({ where: { tier: "fast" } }),
      prisma.analysis.findMany({
        where: { paid: true },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.analysis.findMany({
        where: { tier: "fast" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.signup.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const revenue = paidAnalyses * 99 + strategyAnalyses * 199;
    const totalPaid = paidAnalyses + strategyAnalyses;
    const conversionRate =
      freeAnalyses > 0 ? ((totalPaid / freeAnalyses) * 100).toFixed(1) : "0";

    return NextResponse.json({
      kpis: {
        totalAnalyses,
        paidCount: totalPaid,
        fullAuditCount: paidAnalyses,
        strategyCount: strategyAnalyses,
        revenue,
        signupsThisWeek,
        conversionRate,
      },
      recentPaid: recentPaid.map((a) => ({
        id: a.id,
        businessName: a.businessName,
        location: a.location,
        priceTier: a.priceTier,
        status: a.status,
        shareToken: a.shareToken,
        stripeSessionId: a.stripeSessionId,
        actionPlanStatus: a.actionPlanStatus,
        recommendationProbability: a.recommendationProbability,
        createdAt: a.createdAt,
        paidAt: a.paidAt,
        userName: a.user?.name || null,
        userEmail: a.user?.email || null,
      })),
      recentFree: recentFree.map((a) => ({
        id: a.id,
        businessName: a.businessName,
        location: a.location,
        status: a.status,
        recommendationProbability: a.recommendationProbability,
        createdAt: a.createdAt,
      })),
      recentSignups: recentSignups.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        businessName: s.businessName,
        website: s.website,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
