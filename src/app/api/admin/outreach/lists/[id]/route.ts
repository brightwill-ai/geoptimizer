import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";

type Params = { params: Promise<{ id: string }> };

// PATCH — rename list
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description || null;

  const list = await prisma.outreachList.update({ where: { id }, data });
  return NextResponse.json(list);
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;

  await prisma.outreachList.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
