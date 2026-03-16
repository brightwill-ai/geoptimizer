import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/app/api/admin/auth";
import { runWarmupCycle } from "@/lib/outreach/warmup-engine";

// POST — trigger warmup cycle (admin cookie OR Bearer CRON_SECRET)
export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    const authHeader = req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runWarmupCycle();
  return NextResponse.json(result);
}
