import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";

type Params = { params: Promise<{ id: string }> };

// GET — contact detail with send history
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;

  const contact = await prisma.outreachContact.findUnique({
    where: { id },
    include: {
      listMemberships: { include: { list: { select: { id: true, name: true } } } },
      sends: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          status: true,
          sentAt: true,
          renderedSubject: true,
          renderedHtml: true,
          renderedText: true,
          errorMessage: true,
          template: { select: { name: true } },
          account: { select: { label: true } },
          campaign: { select: { name: true } },
        },
      },
    },
  });

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}

// PATCH — update contact
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.businessName !== undefined) data.businessName = body.businessName;
  if (body.firstName !== undefined) data.firstName = body.firstName || null;
  if (body.category !== undefined) data.category = body.category;
  if (body.city !== undefined) data.city = body.city;
  if (body.cuisineType !== undefined) data.cuisineType = body.cuisineType || null;
  if (body.website !== undefined) data.website = body.website || null;
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.status !== undefined) data.status = body.status;

  const contact = await prisma.outreachContact.update({ where: { id }, data });
  return NextResponse.json(contact);
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;

  await prisma.outreachContact.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
