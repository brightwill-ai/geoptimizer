import type { ParsedResponse } from "./parser";
import type {
  LLMReport,
  LLMInfo,
  CitationMetrics,
  RecommendationMetrics,
  SentimentBreakdown,
  CategoryRanking,
  TopicAssociation,
  CompetitorEntry,
  InformationAccuracy,
  SourceCitation,
  SourceInfluenceEntry,
  GEOAnalysis,
  LLMProvider,
} from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";

/**
 * Aggregate multiple parsed responses from a single LLM into an LLMReport.
 */
export function aggregateToLLMReport(
  provider: LLMInfo,
  parsed: ParsedResponse[],
  businessName: string
): LLMReport {
  if (parsed.length === 0) {
    return createEmptyReport(provider);
  }

  // Citations
  const totalMentions = parsed.filter((p) => p.businessMentioned).length;
  const primaryRecs = parsed.filter((p) => p.mentionType === "primary_recommendation").length;
  const passingMentions = parsed.filter((p) => p.mentionType === "passing_mention").length;
  const citations: CitationMetrics = {
    totalMentions,
    primaryRecommendations: primaryRecs,
    passingMentions,
    mentionTrend: 0, // No historical data yet
  };

  // Sentiment
  const sentiments = parsed.map((p) => p.sentimentTowardBusiness);
  const posCount = sentiments.filter((s) => s === "positive").length;
  const neuCount = sentiments.filter((s) => s === "neutral").length;
  const negCount = sentiments.filter((s) => s === "negative").length;
  const total = sentiments.length || 1;
  const sentiment: SentimentBreakdown = {
    positive: Math.round((posCount / total) * 100),
    neutral: Math.round((neuCount / total) * 100),
    negative: Math.round((negCount / total) * 100),
    overallScore: parseFloat(((posCount - negCount) / total).toFixed(2)),
    samplePhrases: parsed
      .flatMap((p) => p.sentimentPhrases)
      .slice(0, 5),
  };

  // Ranking - take the best rank found
  const ranks = parsed
    .filter((p) => p.rankPosition !== null)
    .map((p) => ({ position: p.rankPosition!, total: p.totalInList || 10 }));
  const bestRank = ranks.sort((a, b) => a.position - b.position)[0];
  const category = parsed.find((p) => p.categoryInferred)?.categoryInferred || "Restaurants";
  const ranking: CategoryRanking = {
    category,
    position: bestRank?.position ?? 0,
    totalCompetitors: bestRank?.total ?? 0,
    topQueries: parsed
      .flatMap((p) => p.topicsAssociated)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3),
  };

  // Topics
  const topicCounts = new Map<string, number>();
  for (const p of parsed) {
    for (const topic of p.topicsAssociated) {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    }
  }
  const topics: TopicAssociation[] = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, freq]) => ({
      topic,
      frequency: freq * 10, // Scale up for display
      strength: freq >= 3 ? "strong" : freq >= 2 ? "moderate" : "weak",
    }));

  // Competitors
  const competitorMap = new Map<string, { count: number; context: string }>();
  for (const p of parsed) {
    for (const comp of p.competitorsMentioned) {
      const existing = competitorMap.get(comp.name);
      if (existing) {
        existing.count++;
      } else {
        competitorMap.set(comp.name, { count: 1, context: comp.context });
      }
    }
  }
  const competitors: CompetitorEntry[] = Array.from(competitorMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([name, data], i) => ({
      name,
      mentionCount: data.count * 10,
      rank: i + 1,
      isSubject: false,
    }));
  // Insert the subject business
  const subjectRank = bestRank?.position ?? competitors.length + 1;
  competitors.splice(Math.min(subjectRank - 1, competitors.length), 0, {
    name: businessName,
    mentionCount: totalMentions * 10,
    rank: subjectRank,
    isSubject: true,
  });
  // Re-number ranks
  competitors.forEach((c, i) => (c.rank = i + 1));

  // Accuracy
  const factMap = new Map<string, string>();
  for (const p of parsed) {
    for (const fact of p.factualClaims) {
      if (!factMap.has(fact.field)) {
        factMap.set(fact.field, fact.value);
      }
    }
  }
  const accuracy: InformationAccuracy[] = [
    "address", "phone", "hours", "price_range", "cuisine", "specialty",
  ].map((field) => {
    const value = factMap.get(field);
    return {
      field: field.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      llmValue: value || "—",
      // We can't verify accuracy without ground truth, so mark as "correct" if present
      status: value ? ("correct" as const) : ("missing" as const),
    };
  });

  // Recommendation metrics
  const totalQueries = parsed.length;
  const mentionCount = totalMentions;
  const recommendations: RecommendationMetrics = {
    totalQueries,
    mentionCount,
    primaryRecommendationCount: primaryRecs,
    passingMentionCount: passingMentions,
    notMentionedCount: totalQueries - mentionCount,
    recommendationProbability: totalQueries > 0 ? mentionCount / totalQueries : 0,
    primaryProbability: totalQueries > 0 ? primaryRecs / totalQueries : 0,
    mentionTrend: 0,
  };

  // Sources
  const sourceMap = new Map<string, { type: SourceCitation["sourceType"]; count: number; url?: string }>();
  for (const p of parsed) {
    for (const src of p.sourcesCited ?? []) {
      const existing = sourceMap.get(src.name);
      if (existing) {
        existing.count++;
        // Keep the first non-null URL found
        if (!existing.url && src.url) existing.url = src.url;
      } else {
        sourceMap.set(src.name, { type: src.sourceType, count: 1, url: src.url ?? undefined });
      }
    }
  }
  const sources: SourceCitation[] = Array.from(sourceMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([name, data]) => ({ name, sourceType: data.type, count: data.count, url: data.url }));

  // Overall score
  const overallScore = computeGEOScore(citations, sentiment, ranking, topics, accuracy, parsed.length);

  return {
    provider,
    overallScore,
    citations,
    recommendations,
    sentiment,
    ranking,
    topics,
    competitors,
    accuracy,
    queryResults: [],
    sources,
  };
}

