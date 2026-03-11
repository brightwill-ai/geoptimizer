import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runComprehensiveAudit } from "@/lib/agents/runner";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const analysisId = session.metadata?.analysisId;
      const email = session.customer_email;

      if (!analysisId) {
        console.error("Webhook: missing analysisId in metadata");
        return NextResponse.json({ received: true });
      }

      const analysis = await prisma.analysis.findUnique({
        where: { id: analysisId },
      });
      if (!analysis) {
        console.error(`Webhook: analysis ${analysisId} not found`);
        return NextResponse.json({ received: true });
      }

      // Mark as paid
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          paid: true,
          stripeSessionId: session.id,
          paidAt: new Date(),
        },
      });

      // Check if comprehensive audit already kicked off (by the redirect-back flow)
      const existingComprehensive = await prisma.analysis.findFirst({
        where: {
          businessName: analysis.businessName,
          location: analysis.location,
          tier: "comprehensive",
          status: { in: ["pending", "running", "complete"] },
          expiresAt: { gt: new Date() },
        },
      });

      // Only kick off if not already running (redirect-back flow handles it primarily)
      if (!existingComprehensive) {
        // Upsert user
        const user = email
          ? await prisma.user.upsert({
              where: { email },
              create: { email },
              update: {},
            })
          : null;

        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
        const comprehensive = await prisma.analysis.create({
          data: {
            userId: user?.id,
            businessName: analysis.businessName,
            location: analysis.location,
            category: analysis.category,
            tier: "comprehensive",
            status: "pending",
            paid: true,
            stripeSessionId: session.id,
            paidAt: new Date(),
            expiresAt,
            llmJobs: {
              create: LLM_PROVIDERS.map((p) => ({
                provider: p.id,
                status: "pending",
              })),
            },
          },
        });

        runComprehensiveAudit(
          comprehensive.id,
          analysis.businessName,
          analysis.location,
          analysis.category
        ).catch((err: unknown) => {
          console.error(
            `Webhook: comprehensive analysis ${comprehensive.id} failed:`,
            err
          );
          prisma.analysis
            .update({
              where: { id: comprehensive.id },
              data: { status: "failed", errorMessage: String(err) },
            })
            .catch(console.error);
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("POST /api/webhooks/stripe error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
