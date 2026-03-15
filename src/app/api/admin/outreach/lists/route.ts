import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";

// GET — list all lists
export async function GET() {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const lists = await prisma.outreachList.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json(lists.map((l) => ({
    ...l,
    contactCount: l._count.members,
    _count: undefined,
  })));
}

// POST — create new list
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const body = await req.json();
  const { name, description } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const list = await prisma.outreachList.create({
    data: { name, description: description || null },
  });

  return NextResponse.json(list, { status: 201 });
}
