import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { runFreeAudit, runComprehensiveAudit } from "@/lib/agents/runner";
import { LLM_PROVIDERS } from "@/lib/mock-data";

const AnalysisInput = z.object({
  businessName: z.string().min(1).max(200),
  location: z.string().max(200).default(""),
  category: z.string().min(1).max(100).default("restaurant"),
  tier: z.enum(["fast", "comprehensive"]).default("fast"),
  businessScope: z.enum(["local", "digital", "hybrid"]).default("local"),
  productDescription: z.string().max(500).optional(),
  targetAudience: z.string().max(300).optional(),
});

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limit
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = AnalysisInput.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { businessName, location, category, tier, businessScope, productDescription, targetAudience } = parsed.data;
    const normalizedName = businessName.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();
    const normalizedCategory = category.trim().toLowerCase();

    // Cache check: only for free tier (24h). Paid audits always run fresh via /claim.
    if (tier === "fast") {
      const cached = await prisma.analysis.findFirst({
        where: {
          businessName: normalizedName,
          location: normalizedLocation,
          category: normalizedCategory,
          tier: "fast",
          status: "complete",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (cached) {
        return NextResponse.json({
          id: cached.id,
          status: "complete",
          result: cached.resultJson ? JSON.parse(cached.resultJson) : null,
        });
      }
    }

    // Free audits expire after 24h. Comprehensive audits created here are unpaid
    // (paid ones go through /claim with expiresAt: null).
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create analysis and LLM jobs
    // Free tier: 1 job (ChatGPT only). Comprehensive: 3 jobs (all providers).
    const providers = tier === "fast"
      ? [LLM_PROVIDERS[0]] // ChatGPT only
      : LLM_PROVIDERS;

    const analysis = await prisma.analysis.create({
      data: {
        businessName: normalizedName,
        location: normalizedLocation,
        category: normalizedCategory,
        businessScope,
        productDescription: productDescription || null,
        targetAudience: targetAudience || null,
        tier,
        status: "pending",
        expiresAt,
        llmJobs: {
          create: providers.map((p) => ({
            provider: p.id,
            status: "pending",
          })),
        },
      },
    });

    // Fire and forget — use the appropriate runner for the tier
    const digitalOpts = { businessScope, productDescription, targetAudience };
    const runner = tier === "fast"
      ? runFreeAudit(analysis.id, businessName, location, normalizedCategory, digitalOpts)
      : runComprehensiveAudit(analysis.id, businessName, location, normalizedCategory, digitalOpts);

    runner.catch((err) => {
      console.error(`Analysis ${analysis.id} failed:`, err);
      prisma.analysis
        .update({
          where: { id: analysis.id },
          data: { status: "failed", errorMessage: String(err) },
        })
        .catch(console.error);
    });

    return NextResponse.json(
      { id: analysis.id, status: "pending" },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/analysis error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
