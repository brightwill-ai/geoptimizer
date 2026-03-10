import { z } from "zod";
import { getOpenAIClient } from "./clients";
import type {
  GEOAnalysis,
  LLMProvider,
  LLMReport,
  ActionPlan,
  ActionPlanCategory,
} from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";

// ── Zod schema for LLM output validation ──

const ActionPlanItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  reasoning: z.string(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  effort: z.enum(["quick_win", "half_day", "1_2_days", "1_week", "ongoing"]),
  dataPoints: z.array(z.string()),
});

const ActionPlanCategorySchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
  estimatedEffort: z.string(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  items: z.array(ActionPlanItemSchema),
});

const ActionPlanOutputSchema = z.object({
  categories: z.array(ActionPlanCategorySchema),
  estimatedTotalEffort: z.string(),
});

// ── Analysis data extraction for prompt ──

function buildAnalysisSummary(analysis: GEOAnalysis, category: string, location: string): string {
  const { summary, reports, sourceInfluences, methodology } = analysis;
  const lines: string[] = [];

  lines.push(`Business: ${analysis.businessName}`);
  lines.push(`Category: ${category}`);
  lines.push(`Location: ${location}`);
  lines.push(`Overall Recommendation Probability: ${Math.round(summary.averageProbability * 100)}%`);
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
    lines.push(`  Recommendation Probability: ${Math.round(report.recommendations.recommendationProbability * 100)}%`);
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

GEO optimizes how AI engines (ChatGPT, Claude, Gemini) recommend businesses. The goal is to increase the probability that these AI engines mention and recommend the business when users ask relevant questions.

You will receive detailed audit findings including per-provider recommendation probabilities, competitor rankings, sentiment analysis, source citations, failed queries, and accuracy data.

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
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Here are the complete GEO audit findings for this business:\n\n${analysisSummary}\n\nGenerate the comprehensive action plan.`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  }, { timeout: 120000 });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Action plan generator returned empty response");
  }

  const raw = JSON.parse(content);
  const validated = ActionPlanOutputSchema.parse(raw);

  // Assemble the final ActionPlan with IDs and counts
  const categories: ActionPlanCategory[] = validated.categories.map((cat) => ({
    key: cat.key,
    label: cat.label,
    description: cat.description,
    estimatedEffort: cat.estimatedEffort,
    priority: cat.priority,
    items: cat.items.map((item, idx) => ({
      id: `${cat.key}-${idx}`, // Temporary IDs — replaced with DB IDs after createMany
      title: item.title,
      description: item.description,
      reasoning: item.reasoning,
      priority: item.priority,
      effort: item.effort,
      dataPoints: item.dataPoints,
      completed: false,
    })),
    completedCount: 0,
  }));

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
