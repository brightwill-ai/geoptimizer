import { categoryPlural, categoryDescriptor, BUSINESS_CATEGORIES } from "./prompts";
import { prisma } from "@/lib/prisma";

export interface RenderedQuery {
  templateId: string;
  queryType: string;
  prompt: string;
}

/**
 * Render a query template by replacing placeholders.
 */
export function renderTemplate(
  template: string,
  businessName: string,
  location: string,
  category: string
): string {
  return template
    .replace(/\{businessName\}/g, businessName)
    .replace(/\{location\}/g, location)
    .replace(/\{categoryPlural\}/g, categoryPlural(category))
    .replace(/\{categoryDescriptor\}/g, categoryDescriptor(category))
    .replace(/\{category\}/g, category);
}

/**
 * Load and render queries for a given tier + category from the database.
 * Falls back to hardcoded prompts if no templates found.
 */
export async function getQueriesForTier(
  tier: "free" | "comprehensive",
  category: string,
  businessName: string,
  location: string
): Promise<RenderedQuery[]> {
  // For comprehensive, include both free and comprehensive templates
  const tierFilter = tier === "comprehensive"
    ? { in: ["free", "comprehensive"] }
    : "free";

  const templates = await prisma.queryTemplate.findMany({
    where: {
      category,
      tier: tierFilter,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // If no templates for this exact category, try loading "generic" templates
  if (templates.length === 0) {
    const genericTemplates = await prisma.queryTemplate.findMany({
      where: {
        category: "generic",
        tier: tierFilter,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return genericTemplates.map((t) => ({
      templateId: t.id,
      queryType: t.queryType,
      prompt: renderTemplate(t.template, businessName, location, category),
    }));
  }

  return templates.map((t) => ({
    templateId: t.id,
    queryType: t.queryType,
    prompt: renderTemplate(t.template, businessName, location, category),
  }));
}

/**
 * Get all supported categories (from DB templates + hardcoded fallback).
 */
export function getSupportedCategories(): string[] {
  return BUSINESS_CATEGORIES.map((c) => c.id);
}

// ── Query template definitions for seeding ──

interface QuerySeed {
  queryType: string;
  tier: "free" | "comprehensive";
  template: string;
}

/**
 * Generic templates that work across all categories via placeholders.
 * These are the core query bank — 5 free + ~40 comprehensive.
 */
export const GENERIC_QUERY_TEMPLATES: QuerySeed[] = [
  // ── FREE TIER (5 queries) ──
  {
    queryType: "discovery",
    tier: "free",
    template: "What are the best {categoryPlural} in {location}? I'm looking for top recommendations.",
  },
  {
    queryType: "discovery",
    tier: "free",
    template: "Can you recommend some great {categoryPlural} near {location}? What makes them stand out?",
  },
  {
    queryType: "direct",
    tier: "free",
    template: "Tell me about {businessName} in {location}. What do they offer and would you recommend them?",
  },
  {
    queryType: "comparison",
    tier: "free",
    template: "How does {businessName} compare to other {categoryPlural} in {location}? What are the top alternatives?",
  },
  {
    queryType: "use_case",
    tier: "free",
    template: "I need a reliable {categoryDescriptor} in {location}. What are my best options?",
  },

  // ── COMPREHENSIVE TIER (additional ~35 queries) ──

  // Discovery variants
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "I'm looking for the best {categoryPlural} in {location}. What do locals recommend the most?",
  },
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "What are the top-rated {categoryPlural} in {location} right now? I want places with great recent reviews.",
  },
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "I'm visiting {location} and need to find great {categoryPlural}. What are the top-rated options people recommend most?",
  },
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "What {categoryPlural} in {location} have the best reputation? I'm looking for consistently excellent quality.",
  },

  // Direct knowledge variants
  {
    queryType: "direct",
    tier: "comprehensive",
    template: "What can you tell me about {businessName} located in {location}? Are they any good?",
  },
  {
    queryType: "direct",
    tier: "comprehensive",
    template: "I've heard of {businessName} in {location}. What's their story and what are they known for?",
  },
  {
    queryType: "direct",
    tier: "comprehensive",
    template: "Is {businessName} in {location} worth checking out? What do people generally think of them?",
  },

  // Comparison variants
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "I'm deciding between {businessName} and their competitors in {location}. Who's the best {categoryDescriptor} and why?",
  },
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "What makes {businessName} different from other {categoryPlural} in {location}? Are there better options?",
  },
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "If I had to choose one {categoryDescriptor} in {location}, should it be {businessName} or somewhere else?",
  },

  // Use-case variants
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I need a {categoryDescriptor} in {location} for a really important occasion. Would you recommend {businessName}?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I'm new to {location} and looking for a trustworthy {categoryDescriptor}. Is {businessName} a good choice?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I'm on a budget in {location}. What are the best value {categoryPlural}? Would {businessName} be a good option?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I need a {categoryDescriptor} in {location} that's great for families. Any recommendations?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "What's the best {categoryDescriptor} in {location} for a business professional or corporate client?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I'm looking for a premium/luxury {categoryDescriptor} in {location}. What are my best choices?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "Someone just moved to {location} and needs a reliable {categoryDescriptor}. What would you suggest?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I need an emergency {categoryDescriptor} in {location}. Who's the most reliable?",
  },

  // Reviews/reputation variants
  {
    queryType: "reviews",
    tier: "comprehensive",
    template: "What's the general reputation of {businessName} in {location}? What do customers say about them?",
  },
  {
    queryType: "reviews",
    tier: "comprehensive",
    template: "Are there any common complaints about {businessName} in {location}? What do reviewers praise them for?",
  },
  {
    queryType: "reviews",
    tier: "comprehensive",
    template: "How do customer reviews for {businessName} in {location} compare to their competitors?",
  },
  {
    queryType: "reviews",
    tier: "comprehensive",
    template: "What do people say online about {businessName} in {location}? Is the sentiment mostly positive?",
  },

  // Specifics variants
  {
    queryType: "specifics",
    tier: "comprehensive",
    template: "What specific services or products does {businessName} in {location} offer? What are their specialties?",
  },
  {
    queryType: "specifics",
    tier: "comprehensive",
    template: "What are the prices like at {businessName} in {location}? What should I expect to pay?",
  },
  {
    queryType: "specifics",
    tier: "comprehensive",
    template: "What are the hours and location details for {businessName} in {location}? Is parking available?",
  },
  {
    queryType: "specifics",
    tier: "comprehensive",
    template: "Does {businessName} in {location} have any specialties, unique features, or signature offerings?",
  },

  // Source-probing variants
  {
    queryType: "source_probing",
    tier: "comprehensive",
    template: "Where can I find reviews and ratings for {businessName} in {location}? Which review platforms mention them?",
  },
  {
    queryType: "source_probing",
    tier: "comprehensive",
    template: "What websites or directories list {businessName} in {location}? Where do they have a strong presence?",
  },
  {
    queryType: "source_probing",
    tier: "comprehensive",
    template: "Has {businessName} in {location} been featured in any news articles, blogs, or local guides?",
  },
  {
    queryType: "source_probing",
    tier: "comprehensive",
    template: "Where would you go online to learn more about {categoryPlural} in {location} like {businessName}?",
  },

  // Verification variants
  {
    queryType: "verification",
    tier: "comprehensive",
    template: "Is {businessName} still operating in {location}? What's their current status?",
  },
  {
    queryType: "verification",
    tier: "comprehensive",
    template: "What is the address and contact information for {businessName} in {location}?",
  },
  {
    queryType: "verification",
    tier: "comprehensive",
    template: "What type of business is {businessName} in {location}? What category would you put them in?",
  },
];

