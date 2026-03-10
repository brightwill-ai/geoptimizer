// ── LLM Providers ──
export type LLMProvider = "chatgpt" | "claude" | "gemini";

export interface LLMInfo {
  id: LLMProvider;
  name: string;
  color: string;
}

export const LLM_PROVIDERS: LLMInfo[] = [
  { id: "chatgpt", name: "ChatGPT", color: "#10a37f" },
  { id: "claude", name: "Claude", color: "#c084fc" },
  { id: "gemini", name: "Gemini", color: "#4285f4" },
];

// ── Recommendation Probability (core metric) ──
export interface RecommendationMetrics {
  totalQueries: number;
  mentionCount: number;
  primaryRecommendationCount: number;
  passingMentionCount: number;
  notMentionedCount: number;
  recommendationProbability: number; // 0-1
  primaryProbability: number;        // 0-1
  mentionTrend: number;              // % change from previous audit
}

// ── Per-Query Result (for evidence table) ──
export interface QueryResult {
  queryText: string;
  queryType: string;
  provider: LLMProvider;
  businessMentioned: boolean;
  mentionType: "primary_recommendation" | "passing_mention" | "not_mentioned";
  rankPosition: number | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  rawResponseExcerpt: string; // first ~500 chars for display
  timestamp: string;
}

// ── Methodology Transparency ──
export interface MethodologySection {
  totalQueries: number;
  providers: LLMProvider[];
  dateRange: { start: string; end: string };
  queryTypes: string[];
  verificationPrompts: { prompt: string; expectedResult: string }[];
  disclaimer: string;
}

// ── Source Influence ──
export interface SourceInfluenceEntry {
  source: string;
  sourceType: string;
  citedBy: LLMProvider[];
  citationCount: number;
  influence: "high" | "medium" | "low" | "unknown";
  url?: string;
}

// ── Legacy alias for backward compatibility ──
export interface CitationMetrics {
  totalMentions: number;
  primaryRecommendations: number;
  passingMentions: number;
  mentionTrend: number; // % change
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
  overallScore: number; // -1 to 1
  samplePhrases: { text: string; sentiment: "positive" | "neutral" | "negative" }[];
}

export interface CategoryRanking {
  category: string;
  position: number;
  totalCompetitors: number;
  topQueries: string[];
}

export interface TopicAssociation {
  topic: string;
  frequency: number;
  strength: "strong" | "moderate" | "weak";
}

export interface CompetitorEntry {
  name: string;
  mentionCount: number;
  rank: number;
  isSubject: boolean;
}

export interface InformationAccuracy {
  field: string;
  llmValue: string;
  status: "correct" | "incorrect" | "outdated" | "missing";
}

// ── Source Citation (per-provider) ──
export interface SourceCitation {
  name: string;
  sourceType: "review_platform" | "directory" | "news" | "social_media" | "official_site" | "other";
  count: number;
  url?: string;
}

// ── Per-LLM Report ──
export interface LLMReport {
  provider: LLMInfo;
  overallScore: number; // 0-100
  citations: CitationMetrics;
  recommendations: RecommendationMetrics;
  sentiment: SentimentBreakdown;
  ranking: CategoryRanking;
  topics: TopicAssociation[];
  competitors: CompetitorEntry[];
  accuracy: InformationAccuracy[];
  queryResults: QueryResult[];
  sources: SourceCitation[];
}

// ── Full Analysis ──
export interface GEOAnalysis {
  businessName: string;
  analyzedAt: string;
  reports: Record<LLMProvider, LLMReport>;
  methodology: MethodologySection;
  sourceInfluences: SourceInfluenceEntry[];
  summary: {
    averageScore: number;
    averageProbability: number; // 0-1
    bestPerformer: LLMProvider;
    worstPerformer: LLMProvider;
    totalCitations: number;
    totalQueries: number;
    overallSentiment: "positive" | "neutral" | "negative";
    scoreTrend: number;
  };
}

// ── Action Plan Types ──
export interface ActionPlanItemData {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  priority: "critical" | "high" | "medium" | "low";
  effort: "quick_win" | "half_day" | "1_2_days" | "1_week" | "ongoing";
  dataPoints: string[];
  completed: boolean;
}

export interface ActionPlanCategory {
  key: string;
  label: string;
  description: string;
  estimatedEffort: string;
  priority: "critical" | "high" | "medium" | "low";
  items: ActionPlanItemData[];
  completedCount: number;
}

export interface ActionPlan {
  generatedAt: string;
  businessName: string;
  totalItems: number;
  completedItems: number;
  categories: ActionPlanCategory[];
  estimatedTotalEffort: string;
}

// ── Simple hash for deterministic mock data ──
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

function pickFromArray<T>(arr: T[], seed: number, index: number): T {
  return arr[Math.floor(seededRandom(seed, index) * arr.length)];
}

