import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";

// GET — list all campaigns
export async function GET() {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const campaigns = await prisma.outreachCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      list: { select: { id: true, name: true, contactCount: true } },
      templates: { include: { template: { select: { id: true, name: true, subject: true } } } },
    },
  });

  return NextResponse.json(campaigns);
}

// POST — create new campaign
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const body = await req.json();
  const { name, listId, templateIds, delayMinutes, jitterSeconds, skipWeekends, sendWindowStart, sendWindowEnd, timezone, allowResendDays } = body;

  if (!name || !listId) {
    return NextResponse.json({ error: "name and listId are required" }, { status: 400 });
  }

  // Get list contact count
  const list = await prisma.outreachList.findUnique({ where: { id: listId } });
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  const campaign = await prisma.outreachCampaign.create({
    data: {
      name,
      listId,
      delayMinutes: delayMinutes ?? 4,
      jitterSeconds: jitterSeconds ?? 30,
      skipWeekends: skipWeekends ?? false,
      sendWindowStart: sendWindowStart ?? 9,
      sendWindowEnd: sendWindowEnd ?? 17,
      timezone: timezone || "America/New_York",
      allowResendDays: allowResendDays ?? 0,
      totalContacts: list.contactCount,
    },
  });

  // Add templates
  if (templateIds && Array.isArray(templateIds) && templateIds.length > 0) {
    await prisma.outreachCampaignTemplate.createMany({
      data: templateIds.map((t: { id: string; weight?: number }) => ({
        campaignId: campaign.id,
        templateId: t.id,
        weight: t.weight || 1,
      })),
    });
  }

  const result = await prisma.outreachCampaign.findUnique({
    where: { id: campaign.id },
    include: {
      list: { select: { id: true, name: true, contactCount: true } },
      templates: { include: { template: { select: { id: true, name: true, subject: true } } } },
    },
  });

  return NextResponse.json(result, { status: 201 });
}
