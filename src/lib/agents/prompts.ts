export type PromptType = "discovery" | "direct" | "comparison" | "use_case" | "reviews" | "reputation" | "specifics" | "rephrased_discovery";

export interface PromptTemplate {
  type: PromptType;
  generate: (businessName: string, location: string, category: string) => string;
}

// ── Business scope types ──

export type BusinessScope = "local" | "digital" | "hybrid";

export interface CategoryDef {
  id: string;
  label: string;
  scope: BusinessScope;
}

// Default business categories for the UI
export const BUSINESS_CATEGORIES: CategoryDef[] = [
  // Local
  { id: "restaurant", label: "Restaurant", scope: "local" },
  { id: "gym", label: "Gym & Fitness", scope: "local" },
  { id: "salon", label: "Salon & Spa", scope: "local" },
  { id: "hvac", label: "HVAC & Home Services", scope: "local" },
  { id: "dental", label: "Dental & Medical", scope: "local" },
  { id: "legal", label: "Legal Services", scope: "local" },
  { id: "realtor", label: "Real Estate", scope: "local" },
  // Digital
  { id: "saas", label: "SaaS & Software", scope: "digital" },
  { id: "ecommerce", label: "E-commerce & DTC", scope: "digital" },
  { id: "online_course", label: "Online Education & Courses", scope: "digital" },
  { id: "creator", label: "Creator & Personal Brand", scope: "digital" },
  { id: "healthcare_digital", label: "Telehealth & Digital Health", scope: "digital" },
  // Hybrid
  { id: "agency", label: "Marketing & Agency", scope: "hybrid" },
  { id: "consultant", label: "Consulting & Coaching", scope: "hybrid" },
  { id: "freelancer", label: "Freelancer & Solo", scope: "hybrid" },
  { id: "nonprofit", label: "Nonprofit & Community", scope: "hybrid" },
];

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number]["id"] | string;

// ── Scope helpers ──

const SCOPE_MAP: Record<string, BusinessScope> = Object.fromEntries(
  BUSINESS_CATEGORIES.map((c) => [c.id, c.scope])
);

/** Get the scope for a category. Custom/unknown categories default to "hybrid". */
export function getCategoryScope(category: string): BusinessScope {
  return SCOPE_MAP[category] || "hybrid";
}

/** Check if a category requires a location. */
export function categoryRequiresLocation(category: string): boolean {
  return getCategoryScope(category) === "local";
}

/** Check if a category supports digital fields. */
export function categorySupportsDigital(category: string): boolean {
  const scope = getCategoryScope(category);
  return scope === "digital" || scope === "hybrid";
}

// Helper: pluralize category for natural language
export function categoryPlural(category: string): string {
  const map: Record<string, string> = {
    restaurant: "restaurants",
    gym: "gyms and fitness centers",
    salon: "salons and spas",
    hvac: "HVAC and home service companies",
    dental: "dentists and dental practices",
    legal: "law firms and legal services",
    realtor: "real estate agents and agencies",
    saas: "software companies",
    ecommerce: "online stores and retailers",
    agency: "marketing agencies",
    consultant: "consulting firms and coaches",
    freelancer: "freelancers and independent professionals",
    creator: "creators and personal brands",
    online_course: "online courses and education platforms",
    nonprofit: "nonprofits and community organizations",
    healthcare_digital: "telehealth and digital health platforms",
  };
  return map[category] || `${category} businesses`;
}

// Helper: category-appropriate descriptor
export function categoryDescriptor(category: string): string {
  const map: Record<string, string> = {
    restaurant: "place to eat",
    gym: "place to work out",
    salon: "place for beauty and wellness",
    hvac: "service provider for home maintenance",
    dental: "dental care provider",
    legal: "legal professional",
    realtor: "real estate professional",
    saas: "software solution",
    ecommerce: "online shop",
    agency: "marketing partner",
    consultant: "consulting or coaching service",
    freelancer: "freelance professional",
    creator: "content creator or personal brand",
    online_course: "online learning platform",
    nonprofit: "nonprofit organization",
    healthcare_digital: "digital health platform",
  };
  return map[category] || "business";
}