// ── Mock Data Generator ──
export function generateMockAnalysis(businessName: string): GEOAnalysis {
  const seed = hashString(businessName);
  let idx = 0;
  const next = () => seededRandom(seed, idx++);

  const competitorNames = [
    "Sakura Garden", "Golden Dragon", "The Local Kitchen",
    "Bella Trattoria", "Blue Fin Sushi", "Harvest Table",
    "Spice Route", "Ocean Grill", "The Rustic Fork",
    "Maple & Vine", "Red Lantern", "Coastal Bites",
  ];

  const topicOptions = [
    "best restaurants nearby", "date night dinner", "family friendly restaurant",
    "best sushi", "outdoor dining", "brunch spots", "fine dining",
    "cheap eats", "late night food", "business lunch",
    "romantic restaurant", "group dining", "best pasta",
    "healthy food options", "best seafood",
  ];

  const categoryOptions = [
    "Restaurants", "Fine Dining", "Casual Dining",
    "Japanese Restaurants", "Italian Restaurants", "Seafood Restaurants",
    "Asian Restaurants", "American Restaurants",
  ];

  const sentimentPhrases = {
    positive: [
      `"${businessName} is a top choice for quality dining"`,
      `"Highly recommended for its authentic flavors"`,
      `"One of the best dining experiences in the area"`,
      `"Known for excellent service and atmosphere"`,
      `"A must-visit spot with consistently great reviews"`,
    ],
    neutral: [
      `"${businessName} is one of several options in the area"`,
      `"A decent option among local restaurants"`,
      `"Offers standard fare at reasonable prices"`,
    ],
    negative: [
      `"Some reviewers mention inconsistent quality"`,
      `"Wait times can be lengthy during peak hours"`,
      `"Parking can be challenging at this location"`,
    ],
  };

  const accuracyFields = [
    { field: "Address", correct: `123 Main St, ${businessName.split(" ").pop() || "Downtown"}` },
    { field: "Phone Number", correct: `(555) ${Math.floor(100 + next() * 900)}-${Math.floor(1000 + next() * 9000)}` },
    { field: "Hours", correct: "11:00 AM – 10:00 PM" },
    { field: "Price Range", correct: "$$ – $$$" },
    { field: "Cuisine Type", correct: pickFromArray(["Japanese", "Italian", "American", "Seafood", "Asian Fusion"], seed, 99) },
    { field: "Website", correct: `www.${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com` },
  ];

  const scoresByProvider: Record<LLMProvider, number> = {
    chatgpt: Math.floor(65 + next() * 30),
    claude: Math.floor(55 + next() * 35),
    gemini: Math.floor(50 + next() * 35),
  };

  function generateReport(provider: LLMInfo): LLMReport {
    const score = scoresByProvider[provider.id];
    const mentionBase = Math.floor(20 + next() * 80);
    const primaryPct = 0.3 + next() * 0.4;

    // Pick 4-6 competitors
    const numCompetitors = 4 + Math.floor(next() * 3);
    const shuffled = [...competitorNames].sort(() => next() - 0.5);
    const picked = shuffled.slice(0, numCompetitors);
    const subjectRank = 1 + Math.floor(next() * (numCompetitors + 1));

    const competitors: CompetitorEntry[] = [];
    let rankCounter = 1;
    for (let i = 0; i < numCompetitors + 1; i++) {
      if (rankCounter === subjectRank) {
        competitors.push({
          name: businessName,
          mentionCount: Math.floor(mentionBase * (1 - (subjectRank - 1) * 0.1)),
          rank: subjectRank,
          isSubject: true,
        });
        rankCounter++;
      }
      if (i < numCompetitors) {
        competitors.push({
          name: picked[i],
          mentionCount: Math.floor(mentionBase * (1 - rankCounter * 0.08) + next() * 10),
          rank: rankCounter,
          isSubject: false,
        });
        rankCounter++;
      }
    }
    competitors.sort((a, b) => a.rank - b.rank);

    // Topics
    const numTopics = 5 + Math.floor(next() * 4);
    const shuffledTopics = [...topicOptions].sort(() => next() - 0.5);
    const topics: TopicAssociation[] = shuffledTopics.slice(0, numTopics).map((topic) => ({
      topic,
      frequency: Math.floor(5 + next() * 45),
      strength: next() > 0.6 ? "strong" : next() > 0.3 ? "moderate" : "weak",
    }));
    topics.sort((a, b) => b.frequency - a.frequency);

    // Sentiment
    const posBase = 50 + Math.floor(next() * 35);
    const negBase = Math.floor(next() * 15);
    const neuBase = 100 - posBase - negBase;

    const phrases: SentimentBreakdown["samplePhrases"] = [
      { text: pickFromArray(sentimentPhrases.positive, seed, idx++), sentiment: "positive" as const },
      { text: pickFromArray(sentimentPhrases.positive, seed, idx++), sentiment: "positive" as const },
      { text: pickFromArray(sentimentPhrases.neutral, seed, idx++), sentiment: "neutral" as const },
      ...(negBase > 5 ? [{ text: pickFromArray(sentimentPhrases.negative, seed, idx++), sentiment: "negative" as const }] : []),
    ];

    // Accuracy
    const accuracy: InformationAccuracy[] = accuracyFields.map((f) => {
      const roll = next();
      let status: InformationAccuracy["status"];
      let value = f.correct;
      if (roll > 0.7) {
        status = "correct";
      } else if (roll > 0.4) {
        status = "outdated";
        value = f.correct + " (may be outdated)";
      } else if (roll > 0.15) {
        status = "incorrect";
        value = "Not available";
      } else {
        status = "missing";
        value = "—";
      }
      return { field: f.field, llmValue: value, status };
    });

    const category = pickFromArray(categoryOptions, seed, idx++);
    const totalInCategory = 30 + Math.floor(next() * 40);

    // Mock recommendation metrics
    const mockTotalQueries = 5;
    const mockMentionCount = Math.floor(1 + next() * 4);
    const mockPrimaryCount = Math.floor(next() * mockMentionCount);
    const mockPassingCount = mockMentionCount - mockPrimaryCount;

    return {
      provider,
      overallScore: score,
      citations: {
        totalMentions: mentionBase,
        primaryRecommendations: Math.floor(mentionBase * primaryPct),
        passingMentions: Math.floor(mentionBase * (1 - primaryPct)),
        mentionTrend: Math.floor(-10 + next() * 30),
      },
      recommendations: {
        totalQueries: mockTotalQueries,
        mentionCount: mockMentionCount,
        primaryRecommendationCount: mockPrimaryCount,
        passingMentionCount: mockPassingCount,
        notMentionedCount: mockTotalQueries - mockMentionCount,
        recommendationProbability: mockMentionCount / mockTotalQueries,
        primaryProbability: mockPrimaryCount / mockTotalQueries,
        mentionTrend: 0,
      },
      sentiment: {
        positive: posBase,
        neutral: neuBase,
        negative: negBase,
        overallScore: parseFloat(((posBase - negBase) / 100).toFixed(2)),
        samplePhrases: phrases,
      },
      ranking: {
        category,
        position: subjectRank,
        totalCompetitors: totalInCategory,
        topQueries: shuffledTopics.slice(0, 3),
      },
      topics,
      competitors,
      accuracy,
      queryResults: [],
      sources: ([
        { name: "Google Reviews", sourceType: "review_platform" as const, count: Math.floor(2 + next() * 6) },
        { name: "Yelp", sourceType: "review_platform" as const, count: Math.floor(1 + next() * 5) },
        { name: "TripAdvisor", sourceType: "review_platform" as const, count: Math.floor(next() * 4) },
        { name: "Google Maps", sourceType: "directory" as const, count: Math.floor(1 + next() * 4) },
        { name: "Official Website", sourceType: "official_site" as const, count: Math.floor(next() * 3) },
        { name: "Local News", sourceType: "news" as const, count: Math.floor(next() * 2) },
      ] satisfies SourceCitation[]).filter((s) => s.count > 0),
    };
  }

  const reports = {} as Record<LLMProvider, LLMReport>;
  for (const provider of LLM_PROVIDERS) {
    reports[provider.id] = generateReport(provider);
  }

  const scores = Object.values(scoresByProvider);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const best = (Object.entries(scoresByProvider) as [LLMProvider, number][]).sort((a, b) => b[1] - a[1])[0][0];
  const worst = (Object.entries(scoresByProvider) as [LLMProvider, number][]).sort((a, b) => a[1] - b[1])[0][0];
  const totalCitations = Object.values(reports).reduce((sum, r) => sum + r.citations.totalMentions, 0);

  const allProbs = Object.values(reports).map((r) => r.recommendations.recommendationProbability);
  const avgProb = allProbs.length > 0 ? allProbs.reduce((a, b) => a + b, 0) / allProbs.length : 0;
  const totalQueries = Object.values(reports).reduce((sum, r) => sum + r.recommendations.totalQueries, 0);

  return {
    businessName,
    analyzedAt: new Date().toISOString(),
    reports,
    methodology: {
      totalQueries,
      providers: LLM_PROVIDERS.map((p) => p.id),
      dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
      queryTypes: ["discovery", "direct", "comparison", "use_case", "reviews"],
      verificationPrompts: [],
      disclaimer: "Results reflect a statistical sample and individual queries may vary.",
    },
    sourceInfluences: [],
    summary: {
      averageScore: avgScore,
      averageProbability: parseFloat(avgProb.toFixed(2)),
      bestPerformer: best,
      worstPerformer: worst,
      totalCitations,
      totalQueries,
      overallSentiment: avgScore > 65 ? "positive" : avgScore > 40 ? "neutral" : "negative",
      scoreTrend: Math.floor(-5 + next() * 20),
    },
  };
}
