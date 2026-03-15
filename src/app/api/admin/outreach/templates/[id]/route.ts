import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";
import { extractVariables } from "@/lib/outreach/renderer";

type Params = { params: Promise<{ id: string }> };

// PATCH — update template
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.subject !== undefined) data.subject = body.subject;
  if (body.htmlBody !== undefined) data.htmlBody = body.htmlBody;
  if (body.plainTextBody !== undefined) data.plainTextBody = body.plainTextBody;
  if (body.description !== undefined) data.description = body.description || null;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  // Re-detect variables if content changed
  if (body.subject || body.htmlBody || body.plainTextBody) {
    const existing = await prisma.outreachTemplate.findUnique({ where: { id } });
    if (existing) {
      const allContent = `${body.subject || existing.subject} ${body.htmlBody || existing.htmlBody} ${body.plainTextBody || existing.plainTextBody}`;
      data.variables = JSON.stringify(extractVariables(allContent));
    }
  }

  const template = await prisma.outreachTemplate.update({ where: { id }, data });
  return NextResponse.json(template);
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;

  await prisma.outreachTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