/**
 * Seed the QueryTemplate table with all templates for a given category.
 * If "generic", seeds the universal templates. Otherwise, uses the same templates
 * tagged with the specific category.
 */
export async function seedQueryTemplates(category: string = "generic"): Promise<number> {
  const templates = GENERIC_QUERY_TEMPLATES;
  let count = 0;

  for (const t of templates) {
    await prisma.queryTemplate.create({
      data: {
        category,
        queryType: t.queryType,
        template: t.template,
        tier: t.tier,
        isActive: true,
      },
    });
    count++;
  }

  return count;
}

/**
 * Seed all 10 default categories + generic fallback.
 */
export async function seedAllCategories(): Promise<void> {
  // Check if already seeded
  const existing = await prisma.queryTemplate.count();
  if (existing > 0) {
    console.log(`Query bank already has ${existing} templates, skipping seed.`);
    return;
  }

  // Seed generic templates (fallback for custom categories)
  const genericCount = await seedQueryTemplates("generic");
  console.log(`Seeded ${genericCount} generic templates`);

  // Seed for each preset category
  for (const cat of BUSINESS_CATEGORIES) {
    const catCount = await seedQueryTemplates(cat.id);
    console.log(`Seeded ${catCount} templates for ${cat.id}`);
  }

  const total = await prisma.queryTemplate.count();
  console.log(`Total templates seeded: ${total}`);
}