// Fast tier: 3 prompts per LLM
export const FAST_PROMPTS: PromptTemplate[] = [
  {
    type: "discovery",
    generate: (business, location, category) =>
      `What are the best ${categoryPlural(category)} in ${location}? I'm looking for top recommendations with reasons why each stands out.`,
  },
  {
    type: "direct",
    generate: (business, location, category) =>
      `Tell me about ${business} in ${location}. What do they offer, what are they known for, and would you recommend them as a ${categoryDescriptor(category)}?`,
  },
  {
    type: "comparison",
    generate: (business, location, category) =>
      `I'm considering ${business} in ${location}. How do they compare to other ${categoryPlural(category)} in the area? What are the top alternatives and how does ${business} stack up?`,
  },
];

// Comprehensive tier: all fast prompts + 5 more
export const COMPREHENSIVE_PROMPTS: PromptTemplate[] = [
  ...FAST_PROMPTS,
  {
    type: "use_case",
    generate: (business, location, category) =>
      `I need a reliable ${categoryDescriptor(category)} in ${location} for a high-stakes situation — important client, special occasion, or big decision. Would you recommend ${business}? What other options should I consider?`,
  },
  {
    type: "use_case",
    generate: (business, location, category) =>
      `I'm new to ${location} and looking for a trustworthy ${categoryDescriptor(category)}. Is ${business} a good choice for someone who doesn't know the area? What should I know?`,
  },
  {
    type: "reviews",
    generate: (business, location) =>
      `What's the general reputation of ${business} in ${location}? What do customers and the community generally say about them? Any common praise or complaints?`,
  },
  {
    type: "specifics",
    generate: (business, location, category) =>
      `What specific services or products does ${business} in ${location} offer? What are they best known for, what's their pricing like, and what makes them different from other ${categoryPlural(category)}?`,
  },
  {
    type: "rephrased_discovery",
    generate: (business, location, category) =>
      `I'm visiting ${location} and need to find great ${categoryPlural(category)}. What are the top-rated options people recommend most? Give me your honest picks.`,
  },
];

export function getPromptsForTier(tier: "fast" | "comprehensive"): PromptTemplate[] {
  return tier === "fast" ? FAST_PROMPTS : COMPREHENSIVE_PROMPTS;
}

// Parser extraction prompt sent to GPT-4o-mini
export function getParserSystemPrompt(businessName: string): string {
  return `You are a data extraction assistant. Analyze the following response about businesses/services and extract structured information about "${businessName}".

Return a JSON object with exactly these fields:
{
  "businessMentioned": boolean,
  "mentionType": "primary_recommendation" | "passing_mention" | "not_mentioned",
  "rankPosition": number | null,
  "totalInList": number | null,
  "sentimentTowardBusiness": "positive" | "neutral" | "negative",
  "sentimentPhrases": [{"text": "quote from response", "sentiment": "positive" | "neutral" | "negative"}],
  "competitorsMentioned": [{"name": "business name", "context": "brief description"}],
  "factualClaims": [{"field": "address" | "services" | "specialty" | "price_range" | "hours" | "phone" | "website" | "established", "value": "claimed value"}],
  "topicsAssociated": ["topic1", "topic2"],
  "categoryInferred": "e.g. Japanese Restaurants, Personal Injury Lawyers, CrossFit Gyms" | null,
  "sourcesCited": [{"name": "Yelp", "sourceType": "review_platform", "url": "https://www.yelp.com/biz/example"}, {"name": "Google Maps", "sourceType": "directory", "url": null}]
}

sourceType must be one of: "review_platform", "directory", "news", "social_media", "official_site", "other"

Rules:
- Only include sentimentPhrases that directly relate to "${businessName}"
- If the business is not mentioned at all, set mentionType to "not_mentioned" and most fields to empty/null
- Be precise with rankPosition (1 = first recommended, 2 = second, etc.)
- Extract ALL competitors mentioned in the response
- Extract ALL factual claims about the business (services, pricing, specialties, etc.)
- Extract ALL sources/platforms referenced (Yelp, Google Reviews, TripAdvisor, news sites, official websites, social media, etc.)
- For sourcesCited, include the exact URL if one appears in the response text (e.g. "https://www.yelp.com/biz/..."). Set url to null if no URL is present in the text.
- Return ONLY valid JSON, no other text`;
}
