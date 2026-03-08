import type { ParsedResponse } from "./parser";
import type {
  LLMReport,
  LLMInfo,
  CitationMetrics,
  SentimentBreakdown,
  CategoryRanking,
  TopicAssociation,
  CompetitorEntry,
  InformationAccuracy,
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

  // Overall score
  const overallScore = computeGEOScore(citations, sentiment, ranking, topics, accuracy, parsed.length);

  return {
    provider,
    overallScore,
    citations,
    sentiment,
    ranking,
    topics,
    competitors,
    accuracy,
  };
}

function computeGEOScore(
  citations: CitationMetrics,
  sentiment: SentimentBreakdown,
  ranking: CategoryRanking,
  topics: TopicAssociation[],
  accuracy: InformationAccuracy[],
  totalPrompts: number
): number {
  let score = 0;

  // Citation score (0-30): based on mention rate
  const mentionRate = totalPrompts > 0 ? citations.totalMentions / totalPrompts : 0;
  score += Math.round(mentionRate * 30);

  // Sentiment score (0-20): based on positive percentage
  score += Math.round((sentiment.positive / 100) * 20);

  // Ranking score (0-20): higher rank = better
  if (ranking.position > 0 && ranking.totalCompetitors > 0) {
    const rankPct = 1 - (ranking.position - 1) / ranking.totalCompetitors;
    score += Math.round(rankPct * 20);
  }

  // Topic breadth (0-15): more topics = more visibility
  const topicScore = Math.min(topics.length / 8, 1);
  score += Math.round(topicScore * 15);

  // Accuracy (0-15): more correct fields = better
  const correctFields = accuracy.filter((a) => a.status === "correct").length;
  const totalFields = accuracy.length || 1;
  score += Math.round((correctFields / totalFields) * 15);

  return Math.min(Math.max(score, 0), 100);
}

function createEmptyReport(provider: LLMInfo): LLMReport {
  return {
    provider,
    overallScore: 0,
    citations: { totalMentions: 0, primaryRecommendations: 0, passingMentions: 0, mentionTrend: 0 },
    sentiment: { positive: 0, neutral: 100, negative: 0, overallScore: 0, samplePhrases: [] },
    ranking: { category: "Restaurants", position: 0, totalCompetitors: 0, topQueries: [] },
    topics: [],
    competitors: [],
    accuracy: [],
  };
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
  const worst = entries.sort((a, b) => a[1].overallScore - b[1].overallScore)[0]?.[0] ?? "perplexity";
  const totalCitations = Object.values(reports).reduce((sum, r) => sum + r.citations.totalMentions, 0);

  return {
    businessName,
    analyzedAt: new Date().toISOString(),
    reports,
    summary: {
      averageScore: avgScore,
      bestPerformer: best,
      worstPerformer: worst,
      totalCitations,
      overallSentiment: avgScore > 65 ? "positive" : avgScore > 40 ? "neutral" : "negative",
      scoreTrend: 0,
    },
  };
}
