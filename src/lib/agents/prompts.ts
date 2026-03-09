export type PromptType = "discovery" | "direct" | "comparison" | "use_case" | "reviews" | "reputation" | "specifics" | "rephrased_discovery";

export interface PromptTemplate {
  type: PromptType;
  generate: (businessName: string, location: string, category: string) => string;
}

// Default business categories for the UI
export const BUSINESS_CATEGORIES = [
  { id: "restaurant", label: "Restaurant" },
  { id: "gym", label: "Gym & Fitness" },
  { id: "salon", label: "Salon & Spa" },
  { id: "hvac", label: "HVAC & Home Services" },
  { id: "dental", label: "Dental & Medical" },
  { id: "legal", label: "Legal Services" },
  { id: "realtor", label: "Real Estate" },
  { id: "saas", label: "SaaS & Software" },
  { id: "ecommerce", label: "E-commerce & Retail" },
  { id: "agency", label: "Marketing & Agency" },
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number]["id"] | string;

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
    generate: (business, location, category) =>
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
  "sourcesCited": [{"name": "Yelp", "sourceType": "review_platform"}, {"name": "Google Maps", "sourceType": "directory"}]
}

sourceType must be one of: "review_platform", "directory", "news", "social_media", "official_site", "other"

Rules:
- Only include sentimentPhrases that directly relate to "${businessName}"
- If the business is not mentioned at all, set mentionType to "not_mentioned" and most fields to empty/null
- Be precise with rankPosition (1 = first recommended, 2 = second, etc.)
- Extract ALL competitors mentioned in the response
- Extract ALL factual claims about the business (services, pricing, specialties, etc.)
- Extract ALL sources/platforms referenced (Yelp, Google Reviews, TripAdvisor, news sites, official websites, social media, etc.)
- Return ONLY valid JSON, no other text`;
}
