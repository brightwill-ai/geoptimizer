export type PromptType = "discovery" | "direct" | "comparison" | "use_case" | "reviews" | "menu" | "alternative" | "rephrased_discovery";

export interface PromptTemplate {
  type: PromptType;
  generate: (businessName: string, location: string) => string;
}

// Fast tier: 3 prompts per LLM
export const FAST_PROMPTS: PromptTemplate[] = [
  {
    type: "discovery",
    generate: (business, location) =>
      `What are the best restaurants in ${location}? I'm looking for top recommendations.`,
  },
  {
    type: "direct",
    generate: (business, location) =>
      `Tell me about ${business} in ${location}. What's it like? Is it good?`,
  },
  {
    type: "comparison",
    generate: (business, location) =>
      `How does ${business} compare to other restaurants in ${location}? What are the alternatives?`,
  },
];

// Comprehensive tier: all fast prompts + 5 more
export const COMPREHENSIVE_PROMPTS: PromptTemplate[] = [
  ...FAST_PROMPTS,
  {
    type: "use_case",
    generate: (business, location) =>
      `I'm planning a date night in ${location}. Would you recommend ${business}? What other options are there?`,
  },
  {
    type: "use_case",
    generate: (business, location) =>
      `Looking for a family-friendly restaurant in ${location}. Is ${business} a good choice?`,
  },
  {
    type: "reviews",
    generate: (business, location) =>
      `What do people generally say about ${business} in ${location}? What's the general reputation?`,
  },
  {
    type: "menu",
    generate: (business, location) =>
      `What kind of food does ${business} in ${location} serve? What are their popular dishes and price range?`,
  },
  {
    type: "rephrased_discovery",
    generate: (business, location) =>
      `I'm visiting ${location} and want to find great places to eat. What restaurants should I try?`,
  },
];

export function getPromptsForTier(tier: "fast" | "comprehensive"): PromptTemplate[] {
  return tier === "fast" ? FAST_PROMPTS : COMPREHENSIVE_PROMPTS;
}

// Parser extraction prompt sent to GPT-4o-mini
export function getParserSystemPrompt(businessName: string): string {
  return `You are a data extraction assistant. Analyze the following restaurant recommendation response and extract structured information about "${businessName}".

Return a JSON object with exactly these fields:
{
  "businessMentioned": boolean,
  "mentionType": "primary_recommendation" | "passing_mention" | "not_mentioned",
  "rankPosition": number | null,
  "totalInList": number | null,
  "sentimentTowardBusiness": "positive" | "neutral" | "negative",
  "sentimentPhrases": [{"text": "quote from response", "sentiment": "positive" | "neutral" | "negative"}],
  "competitorsMentioned": [{"name": "restaurant name", "context": "brief description"}],
  "factualClaims": [{"field": "address" | "cuisine" | "price_range" | "hours" | "phone" | "specialty", "value": "claimed value"}],
  "topicsAssociated": ["topic1", "topic2"],
  "categoryInferred": "e.g. Japanese Restaurants" | null
}

Rules:
- Only include sentimentPhrases that directly relate to "${businessName}"
- If the business is not mentioned at all, set mentionType to "not_mentioned" and most fields to empty/null
- Be precise with rankPosition (1 = first recommended, 2 = second, etc.)
- Extract ALL competitors mentioned in the response
- Extract ALL factual claims about the business (address, cuisine type, price range, etc.)
- Return ONLY valid JSON, no other text`;
}
