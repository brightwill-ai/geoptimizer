import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/app/api/admin/auth";
import { parseCSV, detectColumns } from "@/lib/outreach/csv-parser";

// POST — upload CSV with column mapping
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return unauthorizedResponse();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const columnMappingStr = formData.get("columnMapping") as string | null;
  const listName = formData.get("listName") as string | null;
  const listId = formData.get("listId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
  }

  const content = await file.text();

  // If no column mapping provided, just return detected columns for the UI
  if (!columnMappingStr) {
    const lines = content.split("\n");
    const headers = lines[0] ? lines[0].replace(/^\uFEFF/, "").split(",").map((h) => h.trim().replace(/^"|"$/g, "")) : [];
    const autoMapping = detectColumns(headers);
    return NextResponse.json({ headers, autoMapping, rowCount: lines.length - 1 });
  }

  const columnMapping = JSON.parse(columnMappingStr);
  const { contacts, errors, duplicates: csvDuplicates } = parseCSV(content, columnMapping);

  // Upsert contacts into DB
  let imported = 0;
  let dbDuplicates = 0;
  const importedContactIds: string[] = [];

  for (const c of contacts) {
    try {
      const contact = await prisma.outreachContact.upsert({
        where: { email: c.email },
        create: {
          email: c.email,
          businessName: c.businessName,
          firstName: c.firstName || null,
          category: c.category || "",
          city: c.city || "",
          cuisineType: c.cuisineType || null,
          website: c.website || null,
          phone: c.phone || null,
          address: c.address || null,
          zipCode: c.zipCode || null,
          source: c.source || null,
          customFields: c.customFields ? JSON.stringify(c.customFields) : null,
        },
        update: {}, // Don't overwrite existing contacts
      });
      importedContactIds.push(contact.id);

      // Check if this was a new record
      const isNew = contact.createdAt.getTime() > Date.now() - 5000;
      if (isNew) imported++;
      else dbDuplicates++;
    } catch {
      dbDuplicates++;
    }
  }

  // Create or use list and add members
  let resultListId = listId;
  if (listName && !listId) {
    const list = await prisma.outreachList.create({
      data: { name: listName, contactCount: importedContactIds.length },
    });
    resultListId = list.id;
  }

  if (resultListId && importedContactIds.length > 0) {
    // Add contacts to list (skip duplicates)
    const existingMembers = await prisma.outreachListMember.findMany({
      where: { listId: resultListId },
      select: { contactId: true },
    });
    const existingIds = new Set(existingMembers.map((m) => m.contactId));
    const newMembers = importedContactIds.filter((id) => !existingIds.has(id));

    if (newMembers.length > 0) {
      await prisma.outreachListMember.createMany({
        data: newMembers.map((contactId) => ({ listId: resultListId!, contactId })),
      });

      // Update list contact count
      const count = await prisma.outreachListMember.count({ where: { listId: resultListId } });
      await prisma.outreachList.update({
        where: { id: resultListId },
        data: { contactCount: count },
      });
    }
  }

  return NextResponse.json({
    imported,
    duplicates: csvDuplicates + dbDuplicates,
    errors: errors.length,
    errorDetails: errors.slice(0, 10),
    total: contacts.length,
    listId: resultListId,
  });
}
