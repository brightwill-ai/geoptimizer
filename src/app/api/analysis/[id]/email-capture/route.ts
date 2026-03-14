import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const EmailCaptureInput = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = EmailCaptureInput.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, name } = parsed.data;

    // Verify analysis exists
    const analysis = await prisma.analysis.findUnique({ where: { id } });
    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Update analysis with email
    await prisma.analysis.update({
      where: { id },
      data: { email },
    });

    // Upsert signup record for future marketing
    await prisma.signup.upsert({
      where: { email },
      create: {
        email,
        name: name || "",
        businessName: analysis.businessName,
      },
      update: {
        businessName: analysis.businessName,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/analysis/[id]/email-capture error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
