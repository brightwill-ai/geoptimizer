#!/usr/bin/env npx tsx
/**
 * Migrate sent-log.json contacts into OutreachContact records.
 * Run: npx tsx scripts/outreach/migrate-to-db.ts
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SentEntry {
  email: string;
  businessName: string;
  template: string;
  sentAt: string;
}

async function main() {
  const logPath = path.resolve("scripts/outreach/sent-log.json");

  if (!fs.existsSync(logPath)) {
    console.log("No sent-log.json found. Nothing to migrate.");
    return;
  }

  const entries: SentEntry[] = JSON.parse(fs.readFileSync(logPath, "utf-8"));
  console.log(`Found ${entries.length} entries in sent-log.json`);

  let created = 0;
  let skipped = 0;

  for (const entry of entries) {
    try {
      await prisma.outreachContact.upsert({
        where: { email: entry.email.toLowerCase() },
        create: {
          email: entry.email.toLowerCase(),
          businessName: entry.businessName,
          status: "sent",
        },
        update: {}, // Don't overwrite
      });
      created++;
    } catch {
      skipped++;
    }
  }

  console.log(`Migration complete: ${created} contacts created, ${skipped} skipped.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