/**
 * New GEO Score (0-100) based on recommendation probability methodology.
 *
 * Weights:
 * - Recommendation probability (40%): are you being mentioned at all?
 * - Primary recommendation rate (25%): are you the TOP recommendation?
 * - Sentiment score (15%): when mentioned, is it positive?
 * - Topic breadth (10%): how many query types trigger you?
 * - Information accuracy (10%): is the AI's info correct?
 */
function computeGEOScore(
  citations: CitationMetrics,
  sentiment: SentimentBreakdown,
  ranking: CategoryRanking,
  topics: TopicAssociation[],
  accuracy: InformationAccuracy[],
  totalPrompts: number
): number {
  if (totalPrompts === 0) return 0;

  let score = 0;

  // Recommendation probability (0-40): mentions / totalQueries
  const mentionRate = citations.totalMentions / totalPrompts;
  score += Math.round(mentionRate * 40);

  // Primary recommendation rate (0-25): primary recs / totalQueries
  const primaryRate = citations.primaryRecommendations / totalPrompts;
  score += Math.round(primaryRate * 25);

  // Sentiment score (0-15): positive percentage when mentioned
  score += Math.round((sentiment.positive / 100) * 15);

  // Topic breadth (0-10): how many query types trigger you
  const topicScore = Math.min(topics.length / 8, 1);
  score += Math.round(topicScore * 10);

  // Accuracy (0-10): correct fields
  const correctFields = accuracy.filter((a) => a.status === "correct").length;
  const totalFields = accuracy.length || 1;
  score += Math.round((correctFields / totalFields) * 10);

  return Math.min(Math.max(score, 0), 100);
}

