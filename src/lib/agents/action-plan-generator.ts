import { z } from "zod";
import { getOpenAIClient, MODEL_CONFIG } from "./clients";
import type {
  GEOAnalysis,
  LLMProvider,
  LLMReport,
  ActionPlan,
  ActionPlanCategory,
} from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";

// ── Zod schema for LLM output validation (lenient — filters malformed items) ──

const ActionPlanItemSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  reasoning: z.string().default(""),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  effort: z.enum(["quick_win", "half_day", "1_2_days", "1_week", "ongoing"]).default("half_day"),
  dataPoints: z.array(z.string()).default([]),
});

const ActionPlanCategorySchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string().default(""),
  estimatedEffort: z.string().default("~2-4 days"),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  items: z.array(z.unknown()).default([]),
});

const ActionPlanOutputSchema = z.object({
  categories: z.array(ActionPlanCategorySchema),
  estimatedTotalEffort: z.string().default("6-8 weeks"),
});

// ── Analysis data extraction for prompt ──

function buildAnalysisSummary(analysis: GEOAnalysis, category: string, location: string): string {
  const { summary, reports, sourceInfluences, methodology } = analysis;
  const lines: string[] = [];

  lines.push(`Business: ${analysis.businessName}`);
  lines.push(`Category: ${category}`);
  lines.push(`Location: ${location}`);
  lines.push(`Overall AI Visibility Score: ${Math.round(summary.averageProbability * 100)}%`);
  lines.push(`Overall GEO Score: ${summary.averageScore}/100`);
  lines.push(`Overall Sentiment: ${summary.overallSentiment}`);
  lines.push(`Total Queries Tested: ${summary.totalQueries}`);
  lines.push(`Best Performing Provider: ${summary.bestPerformer}`);
  lines.push(`Worst Performing Provider: ${summary.worstPerformer}`);
  lines.push("");

  // Per-provider breakdown
  for (const providerInfo of LLM_PROVIDERS) {
    const report: LLMReport | undefined = reports[providerInfo.id];
    if (!report || report.recommendations.totalQueries === 0) continue;

    lines.push(`--- ${providerInfo.name} ---`);
    lines.push(`  AI Visibility Score: ${Math.round(report.recommendations.recommendationProbability * 100)}%`);
    lines.push(`  Primary Recommendation Rate: ${Math.round(report.recommendations.primaryProbability * 100)}%`);
    lines.push(`  GEO Score: ${report.overallScore}/100`);
    lines.push(`  Sentiment: ${report.sentiment.positive}% positive, ${report.sentiment.negative}% negative`);

    if (report.sentiment.samplePhrases.length > 0) {
      const negPhrases = report.sentiment.samplePhrases.filter((p) => p.sentiment === "negative");
      const posPhrases = report.sentiment.samplePhrases.filter((p) => p.sentiment === "positive");
      if (negPhrases.length > 0) {
        lines.push(`  Negative Phrases: ${negPhrases.map((p) => p.text).join("; ")}`);
      }
      if (posPhrases.length > 0) {
        lines.push(`  Positive Phrases: ${posPhrases.slice(0, 2).map((p) => p.text).join("; ")}`);
      }
    }

    if (report.ranking.position > 0) {
      lines.push(`  Ranking: #${report.ranking.position} in ${report.ranking.category}`);
    }

    // Competitors
    const competitorsAbove = report.competitors.filter(
      (c) => !c.isSubject && c.rank < (report.competitors.find((x) => x.isSubject)?.rank ?? 999)
    );
    if (competitorsAbove.length > 0) {
      lines.push(`  Competitors Ranked Above: ${competitorsAbove.map((c) => `${c.name} (#${c.rank})`).join(", ")}`);
    }

    // Topics
    const weakTopics = report.topics.filter((t) => t.strength === "weak");
    const strongTopics = report.topics.filter((t) => t.strength === "strong");
    if (strongTopics.length > 0) {
      lines.push(`  Strong Topics: ${strongTopics.map((t) => t.topic).join(", ")}`);
    }
    if (weakTopics.length > 0) {
      lines.push(`  Weak Topics: ${weakTopics.map((t) => t.topic).join(", ")}`);
    }

    // Accuracy issues
    const missingFields = report.accuracy.filter((a) => a.status === "missing" || a.status === "incorrect");
    if (missingFields.length > 0) {
      lines.push(`  Missing/Incorrect Info: ${missingFields.map((a) => `${a.field} (${a.status})`).join(", ")}`);
    }

    // Sources
    if (report.sources.length > 0) {
      lines.push(`  Sources Cited: ${report.sources.map((s) => `${s.name} (${s.sourceType}, ${s.count}x)`).join(", ")}`);
    }

    // Failed queries
    const failedQueries = report.queryResults.filter((q) => !q.businessMentioned);
    if (failedQueries.length > 0) {
      lines.push(`  Queries Where NOT Mentioned (${failedQueries.length}):`);
      for (const q of failedQueries.slice(0, 8)) {
        lines.push(`    - [${q.queryType}] "${q.queryText}"`);
      }
    }

    // Successful queries
    const successQueries = report.queryResults.filter((q) => q.businessMentioned);
    if (successQueries.length > 0) {
      lines.push(`  Queries Where Mentioned (${successQueries.length}):`);
      for (const q of successQueries.slice(0, 5)) {
        lines.push(`    - [${q.queryType}] "${q.queryText}" (${q.mentionType}, rank: ${q.rankPosition ?? "unranked"})`);
      }
    }

    lines.push("");
  }

  // Cross-platform source influence
  if (sourceInfluences.length > 0) {
    lines.push("--- Cross-Platform Source Influence ---");
    for (const si of sourceInfluences) {
      lines.push(`  ${si.source} (${si.sourceType}): cited ${si.citationCount}x by ${si.citedBy.join(", ")} — influence: ${si.influence}`);
    }
    lines.push("");
  }

  // Provider probability gap
  const probs = Object.entries(reports).map(([id, r]) => ({
    id: id as LLMProvider,
    prob: r.recommendations.recommendationProbability,
  }));
  if (probs.length >= 2) {
    probs.sort((a, b) => b.prob - a.prob);
    const gap = probs[0].prob - probs[probs.length - 1].prob;
    if (gap > 0.1) {
      lines.push(`Provider Probability Gap: ${Math.round(gap * 100)}% between ${probs[0].id} (${Math.round(probs[0].prob * 100)}%) and ${probs[probs.length - 1].id} (${Math.round(probs[probs.length - 1].prob * 100)}%)`);
    }
  }

  // Query types from methodology
  if (methodology.queryTypes.length > 0) {
    lines.push(`Query Types Tested: ${methodology.queryTypes.join(", ")}`);
  }

  return lines.join("\n");
}

// ── System prompt for action plan generation ──

const SYSTEM_PROMPT = `You are an expert GEO (Generative Engine Optimization) consultant. Your job is to create a comprehensive, actionable optimization plan for a business based on their AI visibility audit results.

GEO optimizes how AI engines (ChatGPT, Claude, Gemini) recommend businesses. The goal is to increase the AI visibility score — how likely these AI engines are to mention and recommend the business when users ask relevant questions.

You will receive detailed audit findings including per-provider AI visibility scores, competitor rankings, sentiment analysis, source citations, failed queries, and accuracy data.

Generate an action plan with EXACTLY these 10 categories:

1. **entity_trust** — "Entity Trust & Business Consistency"
   NAP (Name/Address/Phone) consistency across platforms, Google Business Profile optimization, About page, social profiles alignment, business identity signals. AI engines cross-reference multiple sources — inconsistencies reduce trust.

2. **technical_foundation** — "Technical AI Crawlability"
   Ensure robots.txt allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended. Implement server-side rendering. Add llms.txt file. XML sitemap. Fast load times. Mobile optimization. Ensure AI crawlers can access and parse all content.

3. **structured_data** — "Schema.org & Structured Data"
   Implement Organization/LocalBusiness schema, FAQ schema (high-value for AI retrieval), HowTo schema, Product/Service schema, Breadcrumb schema, Review schema. Each schema type helps AI engines parse and cite content.

4. **content_structure** — "Content Structure for AI Retrieval"
   AI engines break pages into chunks and evaluate each independently. Optimize for: answer-first formatting (direct answer then context), self-contained sections, topic clusters with pillar/cluster architecture, TL;DR blocks, clear H2/H3 hierarchy, one concept per section.

5. **citation_authority** — "Citation-Worthiness & Authority Building"
   Original research/data, expert quotes with credentials, E-E-A-T signals, author bios, freshness timestamps ("Updated: [date]"), earned media coverage, third-party mentions. AI engines cite what appears authoritative and factually dense.

6. **source_presence** — "Source & Directory Presence"
   Based on which sources AI engines actually cite for this category: review platforms (Google Reviews, Yelp, TripAdvisor), directories (Google Maps, Apple Maps, Bing Places), industry-specific listings, social platforms (Reddit — 450% surge in AI citations, LinkedIn, YouTube). Fill gaps where the business is absent from cited sources.

7. **competitor_strategy** — "Competitor Differentiation"
   Based on actual competitors found outranking the business: create comparison pages ([Business] vs [Competitor]), highlight unique differentiators, target queries where competitors are mentioned but business is not, build content addressing competitor gaps.

8. **content_marketing** — "Content Marketing & Knowledge Platforms"
   Blog articles targeting failed query types, Reddit/Quora/forum answers (user-generated content = 21.74% of AI citations), case studies, guides, how-to content. Target specific query types where the business is invisible. Content freshness within 3 months dominates AI citations.

9. **reputation_sentiment** — "Reputation & Sentiment Management"
   Address specific negative sentiment phrases found in AI responses, encourage positive reviews on platforms AI engines cite, respond to concerns, build review velocity. When AI engines mention a business negatively, it compounds — fix the source.

10. **monitoring** — "AI Visibility Monitoring & Testing"
    Monthly re-testing of key prompts across all providers, track citation frequency trends, competitive benchmarking, GA4 AI referral tracking, prompt library maintenance, quarterly reporting.

## CRITICAL REQUIREMENTS:

1. **Every item MUST reference specific data from the analysis.** Use actual competitor names, probability percentages, source names, sentiment quotes, failed query texts, and accuracy gaps. NEVER write generic advice.

2. **Order items within each category:** quick wins first (immediate impact, low effort), then escalating complexity.

3. **Priority levels:**
   - critical: Directly blocking AI visibility (e.g., robots.txt blocking crawlers, missing from Google Business Profile)
   - high: Significant impact on recommendation probability
   - medium: Incremental improvement
   - low: Nice-to-have optimization

4. **Effort levels:**
   - quick_win: Under 1 hour
   - half_day: 2-4 hours
   - 1_2_days: 1-2 days
   - 1_week: 3-5 days
   - ongoing: Recurring effort

5. **Generate 8-15 items per category** (80-120 total). More items for categories with more findings.

6. **dataPoints array:** Each item must have 1-3 specific data citations from the analysis (e.g., "ChatGPT recommendation probability: 23%", "Competitor X ranks #1 on Claude", "Missing from Yelp citations").

7. **estimatedEffort per category:** Sum of effort for that category (e.g., "~3-5 days")

8. **estimatedTotalEffort:** Overall estimate (e.g., "6-8 weeks")

Return ONLY valid JSON matching the required schema.`;

// ── Main generator function ──

export async function generateActionPlan(
  analysis: GEOAnalysis,
  category: string,
  location: string
): Promise<ActionPlan> {
  const client = getOpenAIClient();
  const analysisSummary = buildAnalysisSummary(analysis, category, location);

  const completion = await client.chat.completions.create({
    model: MODEL_CONFIG.chatgpt.comprehensive,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Here are the complete GEO audit findings for this business:\n\n${analysisSummary}\n\nGenerate the comprehensive action plan.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 16000,
    response_format: { type: "json_object" },
  }, { timeout: 180000 });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Action plan generator returned empty response");
  }

  const raw = JSON.parse(content);

  // Known category metadata — used to fill defaults when LLM omits them
  const CATEGORY_META: Record<string, { label: string; description: string; priority: "critical" | "high" | "medium" | "low" }> = {
    entity_trust: { label: "Entity Trust & Business Consistency", description: "NAP consistency, Google Business Profile, platform presence alignment.", priority: "critical" },
    technical_foundation: { label: "Technical AI Crawlability", description: "Robots.txt, SSR, llms.txt, sitemap, AI crawler access.", priority: "critical" },
    structured_data: { label: "Schema.org & Structured Data", description: "Organization, LocalBusiness, FAQ, HowTo, Product schema markup.", priority: "high" },
    content_structure: { label: "Content Structure for AI Retrieval", description: "Chunk-level optimization, answer-first formatting, topic clusters.", priority: "high" },
    citation_authority: { label: "Citation-Worthiness & Authority Building", description: "Original research, E-E-A-T signals, freshness, earned media.", priority: "high" },
    source_presence: { label: "Source & Directory Presence", description: "Review platforms, directories, and listings AI engines cite.", priority: "high" },
    competitor_strategy: { label: "Competitor Differentiation", description: "Comparison pages, unique positioning vs competitors found in analysis.", priority: "medium" },
    content_marketing: { label: "Content Marketing & Knowledge Platforms", description: "Blog articles, Reddit/Quora answers, case studies targeting failed queries.", priority: "medium" },
    reputation_sentiment: { label: "Reputation & Sentiment Management", description: "Address negative sentiment, encourage reviews, build review velocity.", priority: "medium" },
    monitoring: { label: "AI Visibility Monitoring & Testing", description: "Monthly re-testing, citation tracking, competitive benchmarking.", priority: "low" },
  };

  // Normalize LLM output — it may return categories as top-level keys instead of an array
  let parseable = raw;
  if (!raw.categories && typeof raw === "object") {
    const CATEGORY_KEYS = Object.keys(CATEGORY_META);
    const foundCategories = CATEGORY_KEYS
      .filter((k) => raw[k] && typeof raw[k] === "object")
      .map((k) => {
        const catData = raw[k];
        const meta = CATEGORY_META[k];
        // Normalize items: could be catData.items array or catData itself could be an array
        const items = Array.isArray(catData.items) ? catData.items : Array.isArray(catData) ? catData : [];
        return {
          key: k,
          label: catData.label ?? meta.label,
          description: catData.description ?? meta.description,
          estimatedEffort: catData.estimatedEffort ?? catData.estimated_effort ?? "~2-4 days",
          priority: catData.priority ?? meta.priority,
          items,
        };
      });

    if (foundCategories.length > 0) {
      parseable = {
        categories: foundCategories,
        estimatedTotalEffort: raw.estimatedTotalEffort ?? raw.estimated_total_effort ?? "6-8 weeks",
      };
    } else {
      // Fallback: check for nested wrapper or array values
      for (const key of Object.keys(raw)) {
        const val = raw[key];
        if (val && typeof val === "object" && !Array.isArray(val) && Array.isArray(val.categories)) {
          parseable = val;
          break;
        }
        if (Array.isArray(val) && val.length > 0 && val[0]?.key && val[0]?.items) {
          parseable = { categories: val, estimatedTotalEffort: raw.estimatedTotalEffort ?? "6-8 weeks" };
          break;
        }
      }
    }
  }

  // Also normalize snake_case fields inside categories/items
  if (parseable.categories && Array.isArray(parseable.categories)) {
    parseable.categories = parseable.categories.map((cat: Record<string, unknown>) => ({
      ...cat,
      estimatedEffort: cat.estimatedEffort ?? cat.estimated_effort ?? "~2-4 days",
      items: Array.isArray(cat.items) ? (cat.items as Record<string, unknown>[]).map((item) => ({
        ...item,
        dataPoints: item.dataPoints ?? item.data_points ?? [],
      })) : [],
    }));
  }

  const validated = ActionPlanOutputSchema.parse(parseable);

  // Assemble the final ActionPlan — filter out malformed/truncated items
  const categories: ActionPlanCategory[] = validated.categories.map((cat) => {
    let rawItems = cat.items as Record<string, unknown>[];

    // Handle case where items is an object (not array) with titles as keys
    if (!Array.isArray(cat.items) && typeof cat.items === "object" && cat.items !== null) {
      rawItems = Object.entries(cat.items as Record<string, unknown>).map(([title, data]) => ({
        title,
        ...(typeof data === "object" && data !== null ? data : {}),
      })) as Record<string, unknown>[];
    }
    const validItems = rawItems
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        // Normalize: LLM may omit title/reasoning — derive from description
        const desc = (item.description ?? item.title ?? "") as string;
        const title = (item.title ?? (desc.length > 80 ? desc.slice(0, 77) + "..." : desc)) as string;
        const reasoning = (item.reasoning ?? item.reason ?? desc) as string;
        if (!title) return null;

        const parsed = ActionPlanItemSchema.safeParse({
          ...item,
          title,
          description: desc,
          reasoning,
          dataPoints: item.dataPoints ?? item.data_points ?? [],
        });
        return parsed.success ? parsed.data : null;
      })
      .filter((item): item is z.infer<typeof ActionPlanItemSchema> => item !== null);

    return {
      key: cat.key,
      label: cat.label,
      description: cat.description,
      estimatedEffort: cat.estimatedEffort,
      priority: cat.priority,
      items: validItems.map((item, idx) => ({
        id: `${cat.key}-${idx}`,
        title: item.title,
        description: item.description,
        reasoning: item.reasoning,
        priority: item.priority,
        effort: item.effort,
        dataPoints: item.dataPoints,
        completed: false,
      })),
      completedCount: 0,
    };
  }).filter((cat) => cat.items.length > 0);

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    businessName: analysis.businessName,
    totalItems,
    completedItems: 0,
    categories,
    estimatedTotalEffort: validated.estimatedTotalEffort,
  };
}
