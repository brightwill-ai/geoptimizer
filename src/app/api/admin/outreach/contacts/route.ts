import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";

// GET — list contacts (paginated, filterable)
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "50")), 200);
  const status = searchParams.get("status");
  const city = searchParams.get("city");
  const category = searchParams.get("category");
  const listId = searchParams.get("listId");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (category) where.category = category;
  if (listId) {
    where.listMemberships = { some: { listId } };
  }

  const [contacts, total] = await Promise.all([
    prisma.outreachContact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        listMemberships: { include: { list: { select: { id: true, name: true } } } },
      },
    }),
    prisma.outreachContact.count({ where }),
  ]);

  return NextResponse.json({ contacts, total, page, limit });
}
