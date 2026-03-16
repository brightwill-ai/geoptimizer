#!/usr/bin/env npx tsx
/**
 * Seeds the 3 initial OutreachTemplate records into the database.
 * Run: npx tsx scripts/outreach/seed-templates.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEMPLATES = [
  {
    name: "Curiosity",
    subject: "Is ChatGPT recommending {businessName}?",
    htmlBody: ``,
    plainTextBody: `Hi {firstName},

Quick question — when someone asks ChatGPT "{searchExample}", does {businessName} come up?

I've been tracking this and most local businesses don't show up yet. Built a free tool to check — takes 15 seconds: brightwill.ai/analyze

William

---
You're receiving this because {businessName} is listed publicly. Unsubscribe: {unsubscribeUrl}`,
    description: "Plain text curiosity cold email. Short, personal, no HTML — maximizes deliverability.",
    variables: '["firstName","searchExample","businessName","unsubscribeUrl"]',
  },
  {
    name: "Competitor",
    subject: "{businessName} vs. your competitors on ChatGPT",
    htmlBody: ``,
    plainTextBody: `Hi {firstName},

Noticed something interesting about {businessName} — when I asked ChatGPT for {categoryNoun} recommendations in {city}, a few of your competitors came up but you didn't.

More people are skipping Google and just asking AI. Might be worth a look: brightwill.ai/analyze

William

---
You're receiving this because {businessName} is listed publicly. Unsubscribe: {unsubscribeUrl}`,
    description: "Plain text competitor-angle cold email. Short, personal, no HTML — maximizes deliverability.",
    variables: '["firstName","businessName","categoryNoun","city","unsubscribeUrl"]',
  },
  {
    name: "Branded — Free Audit Invite",
    subject: "Your free AI visibility report for {businessName}",
    htmlBody: `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f3efe8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Accent Bar -->
    <div style="height: 3px; background: linear-gradient(to right, #f0a070, #f490b0); border-radius: 3px; margin-bottom: 32px;"></div>

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://brightwill.ai/logo.png" alt="BrightWill" width="36" height="36" style="border-radius: 8px; margin-bottom: 12px;" />
      <h1 style="font-size: 20px; font-weight: 600; color: #171717; margin: 0;">BrightWill</h1>
      <p style="font-size: 12px; color: #8e8ea0; margin: 4px 0 0;">AI Visibility for Businesses</p>
    </div>

    <!-- Card -->
    <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #171717; margin: 0 0 16px;">Hi {firstName},</h2>

      <p style="font-size: 14px; line-height: 1.6; color: #333;">More people are asking AI — ChatGPT, Claude, Gemini — for recommendations instead of searching Google. <strong style="color: #171717;">Is {businessName} showing up?</strong></p>

      <p style="font-size: 14px; line-height: 1.6; color: #333;">We built a free tool that checks your AI visibility in 15 seconds. See exactly what AI says when customers ask about {categoryNoun}s in {city}.</p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://brightwill.ai/analyze" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #f0a070, #f490b0); color: #ffffff; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">Check Your AI Visibility</a>
      </div>

      <p style="font-size: 13px; color: #8e8ea0; text-align: center;">No signup required. Takes 15 seconds.</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 11px; color: #b0b0b0;">
      <p style="margin: 0 0 4px;">BrightWill · AI Visibility for Businesses</p>
      <p style="margin: 0;"><a href="{unsubscribeUrl}" style="color: #b0b0b0;">Unsubscribe</a></p>
    </div>

  </div>
</body>
</html>`,
    plainTextBody: `Hi {firstName},

More people are asking AI — ChatGPT, Claude, Gemini — for recommendations instead of searching Google. Is {businessName} showing up?

We built a free tool that checks your AI visibility in 15 seconds. See exactly what AI says when customers ask about {categoryNoun}s in {city}.

→ https://brightwill.ai/analyze

No signup required. Takes 15 seconds.

—
BrightWill · AI Visibility for Businesses
Unsubscribe: {unsubscribeUrl}`,
    description: "Branded HTML email with BrightWill styling. For warm leads and non-cold campaigns only.",
    variables: '["firstName","businessName","categoryNoun","city","unsubscribeUrl"]',
  },
];

async function main() {
  console.log("Seeding outreach templates...");

  for (const t of TEMPLATES) {
    const existing = await prisma.outreachTemplate.findFirst({ where: { name: t.name } });
    if (existing) {
      console.log(`  Template "${t.name}" already exists, skipping.`);
      continue;
    }
    await prisma.outreachTemplate.create({ data: t });
    console.log(`  Created template: ${t.name}`);
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
