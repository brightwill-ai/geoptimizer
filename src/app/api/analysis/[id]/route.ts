import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        llmJobs: {
          select: {
            provider: true,
            status: true,
            parsedJson: true,
            completedAt: true,
          },
        },
        queryExecutions: {
          select: {
            id: true,
            provider: true,
            promptSent: true,
            status: true,
            businessMentioned: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const completedJobs = analysis.llmJobs.filter((j) => j.status === "complete");
    const totalJobs = analysis.llmJobs.length;

    // Build progress info
    const jobStatuses = analysis.llmJobs.reduce(
      (acc, j) => {
        acc[j.provider] = j.status;
        return acc;
      },
      {} as Record<string, string>
    );

    // Query execution progress
    const totalQueries = analysis.queryCount || analysis.queryExecutions.length;
    const completedQueries = analysis.queryExecutions.filter(
      (q: { status: string }) => q.status === "complete" || q.status === "failed"
    ).length;
    const currentQuery = analysis.queryExecutions.find((q: { status: string }) => q.status === "pending");

    const response: Record<string, unknown> = {
      id: analysis.id,
      status: analysis.status,
      tier: analysis.tier,
      businessName: analysis.businessName,
      location: analysis.location,
      progress: `${completedJobs.length} of ${totalJobs}`,
      jobStatuses,
      queryProgress: {
        completed: completedQueries,
        total: totalQueries,
        currentQueryText: currentQuery?.promptSent || null,
      },
      createdAt: analysis.createdAt,
    };

    if (analysis.status === "complete" && analysis.resultJson) {
      response.result = JSON.parse(analysis.resultJson);
    }

    if (analysis.status === "failed") {
      response.errorMessage = analysis.errorMessage;
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/analysis/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
