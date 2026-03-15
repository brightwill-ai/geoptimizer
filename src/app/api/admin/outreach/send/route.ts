import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/app/api/admin/auth";
import { runSendCycle } from "@/lib/outreach/send-engine";

// POST — cron-triggered send cycle
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

  const result = await runSendCycle();
  return NextResponse.json(result);
}
