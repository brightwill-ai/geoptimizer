import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { runComprehensiveAudit } from "@/lib/agents/runner";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

const ClaimInput = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  stripeSessionId: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = ClaimInput.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, name, stripeSessionId } = parsed.data;

    // In production, require Stripe payment verification
    if (process.env.NODE_ENV !== "development" && stripeSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(
          stripeSessionId
        );
        if (session.payment_status !== "paid") {
          return NextResponse.json(
            { error: "Payment not completed" },
            { status: 402 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid payment session" },
          { status: 402 }
        );
      }
    } else if (
      process.env.NODE_ENV !== "development" &&
      !stripeSessionId
    ) {
      return NextResponse.json(
        { error: "Payment required" },
        { status: 402 }
      );
    }

    // Verify analysis exists
    const analysis = await prisma.analysis.findUnique({ where: { id } });
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, name },
      update: { name: name || undefined },
    });

    // Link analysis to user
    await prisma.analysis.update({
      where: { id },
      data: { userId: user.id },
    });

    // Check for existing comprehensive report
    const existingComprehensive = await prisma.analysis.findFirst({
      where: {
        businessName: analysis.businessName,
        location: analysis.location,
        tier: "comprehensive",
        status: { in: ["pending", "running", "complete"] },
        expiresAt: { gt: new Date() },
      },
    });

    let comprehensiveAnalysisId = existingComprehensive?.id;

    // Kick off comprehensive report if none exists
    if (!existingComprehensive) {
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const comprehensive = await prisma.analysis.create({
        data: {
          userId: user.id,
          businessName: analysis.businessName,
          location: analysis.location,
          category: analysis.category,
          tier: "comprehensive",
          status: "pending",
          paid: !!stripeSessionId || process.env.NODE_ENV === "development",
          stripeSessionId: stripeSessionId || null,
          paidAt: stripeSessionId ? new Date() : null,
          expiresAt,
          llmJobs: {
            create: LLM_PROVIDERS.map((p) => ({
              provider: p.id,
              status: "pending",
            })),
          },
        },
      });

      comprehensiveAnalysisId = comprehensive.id;

      // Fire and forget
      runComprehensiveAudit(
        comprehensive.id,
        analysis.businessName,
        analysis.location,
        analysis.category
      ).catch((err: unknown) => {
        console.error(`Comprehensive analysis ${comprehensive.id} failed:`, err);
        prisma.analysis
          .update({
            where: { id: comprehensive.id },
            data: { status: "failed", errorMessage: String(err) },
          })
          .catch(console.error);
      });
    }

    return NextResponse.json({
      userId: user.id,
      comprehensiveAnalysisId,
    });
  } catch (err) {
    console.error("POST /api/analysis/[id]/claim error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
