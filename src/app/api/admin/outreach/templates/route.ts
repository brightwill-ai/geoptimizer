import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";
import { extractVariables } from "@/lib/outreach/renderer";

// GET — list all templates
export async function GET() {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const templates = await prisma.outreachTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

// POST — create new template
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const body = await req.json();
  const { name, subject, htmlBody, plainTextBody, description } = body;

  if (!name || !subject || !htmlBody || !plainTextBody) {
    return NextResponse.json({ error: "name, subject, htmlBody, and plainTextBody are required" }, { status: 400 });
  }

  // Auto-detect variables from template content
  const allContent = `${subject} ${htmlBody} ${plainTextBody}`;
  const variables = extractVariables(allContent);

  const template = await prisma.outreachTemplate.create({
    data: {
      name,
      subject,
      htmlBody,
      plainTextBody,
      description: description || null,
      variables: JSON.stringify(variables),
    },
  });

  return NextResponse.json(template, { status: 201 });
}
