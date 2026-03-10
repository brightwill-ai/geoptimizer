import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateActionPlan } from "@/lib/agents/action-plan-generator";
import type { GEOAnalysis } from "@/lib/mock-data";

/**
 * GET /api/analysis/[id]/action-plan
 * Returns the action plan with live completion states from DB records.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: {
        id: true,
        actionPlanJson: true,
        actionPlanStatus: true,
        actionPlanItems: {
          orderBy: { itemIndex: "asc" },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!analysis.actionPlanJson || analysis.actionPlanStatus !== "complete") {
      return NextResponse.json({
        status: analysis.actionPlanStatus,
        actionPlan: null,
      });
    }

    // Parse the cached plan and overlay live completion states
    const actionPlan = JSON.parse(analysis.actionPlanJson);
    const itemsById = new Map(
      analysis.actionPlanItems.map((item) => [`${item.categoryKey}-${item.itemIndex % 100}`, item])
    );

    // Rebuild categories with live DB state (completion, notes)
    let totalCompleted = 0;
    for (const cat of actionPlan.categories) {
      let catCompleted = 0;
      for (let i = 0; i < cat.items.length; i++) {
        const dbItem = itemsById.get(`${cat.key}-${i}`);
        if (dbItem) {
          cat.items[i].id = dbItem.id;
          cat.items[i].completed = dbItem.completed;
          cat.items[i].notes = dbItem.notes;
          if (dbItem.completed) catCompleted++;
        }
      }
      cat.completedCount = catCompleted;
      totalCompleted += catCompleted;
    }
    actionPlan.completedItems = totalCompleted;

    return NextResponse.json({
      status: "complete",
      actionPlan,
    });
  } catch (err) {
    console.error("GET /api/analysis/[id]/action-plan error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/analysis/[id]/action-plan
 * Regenerate the action plan (retry on failure or refresh).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        location: true,
        category: true,
        status: true,
        resultJson: true,
        actionPlanStatus: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (analysis.status !== "complete" || !analysis.resultJson) {
      return NextResponse.json(
        { error: "Analysis must be complete before generating action plan" },
        { status: 400 }
      );
    }

    if (analysis.actionPlanStatus === "generating") {
      return NextResponse.json(
        { error: "Action plan is already being generated" },
        { status: 409 }
      );
    }

    // Mark as generating
    await prisma.analysis.update({
      where: { id },
      data: { actionPlanStatus: "generating" },
    });

    // Delete old items if regenerating
    await prisma.actionPlanItem.deleteMany({ where: { analysisId: id } });

    // Generate new plan
    const geoAnalysis: GEOAnalysis = JSON.parse(analysis.resultJson);
    const actionPlan = await generateActionPlan(
      geoAnalysis,
      analysis.category,
      analysis.location
    );

    const actionPlanJson = JSON.stringify(actionPlan);

    // Create DB records
    const itemRecords = actionPlan.categories.flatMap((cat, ci) =>
      cat.items.map((item, ii) => ({
        analysisId: id,
        categoryKey: cat.key,
        categoryLabel: cat.label,
        itemIndex: ci * 100 + ii,
        priority: item.priority,
        title: item.title,
        description: item.description,
        reasoning: item.reasoning,
        effort: item.effort,
        dataPoints: JSON.stringify(item.dataPoints),
      }))
    );
    await prisma.actionPlanItem.createMany({ data: itemRecords });

    await prisma.analysis.update({
      where: { id },
      data: { actionPlanJson, actionPlanStatus: "complete" },
    });

    return NextResponse.json({ status: "complete", actionPlan });
  } catch (err) {
    console.error("POST /api/analysis/[id]/action-plan error:", err);

    await prisma.analysis.update({
      where: { id },
      data: { actionPlanStatus: "failed" },
    }).catch(() => {});

    return NextResponse.json({ error: "Failed to generate action plan" }, { status: 500 });
  }
}
