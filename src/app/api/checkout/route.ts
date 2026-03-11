import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

const CheckoutInput = z.object({
  analysisId: z.string(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CheckoutInput.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { analysisId, email } = parsed.data;

    // Verify analysis exists
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
    });
    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Dev bypass: skip Stripe, return fake redirect to trigger claim directly
    if (process.env.NODE_ENV === "development") {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const successUrl = `${appUrl}/analyze?session_id=dev_bypass&analysis_id=${analysisId}&email=${encodeURIComponent(email)}`;
      return NextResponse.json({ url: successUrl });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${appUrl}/analyze?session_id={CHECKOUT_SESSION_ID}&analysis_id=${analysisId}`,
      cancel_url: `${appUrl}/analyze?cancelled=true&analysis_id=${analysisId}`,
      metadata: {
        analysisId,
        businessName: analysis.businessName,
        location: analysis.location,
        category: analysis.category,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
