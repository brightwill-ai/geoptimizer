import { getOpenAIClient, MODEL_CONFIG } from "./clients";
import { categoryPlural } from "./prompts";

// ── Business Profile ──

export interface BusinessProfile {
  subcategory: string;        // "Japanese/Sushi"
  specialties: string[];      // ["sushi", "sashimi", "ramen"]
  searchTerms: string[];      // ["sushi restaurant", "Japanese food"]
  subcategoryPlural: string;  // "sushi restaurants"
}

/**
 * Profile a business to determine its subcategory, specialties, and realistic
 * search terms. Uses GPT-4.1-mini with web search for accuracy.
 *
 * Cost: ~$0.001-0.003 per call. Latency: ~2-4s.
 * Falls back to generic category profile on any failure.
 */
export async function profileBusiness(
  businessName: string,
  location: string,
  category: string,
  options?: { productDescription?: string; targetAudience?: string }
): Promise<BusinessProfile> {
  try {
    const client = getOpenAIClient();

    const contextParts: string[] = [];
    if (location) contextParts.push(`in ${location}`);
    if (options?.productDescription) contextParts.push(`(${options.productDescription})`);
    if (options?.targetAudience) contextParts.push(`targeting ${options.targetAudience}`);
    const contextStr = contextParts.join(" ") || "";

    const isDigital = !location && (options?.productDescription || options?.targetAudience);

    const prompt = isDigital
      ? `Look up "${businessName}" ${contextStr} (category: ${category}).

Return a JSON object with these fields:
{
  "subcategory": "the specific type of product/service (e.g. 'Project Management SaaS' not just 'SaaS', or 'Online Yoga Classes' not just 'Online Education')",
  "specialties": ["3-5 specific features, services, or things they are known for"],
  "searchTerms": ["3-5 terms a real person would type to find this type of product/service"],
  "subcategoryPlural": "natural language plural for the subcategory (e.g. 'project management tools', 'email marketing platforms', 'online yoga courses')"
}

Rules:
- subcategory should be specific to what this product/service actually does, not the broad category
- searchTerms should be what a real person would search for (e.g. "best project management tool", "email marketing software")
- specialties should reflect what the product/service is specifically known for
- If you cannot find the business, infer from the business name, category, and product description
- Return ONLY valid JSON, no other text`
      : `Look up "${businessName}" ${contextStr} (category: ${category}).

Return a JSON object with these fields:
{
  "subcategory": "the specific type of business (e.g. 'Japanese/Sushi' not just 'Restaurant', or 'CrossFit' not just 'Gym')",
  "specialties": ["3-5 specific things they are known for or services they offer"],
  "searchTerms": ["3-5 terms a real person would type to find this type of business, WITHOUT location"],
  "subcategoryPlural": "natural language plural for the subcategory (e.g. 'sushi restaurants', 'CrossFit gyms', 'personal injury lawyers')"
}

Rules:
- subcategory should be specific to what this business actually does, not the broad category
- searchTerms should be what a real person would search for (e.g. "sushi restaurant", "Japanese food", "sashimi") — do NOT include the location in search terms
- specialties should reflect what the business is specifically known for
- If you cannot find the business, infer from the business name and category
- Return ONLY valid JSON, no other text`;

    const completion = await client.chat.completions.create({
      model: MODEL_CONFIG.chatgpt.fast,
      messages: [
        { role: "system", content: "You are a local business classifier. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }, { timeout: 15000 });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty profiler response");

    const raw = JSON.parse(content);

    // Validate and normalize
    const profile: BusinessProfile = {
      subcategory: typeof raw.subcategory === "string" && raw.subcategory
        ? raw.subcategory
        : category,
      specialties: Array.isArray(raw.specialties) && raw.specialties.length > 0
        ? raw.specialties.filter((s: unknown) => typeof s === "string" && s).slice(0, 5)
        : [categoryPlural(category)],
      searchTerms: Array.isArray(raw.searchTerms) && raw.searchTerms.length > 0
        ? raw.searchTerms.filter((s: unknown) => typeof s === "string" && s).slice(0, 5)
        : [categoryPlural(category)],
      subcategoryPlural: typeof raw.subcategoryPlural === "string" && raw.subcategoryPlural
        ? raw.subcategoryPlural
        : categoryPlural(category),
    };

    console.log(`[Profiler] "${businessName}" → ${profile.subcategory} (${profile.specialties.join(", ")})`);
    return profile;
  } catch (err) {
    console.warn(`[Profiler] Failed for "${businessName}", using generic profile:`, err);
    return buildFallbackProfile(category);
  }
}

/**
 * Generic fallback profile derived from the broad category.
 */
function buildFallbackProfile(category: string): BusinessProfile {
  const plural = categoryPlural(category);
  return {
    subcategory: category,
    specialties: [plural],
    searchTerms: [plural],
    subcategoryPlural: plural,
  };
}
