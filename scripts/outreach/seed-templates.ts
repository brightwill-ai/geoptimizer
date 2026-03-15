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
    htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a; max-width: 560px;">
  <p>Hi {firstName},</p>

  <p>When someone asks ChatGPT <em>"{searchExample}"</em> — does {businessName} come up?</p>

  <p>We've been tracking how AI engines like ChatGPT, Claude, and Gemini recommend local businesses. Most {categoryNoun}s aren't showing up yet — but the ones that are get a real edge, because more and more customers are skipping Google and asking AI instead.</p>

  <p>I built a free tool that shows you exactly how AI sees {businessName}. Takes 15 seconds, no signup:</p>

  <p><a href="https://brightwill.ai/analyze" style="color: #171717; font-weight: 500;">→ Check your AI visibility</a></p>

  <p>
    Cheers,<br/>
    William<br/>
    <span style="color: #8e8ea0; font-size: 13px;">BrightWill — AI Visibility for Local Businesses</span>
  </p>

  <p style="color: #b0b0b0; font-size: 11px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
    You're receiving this because {businessName} is listed publicly.
    <a href="{unsubscribeUrl}" style="color: #b0b0b0;">Unsubscribe</a>
  </p>
</div>`,
    plainTextBody: `Hi {firstName},

When someone asks ChatGPT "{searchExample}" — does {businessName} come up?

We've been tracking how AI engines like ChatGPT, Claude, and Gemini recommend local businesses. Most {categoryNoun}s aren't showing up yet — but the ones that are get a real edge, because more and more customers are skipping Google and asking AI instead.

I built a free tool that shows you exactly how AI sees {businessName}. Takes 15 seconds, no signup:

→ https://brightwill.ai/analyze

Cheers,
William
BrightWill — AI Visibility for Local Businesses

---
You're receiving this because {businessName} is listed publicly. Unsubscribe: {unsubscribeUrl}`,
    description: "Default curiosity-based cold email. Personal tone, asks if their business shows up in AI.",
    variables: '["firstName","searchExample","businessName","categoryNoun","unsubscribeUrl"]',
  },
  {
    name: "Competitor",
    subject: "{businessName} vs. your competitors on ChatGPT",
    htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a; max-width: 560px;">
  <p>Hi {firstName},</p>

  <p>Something interesting: when people ask ChatGPT to recommend a {categoryNoun} in {city}, it gives specific names. Some {categoryNoun}s come up every time. Others don't show up at all.</p>

  <p>We built a free tool that shows you where {businessName} stands compared to competitors — in the eyes of AI. It takes 15 seconds:</p>

  <p><a href="https://brightwill.ai/analyze" style="color: #171717; font-weight: 500;">→ See how AI ranks you</a></p>

  <p>No signup, no cost — just your business name.</p>

  <p>
    Best,<br/>
    William<br/>
    <span style="color: #8e8ea0; font-size: 13px;">BrightWill</span>
  </p>

  <p style="color: #b0b0b0; font-size: 11px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
    You're receiving this because {businessName} is listed publicly.
    <a href="{unsubscribeUrl}" style="color: #b0b0b0;">Unsubscribe</a>
  </p>
</div>`,
    plainTextBody: `Hi {firstName},

Something interesting: when people ask ChatGPT to recommend a {categoryNoun} in {city}, it gives specific names. Some {categoryNoun}s come up every time. Others don't show up at all.

We built a free tool that shows you where {businessName} stands compared to competitors — in the eyes of AI. It takes 15 seconds:

→ https://brightwill.ai/analyze

No signup, no cost — just your business name.

Best,
William
BrightWill

---
You're receiving this because {businessName} is listed publicly. Unsubscribe: {unsubscribeUrl}`,
    description: "Competitor-angle cold email. Frames it as a competitive intelligence check.",
    variables: '["firstName","categoryNoun","city","businessName","unsubscribeUrl"]',
  },
  {
    name: "Branded — Free Audit Invite",
    subject: "Your free AI visibility report for {businessName}",
    htmlBody: `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f3efe8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 20px; font-weight: 700; color: #171717; margin: 0;">BrightWill</h1>
      <p style="font-size: 12px; color: #8e8ea0; margin: 4px 0 0;">AI Visibility for Businesses</p>
    </div>
    <!-- Card -->
    <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #171717; margin: 0 0 16px;">Hi {firstName},</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">More people are asking AI — ChatGPT, Claude, Gemini — for recommendations instead of searching Google. <strong>Is {businessName} showing up?</strong></p>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">We built a free tool that checks your AI visibility in 15 seconds. See exactly what AI says when customers ask about {categoryNoun}s in {city}.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://brightwill.ai/analyze" style="display: inline-block; padding: 12px 28px; background: #171717; color: #ffffff; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">Check Your AI Visibility</a>
      </div>
      <p style="font-size: 13px; color: #6e6e80; text-align: center;">No signup required. Takes 15 seconds.</p>
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
    description: "Branded HTML email with BrightWill styling. Good for warm leads and follow-ups.",
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
