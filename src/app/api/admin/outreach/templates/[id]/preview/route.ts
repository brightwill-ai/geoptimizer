import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";
import { renderTemplate, SAMPLE_CONTACT } from "@/lib/outreach/renderer";

type Params = { params: Promise<{ id: string }> };

// POST — preview template with sample data
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await verifyAdmin())) return unauthorizedResponse();
  const { id } = await params;

  const template = await prisma.outreachTemplate.findUnique({ where: { id } });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const contact = { ...SAMPLE_CONTACT, ...body.sampleData };

  const subject = renderTemplate(template.subject, contact);
  const html = renderTemplate(template.htmlBody, contact);
  const plainText = renderTemplate(template.plainTextBody, contact);

  return NextResponse.json({ subject, html, plainText });
}
