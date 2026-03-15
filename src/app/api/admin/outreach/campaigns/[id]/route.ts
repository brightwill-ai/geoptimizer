import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";

type Params = { params: Promise<{ id: string }> };

// GET — campaign send log
export async function GET(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const [sends, total] = await Promise.all([
    prisma.outreachSend.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        contact: { select: { email: true, businessName: true } },
        template: { select: { name: true } },
        account: { select: { label: true } },
      },
    }),
    prisma.outreachSend.count({ where: { campaignId: id } }),
  ]);

  return NextResponse.json({ sends, total, page, limit });
}

// PATCH — update/start/pause campaign
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;
  const body = await req.json();

  if (body.action === "start") {
    const campaign = await prisma.outreachCampaign.update({
      where: { id },
      data: { status: "active", startedAt: new Date(), pausedAt: null },
    });
    return NextResponse.json(campaign);
  }

  if (body.action === "pause") {
    const campaign = await prisma.outreachCampaign.update({
      where: { id },
      data: { status: "paused", pausedAt: new Date() },
    });
    return NextResponse.json(campaign);
  }

  // General settings update
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.delayMinutes !== undefined) data.delayMinutes = body.delayMinutes;
  if (body.jitterSeconds !== undefined) data.jitterSeconds = body.jitterSeconds;
  if (body.skipWeekends !== undefined) data.skipWeekends = body.skipWeekends;
  if (body.sendWindowStart !== undefined) data.sendWindowStart = body.sendWindowStart;
  if (body.sendWindowEnd !== undefined) data.sendWindowEnd = body.sendWindowEnd;
  if (body.timezone !== undefined) data.timezone = body.timezone;
  if (body.allowResendDays !== undefined) data.allowResendDays = body.allowResendDays;

  const campaign = await prisma.outreachCampaign.update({ where: { id }, data });
  return NextResponse.json(campaign);
}

// DELETE — draft campaigns only
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;

  const campaign = await prisma.outreachCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (campaign.status !== "draft") {
    return NextResponse.json({ error: "Can only delete draft campaigns" }, { status: 400 });
  }

  await prisma.outreachCampaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
