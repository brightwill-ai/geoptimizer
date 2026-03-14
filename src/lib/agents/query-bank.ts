import { categoryPlural, categoryDescriptor, BUSINESS_CATEGORIES, getCategoryScope } from "./prompts";
import { prisma } from "@/lib/prisma";
import type { BusinessProfile } from "./profiler";

export interface RenderedQuery {
  templateId: string;
  queryType: string;
  prompt: string;
}

/**
 * Build the {marketContext} replacement string based on available context.
 * - Local: "in Miami"
 * - Digital (target audience): "for startups"
 * - Digital (product only): "for project management software"
 * - Hybrid: "in NYC for enterprise companies"
 */
export function buildMarketContext(
  location?: string,
  targetAudience?: string,
  productDescription?: string
): string {
  const parts: string[] = [];
  if (location) parts.push(`in ${location}`);
  if (targetAudience) parts.push(`for ${targetAudience}`);
  if (!parts.length && productDescription) parts.push(`for ${productDescription}`);
  return parts.join(" ") || "";
}

/**
 * Render a query template by replacing placeholders.
 * Supports both legacy placeholders and new subcategory-aware ones.
 */
export function renderTemplate(
  template: string,
  businessName: string,
  location: string,
  category: string,
  profile?: BusinessProfile,
  templateIndex?: number,
  digitalContext?: { productDescription?: string; targetAudience?: string }
): string {
  const idx = templateIndex ?? 0;
  const specialties = profile?.specialties ?? [categoryPlural(category)];
  const searchTerms = profile?.searchTerms ?? [categoryPlural(category)];
  const marketContext = buildMarketContext(
    location || undefined,
    digitalContext?.targetAudience,
    digitalContext?.productDescription
  );

  // When location is empty (digital businesses), replace "in {location}" / "near {location}"
  // patterns with marketContext to avoid "in for startups" — instead get "for startups"
  let rendered = template;
  if (!location && marketContext) {
    rendered = rendered
      .replace(/\bin \{location\}/g, marketContext)
      .replace(/\bnear \{location\}/g, marketContext);
  }

  return rendered
    .replace(/\{businessName\}/g, businessName)
    .replace(/\{location\}/g, location || marketContext)
    .replace(/\{marketContext\}/g, marketContext)
    .replace(/\{categoryPlural\}/g, categoryPlural(category))
    .replace(/\{categoryDescriptor\}/g, categoryDescriptor(category))
    .replace(/\{category\}/g, category)
    .replace(/\{subcategory\}/g, profile?.subcategory ?? category)
    .replace(/\{subcategoryPlural\}/g, profile?.subcategoryPlural ?? categoryPlural(category))
    .replace(/\{specialty\}/g, specialties[idx % specialties.length])
    .replace(/\{searchTerm\}/g, searchTerms[idx % searchTerms.length]);
}

/**
 * Load and render queries for a given tier + category from the database.
 * Falls back to generic category if no templates found.
 */