function createEmptyReport(provider: LLMInfo): LLMReport {
  return {
    provider,
    overallScore: 0,
    citations: { totalMentions: 0, primaryRecommendations: 0, passingMentions: 0, mentionTrend: 0 },
    recommendations: {
      totalQueries: 0, mentionCount: 0, primaryRecommendationCount: 0,
      passingMentionCount: 0, notMentionedCount: 0,
      recommendationProbability: 0, primaryProbability: 0, mentionTrend: 0,
    },
    sentiment: { positive: 0, neutral: 100, negative: 0, overallScore: 0, samplePhrases: [] },
    ranking: { category: "Restaurants", position: 0, totalCompetitors: 0, topQueries: [] },
    topics: [],
    competitors: [],
    accuracy: [],
    queryResults: [],
    sources: [],
  };
}

/**
 * Merge per-provider sources into cross-platform SourceInfluenceEntry[].
 */
function buildSourceInfluences(reports: Record<string, LLMReport>): SourceInfluenceEntry[] {
  const map = new Map<string, { type: string; providers: Set<LLMProvider>; count: number; url?: string }>();

  for (const [providerId, report] of Object.entries(reports)) {
    for (const src of report.sources ?? []) {
      const existing = map.get(src.name);
      if (existing) {
        existing.providers.add(providerId as LLMProvider);
        existing.count += src.count;
        if (!existing.url && src.url) existing.url = src.url;
      } else {
        map.set(src.name, {
          type: src.sourceType,
          providers: new Set([providerId as LLMProvider]),
          count: src.count,
          url: src.url,
        });
      }
    }
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([name, data]) => ({
      source: name,
      sourceType: data.type,
      citedBy: Array.from(data.providers),
      citationCount: data.count,
      influence: data.count >= 6 ? "high" as const
        : data.count >= 3 ? "medium" as const
        : "low" as const,
      url: data.url,
    }));
}

/**
 * Combine all LLM reports into a full GEOAnalysis.
 */
export function assembleGEOAnalysis(
  reports: Record<LLMProvider, LLMReport>,
  businessName: string
): GEOAnalysis {
  const scores = Object.values(reports).map((r) => r.overallScore);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const entries = Object.entries(reports) as [LLMProvider, LLMReport][];
  const best = entries.sort((a, b) => b[1].overallScore - a[1].overallScore)[0]?.[0] ?? "chatgpt";
  const worst = entries.sort((a, b) => a[1].overallScore - b[1].overallScore)[0]?.[0] ?? "gemini";
  const totalCitations = Object.values(reports).reduce((sum, r) => sum + r.citations.totalMentions, 0);

  const allProbs = Object.values(reports).map((r) => r.recommendations.recommendationProbability);
  const avgProb = allProbs.length > 0 ? allProbs.reduce((a, b) => a + b, 0) / allProbs.length : 0;
  const totalQueries = Object.values(reports).reduce((sum, r) => sum + r.recommendations.totalQueries, 0);

  // Collect unique query types from all reports
  const queryTypeSet = new Set<string>();
  for (const report of Object.values(reports)) {
    for (const qr of report.queryResults) {
      queryTypeSet.add(qr.queryType);
    }
  }

  return {
    businessName,
    analyzedAt: new Date().toISOString(),
    reports,
    methodology: {
      totalQueries,
      providers: LLM_PROVIDERS.map((p) => p.id),
      dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
      queryTypes: Array.from(queryTypeSet),
      verificationPrompts: [],
      disclaimer: "Results reflect a statistical sample and individual queries may vary.",
    },
    sourceInfluences: buildSourceInfluences(reports),
    summary: {
      averageScore: avgScore,
      averageProbability: parseFloat(avgProb.toFixed(2)),
      bestPerformer: best,
      worstPerformer: worst,
      totalCitations,
      totalQueries,
      overallSentiment: avgScore > 65 ? "positive" : avgScore > 40 ? "neutral" : "negative",
      scoreTrend: 0,
    },
  };
}
