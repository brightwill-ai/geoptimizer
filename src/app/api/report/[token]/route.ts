import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const analysis = await prisma.analysis.findUnique({
      where: { shareToken: token },
      include: {
        llmJobs: {
          select: {
            provider: true,
            status: true,
          },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check expiry
    if (analysis.expiresAt && new Date() > analysis.expiresAt) {
      return NextResponse.json({ error: "Report has expired" }, { status: 410 });
    }

    const jobStatuses = analysis.llmJobs.reduce(
      (acc, j) => {
        acc[j.provider] = j.status;
        return acc;
      },
      {} as Record<string, string>
    );

    const response: Record<string, unknown> = {
      id: analysis.id,
      status: analysis.status,
      tier: analysis.tier,
      businessName: analysis.businessName,
      location: analysis.location,
      jobStatuses,
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
    console.error("GET /api/report/[token] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
