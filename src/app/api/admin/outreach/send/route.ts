import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/app/api/admin/auth";
import { runSendCycle } from "@/lib/outreach/send-engine";
import { runWarmupCycle } from "@/lib/outreach/warmup-engine";

// POST — cron-triggered send cycle + warmup cycle
// Auth: admin cookie OR Bearer CRON_SECRET
export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    // Check for cron secret in Authorization header
    const authHeader = req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Run both cycles in parallel
  const [sendResult, warmupResult] = await Promise.allSettled([
    runSendCycle(),
    runWarmupCycle(),
  ]);

  return NextResponse.json({
    outreach: sendResult.status === "fulfilled" ? sendResult.value : { error: String((sendResult as PromiseRejectedResult).reason) },
    warmup: warmupResult.status === "fulfilled" ? warmupResult.value : { error: String((warmupResult as PromiseRejectedResult).reason) },
  });
}
