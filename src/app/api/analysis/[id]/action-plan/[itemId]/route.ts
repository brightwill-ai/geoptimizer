import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/analysis/[id]/action-plan/[itemId]
 * Toggle completion or update notes on an action plan item.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();

    // Verify item belongs to this analysis
    const item = await prisma.actionPlanItem.findFirst({
      where: { id: itemId, analysisId: id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed;
      updateData.completedAt = body.completed ? new Date() : null;
    }

    if (typeof body.notes === "string") {
      updateData.notes = body.notes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.actionPlanItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("PATCH /api/analysis/[id]/action-plan/[itemId] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