export async function getQueriesForTier(
  tier: "free" | "comprehensive",
  category: string,
  businessName: string,
  location: string,
  profile?: BusinessProfile,
  options?: { businessScope?: string; productDescription?: string; targetAudience?: string }
): Promise<RenderedQuery[]> {
  // For comprehensive, include both free and comprehensive templates
  const tierFilter = tier === "comprehensive"
    ? { in: ["free", "comprehensive"] }
    : "free";

  // Scope filtering: local → local+all, digital → digital+all, hybrid → all three
  const scope = options?.businessScope || getCategoryScope(category);
  const scopeFilter = scope === "local"
    ? { in: ["local", "all"] }
    : scope === "digital"
    ? { in: ["digital", "all"] }
    : { in: ["local", "digital", "all"] }; // hybrid gets everything

  const digitalContext = {
    productDescription: options?.productDescription,
    targetAudience: options?.targetAudience,
  };

  const templates = await prisma.queryTemplate.findMany({
    where: {
      category,
      tier: tierFilter,
      scope: scopeFilter,
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
        scope: scopeFilter,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return genericTemplates.map((t: { id: string; queryType: string; template: string }, i: number) => ({
      templateId: t.id,
      queryType: t.queryType,
      prompt: renderTemplate(t.template, businessName, location, category, profile, i, digitalContext),
    }));
  }

  return templates.map((t: { id: string; queryType: string; template: string }, i: number) => ({
    templateId: t.id,
    queryType: t.queryType,
    prompt: renderTemplate(t.template, businessName, location, category, profile, i, digitalContext),
  }));
}

// ── Query template definitions for seeding ──

interface QuerySeed {
  queryType: string;
  tier: "free" | "comprehensive";
  template: string;
  scope?: "local" | "digital" | "all";
}

/**
 * Query templates — 38 total (5 free + 33 comprehensive).
 *
 * Distribution: 27 generic (71%) / 11 direct-mention (29%).
 * Uses subcategory-aware placeholders: {subcategoryPlural}, {specialty}, {searchTerm}.
 */
const GENERIC_QUERY_TEMPLATES: QuerySeed[] = [
  // ── FREE TIER (5 queries: 4 generic, 1 direct) ──
  {
    queryType: "discovery",
    tier: "free",
    template: "What are the best {subcategoryPlural} in {location}? I'm looking for top recommendations.",
  },
  {
    queryType: "discovery",
    tier: "free",
    template: "Can you recommend some great {subcategoryPlural} near {location}?",
  },
  {
    queryType: "discovery",
    tier: "free",
    template: "I need a good place for {specialty} in {location}. What are my options?",
  },
  {
    queryType: "use_case",
    tier: "free",
    template: "I'm looking for a reliable {subcategoryPlural} in {location}. What would you suggest?",
  },
  {
    queryType: "direct",
    tier: "free",
    template: "Tell me about {businessName} in {location}. What do they offer and would you recommend them?",
  },

  // ── COMPREHENSIVE TIER (33 additional queries) ──

  // Discovery — 6 more, all generic
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "What are the top-rated {subcategoryPlural} in {location} right now?",
  },
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "I'm visiting {location} and need great {subcategoryPlural}. What are the most recommended options?",
  },
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "What {subcategoryPlural} in {location} have the best reputation among locals?",
  },
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "Where can I find the best {specialty} near {location}?",
  },
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "I've been craving {specialty} lately. What are the top spots in {location}?",
  },
  {
    queryType: "discovery",
    tier: "comprehensive",
    template: "What are people's go-to {subcategoryPlural} in {location}?",
  },

  // Subcategory discovery — 5, all generic (uses searchTerms)
  {
    queryType: "subcategory_discovery",
    tier: "comprehensive",
    template: "best {searchTerm} in {location}",
  },
  {
    queryType: "subcategory_discovery",
    tier: "comprehensive",
    template: "top rated {searchTerm} near {location}",
  },
  {
    queryType: "subcategory_discovery",
    tier: "comprehensive",
    template: "where to get {specialty} in {location} area",
  },
  {
    queryType: "subcategory_discovery",
    tier: "comprehensive",
    template: "most popular {searchTerm} in {location} according to reviews",
  },
  {
    queryType: "subcategory_discovery",
    tier: "comprehensive",
    template: "{searchTerm} recommendations in {location}",
  },

  // Use case — 7 more, all generic
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I need {subcategoryPlural} in {location} for a special occasion. What are the best choices?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I'm new to {location} and looking for good {subcategoryPlural}. What do you recommend?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I'm on a budget in {location}. What are the best value {subcategoryPlural}?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "What's the best {subcategoryPlural} in {location} for families?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "What {subcategoryPlural} in {location} would you recommend for a business meeting or corporate event?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "I'm looking for a high-end {specialty} experience in {location}. What are my options?",
  },
  {
    queryType: "use_case",
    tier: "comprehensive",
    template: "Someone just moved to {location} and needs a good {subcategoryPlural}. What would you suggest?",
  },

  // Comparison — 4, 2 generic + 2 direct
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "What are the main differences between the top {subcategoryPlural} in {location}?",
  },
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "Who are the biggest competitors among {subcategoryPlural} in {location}?",
  },
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "How does {businessName} compare to other {subcategoryPlural} in {location}?",
  },
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "If I had to choose one {subcategoryPlural} in {location}, should it be {businessName} or somewhere else?",
  },

  // Direct — 2 more, all direct
  {
    queryType: "direct",
    tier: "comprehensive",
    template: "What can you tell me about {businessName} in {location}? Are they any good?",
  },
  {
    queryType: "direct",
    tier: "comprehensive",
    template: "Is {businessName} in {location} worth checking out? What do people think?",
  },

  // Reviews — 3, all direct
  {
    queryType: "reviews",
    tier: "comprehensive",
    template: "What's the reputation of {businessName} in {location}? What do customers say?",
  },
  {
    queryType: "reviews",
    tier: "comprehensive",
    template: "Are there common complaints about {businessName} in {location}?",
  },
  {
    queryType: "reviews",
    tier: "comprehensive",
    template: "How do reviews for {businessName} compare to their competitors in {location}?",
  },

  // Specifics — 2, all direct
  {
    queryType: "specifics",
    tier: "comprehensive",
    template: "What services or products does {businessName} in {location} offer?",
  },
  {
    queryType: "specifics",
    tier: "comprehensive",
    template: "Does {businessName} in {location} have any specialties or signature offerings?",
  },

  // Source probing — 2, all direct
  {
    queryType: "source_probing",
    tier: "comprehensive",
    template: "Where can I find reviews for {businessName} in {location}?",
  },
  {
    queryType: "source_probing",
    tier: "comprehensive",
    template: "Has {businessName} in {location} been featured in any articles or local guides?",
  },

  // Verification — 1, direct
  {
    queryType: "verification",
    tier: "comprehensive",
    template: "Is {businessName} still operating in {location}? What's their current status?",
  },

  // ── DIGITAL-ONLY TEMPLATES (scope: "digital") ──
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "What are the best alternatives to {businessName}?",
    scope: "digital",
  },
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "What should I use instead of {businessName}?",
    scope: "digital",
  },
  {
    queryType: "comparison",
    tier: "comprehensive",
    template: "{businessName} vs competitors — which is better {marketContext}?",
    scope: "digital",
  },
  {
    queryType: "specifics",
    tier: "comprehensive",
    template: "How does {businessName} pricing compare to competitors?",
    scope: "digital",
  },
  {
    queryType: "specifics",
    tier: "comprehensive",
    template: "Is {businessName} worth the price?",
    scope: "digital",
  },
  {
    queryType: "reviews",
    tier: "comprehensive",
    template: "What do users on G2 and Capterra say about {businessName}?",
    scope: "digital",
  },
  {
    queryType: "reviews",
    tier: "comprehensive",
    template: "What are the most common complaints about {businessName}?",
    scope: "digital",
  },
  {
    queryType: "discovery",
    tier: "free",
    template: "What are the best {subcategoryPlural} {marketContext}? I'm looking for top recommendations.",
    scope: "digital",
  },
  {
    queryType: "direct",
    tier: "free",
    template: "Tell me about {businessName}. What do they offer and would you recommend them {marketContext}?",
    scope: "digital",
  },
];

/**
 * Seed the QueryTemplate table with all templates for a given category.
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
        scope: t.scope || "all",
        isActive: true,
      },
    });
    count++;
  }

  return count;
}

/**
 * Seed all 10 default categories + generic fallback.
 * Pass force=true to clear existing templates and re-seed.
 */
export async function seedAllCategories(force = false): Promise<void> {
  if (force) {
    const deleted = await prisma.queryTemplate.deleteMany({});
    console.log(`Cleared ${deleted.count} existing templates for re-seed`);
  }

  // Check if already seeded (skip if not forcing)
  const existing = await prisma.queryTemplate.count();
  if (existing > 0 && !force) {
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
