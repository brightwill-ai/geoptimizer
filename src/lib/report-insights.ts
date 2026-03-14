import type {
  ActionPlan,
  ActionPlanItemData,
  GEOAnalysis,
  InformationAccuracy,
  LLMProvider,
  LLMReport,
  QueryResult,
  SourceCitation,
  SourceInfluenceEntry,
} from "@/lib/mock-data";

export const QUERY_TYPE_LABELS: Record<string, string> = {
  discovery: "Discovery",
  direct: "Direct",
  comparison: "Comparison",
  use_case: "Use case",
  reviews: "Reviews",
  specifics: "Specifics",
  source_probing: "Source probing",
  verification: "Verification",
  reputation: "Reputation",
  rephrased_discovery: "Rephrased",
};

export interface VisibilityDescriptor {
  label: "Strong" | "Mixed" | "Weak";
  color: string;
  background: string;
  description: string;
}

export interface QueryTypeStat {
  type: string;
  label: string;
  total: number;
  mentioned: number;
  primary: number;
  mentionRate: number;
  primaryRate: number;
}

export interface ProviderSnapshot {
  id: LLMProvider;
  name: string;
  color: string;
  probability: number;
  mentionCount: number;
  totalQueries: number;
  topCompetitor: string | null;
  sourceCount: number;
  accuracyRate: number | null;
}

export interface KeyFinding {
  title: string;
  detail: string;
  tone: "positive" | "warning" | "negative" | "neutral";
}

export interface ReportSnapshot {
  visibility: VisibilityDescriptor;
  strongestQueryType: QueryTypeStat | null;
  weakestQueryType: QueryTypeStat | null;
  topCompetitor: string | null;
  subjectRank: number | null;
  topSource: SourceCitation | null;
  accuracyIssues: InformationAccuracy[];
  negativeMentions: number;
  sentimentLabel: "positive" | "neutral" | "negative";
  sampleQuote: string | null;
  blockers: KeyFinding[];
  wins: KeyFinding[];
}

export interface AnalysisSnapshot {
  visibility: VisibilityDescriptor;
  providerSnapshots: ProviderSnapshot[];
  bestProvider: ProviderSnapshot | null;
  worstProvider: ProviderSnapshot | null;
  averageProbability: number;
  topCompetitor: string | null;
  strongestQueryType: QueryTypeStat | null;
  weakestQueryType: QueryTypeStat | null;
  topSource: SourceInfluenceEntry | null;
  topSourceGap: string | null;
  accuracyIssues: InformationAccuracy[];
  findings: KeyFinding[];
  wins: KeyFinding[];
}

function getSentimentLabel(positive: number, negative: number): "positive" | "neutral" | "negative" {
  if (positive >= 60) return "positive";
  if (negative >= 30) return "negative";
  return "neutral";
}

export function getVisibilityDescriptor(probability: number): VisibilityDescriptor {
  if (probability >= 0.6) {
    return {
      label: "Strong",
      color: "#16a34a",
      background: "rgba(22,163,74,0.14)",
      description: "The business is recommended consistently in relevant prompts.",
    };
  }

  if (probability >= 0.3) {
    return {
      label: "Mixed",
      color: "#d97706",
      background: "rgba(217,119,6,0.14)",
      description: "The business appears often enough to be competitive, but not reliably.",
    };
  }

  return {
    label: "Weak",
    color: "#dc2626",
    background: "rgba(220,38,38,0.14)",
    description: "The business is missing from too many relevant prompts to be dependable.",
  };
}

export function formatQueryTypeLabel(type: string): string {
  return QUERY_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export function getQueryTypeStats(queryResults: QueryResult[]): QueryTypeStat[] {
  const grouped = new Map<string, QueryTypeStat>();

  for (const query of queryResults) {
    const current = grouped.get(query.queryType) ?? {
      type: query.queryType,
      label: formatQueryTypeLabel(query.queryType),
      total: 0,
      mentioned: 0,
      primary: 0,
      mentionRate: 0,
      primaryRate: 0,
    };

    current.total += 1;
    if (query.businessMentioned) current.mentioned += 1;
    if (query.mentionType === "primary_recommendation") current.primary += 1;
    grouped.set(query.queryType, current);
  }

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      mentionRate: item.total > 0 ? item.mentioned / item.total : 0,
      primaryRate: item.total > 0 ? item.primary / item.total : 0,
    }))
    .sort((a, b) => b.mentionRate - a.mentionRate);
}

export function getAccuracyIssues(accuracy: InformationAccuracy[]): InformationAccuracy[] {
  return accuracy.filter((item) => item.status !== "correct");
}

export function getAccuracyRate(accuracy: InformationAccuracy[]): number | null {
  if (accuracy.length === 0) return null;
  const correct = accuracy.filter((item) => item.status === "correct").length;
  return Math.round((correct / accuracy.length) * 100);
}

function getTopCompetitor(report: LLMReport): string | null {
  return report.competitors.find((competitor) => !competitor.isSubject && competitor.rank === 1)?.name ?? null;
}

function getSubjectRank(report: LLMReport): number | null {
  return report.competitors.find((competitor) => competitor.isSubject)?.rank ?? report.ranking.position ?? null;
}

function collectUniqueAccuracyIssues(reports: LLMReport[]): InformationAccuracy[] {
  const seen = new Set<string>();
  const issues: InformationAccuracy[] = [];

  for (const report of reports) {
    for (const item of report.accuracy) {
      if (item.status === "correct") continue;
      const key = `${item.field}:${item.status}:${item.llmValue}`;
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push(item);
    }
  }

  return issues;
}

function findTopSourceGap(
  providers: ProviderSnapshot[],
  sourceInfluences: SourceInfluenceEntry[]
): string | null {
  const officialSiteSeen = sourceInfluences.some((source) => source.sourceType === "official_site");
  if (!officialSiteSeen) return "No AI model cited the official website.";

  const weakProviders = providers.filter((provider) => provider.sourceCount < 2);
  if (weakProviders.length > 0) {
    return `${weakProviders[0].name} relies on very few citation sources.`;
  }

  const directoryCoverage = sourceInfluences.filter((source) => source.sourceType === "directory").length;
  if (directoryCoverage === 0) return "Directory coverage is thin across AI models.";

  return null;
}

function buildBlockers(report: LLMReport, queryTypeStats: QueryTypeStat[]): KeyFinding[] {
  const blockers: KeyFinding[] = [];
  const weakestQueryType = queryTypeStats[queryTypeStats.length - 1] ?? null;
  const topCompetitor = getTopCompetitor(report);
  const accuracyIssues = getAccuracyIssues(report.accuracy);
  const sentimentLabel = getSentimentLabel(report.sentiment.positive, report.sentiment.negative);

  if (weakestQueryType && weakestQueryType.mentionRate < 0.4) {
    blockers.push({
      title: `${weakestQueryType.label} queries are underperforming`,
      detail: `${Math.round(weakestQueryType.mentionRate * 100)}% mention rate in that intent cluster.`,
      tone: "negative",
    });
  }

  if (topCompetitor) {
    blockers.push({
      title: `${topCompetitor} is still the default recommendation`,
      detail: `On ${report.provider.name}, the top recommendation still defaults to ${topCompetitor} more often than this business.`,
      tone: "warning",
    });
  }

  if (accuracyIssues.length > 0) {
    blockers.push({
      title: `${accuracyIssues.length} business facts look unreliable`,
      detail: `Incorrect, missing, or outdated fields reduce trust in AI responses.`,
      tone: "warning",
    });
  }

  if (sentimentLabel === "negative") {
    blockers.push({
      title: `Negative language is showing up in responses`,
      detail: `${report.sentiment.negative}% of mentions lean negative.`,
      tone: "negative",
    });
  }

  return blockers.slice(0, 3);
}

function buildWins(report: LLMReport, queryTypeStats: QueryTypeStat[]): KeyFinding[] {
  const wins: KeyFinding[] = [];
  const strongestQueryType = queryTypeStats[0] ?? null;
  const topSource = report.sources[0] ?? null;

  if (strongestQueryType) {
    wins.push({
      title: `${strongestQueryType.label} is a real entry point`,
      detail: `${Math.round(strongestQueryType.mentionRate * 100)}% mention rate in that query type.`,
      tone: "positive",
    });
  }

  if (report.recommendations.primaryRecommendationCount > 0) {
    wins.push({
      title: `The business can compete when AI already knows the category`,
      detail: `${report.provider.name} already uses it as a primary recommendation in ${report.recommendations.primaryRecommendationCount} prompts.`,
      tone: "positive",
    });
  }

  if (topSource) {
    wins.push({
      title: `${topSource.name} is influencing visibility`,
      detail: `${topSource.count} citations make it one of the strongest current signals.`,
      tone: "neutral",
    });
  }

  return wins.slice(0, 3);
}

export function getReportSnapshot(report: LLMReport): ReportSnapshot {
  const queryTypeStats = getQueryTypeStats(report.queryResults);
  const sentimentLabel = getSentimentLabel(report.sentiment.positive, report.sentiment.negative);
  const sampleQuote = report.sentiment.samplePhrases[0]?.text ?? null;

  return {
    visibility: getVisibilityDescriptor(report.recommendations.recommendationProbability),
    strongestQueryType: queryTypeStats[0] ?? null,
    weakestQueryType: queryTypeStats[queryTypeStats.length - 1] ?? null,
    topCompetitor: getTopCompetitor(report),
    subjectRank: getSubjectRank(report),
    topSource: report.sources[0] ?? null,
    accuracyIssues: getAccuracyIssues(report.accuracy),
    negativeMentions: report.sentiment.negative,
    sentimentLabel,
    sampleQuote,
    blockers: buildBlockers(report, queryTypeStats),
    wins: buildWins(report, queryTypeStats),
  };
}

export function getProviderSnapshots(analysis: GEOAnalysis): ProviderSnapshot[] {
  return Object.entries(analysis.reports)
    .map(([id, report]) => ({
      id: id as LLMProvider,
      name: report.provider.name,
      color: report.provider.color,
      probability: report.recommendations.recommendationProbability,
      mentionCount: report.recommendations.mentionCount,
      totalQueries: report.recommendations.totalQueries,
      topCompetitor: getTopCompetitor(report),
      sourceCount: report.sources.length,
      accuracyRate: getAccuracyRate(report.accuracy),
    }))
    .sort((a, b) => b.probability - a.probability);
}

export function getAnalysisSnapshot(analysis: GEOAnalysis): AnalysisSnapshot {
  const providerSnapshots = getProviderSnapshots(analysis);
  const allReports = Object.values(analysis.reports);
  const allQueries = allReports.flatMap((report) => report.queryResults);
  const queryTypeStats = getQueryTypeStats(allQueries);
  const topSource =
    [...analysis.sourceInfluences].sort((a, b) => b.citationCount - a.citationCount)[0] ?? null;
  const accuracyIssues = collectUniqueAccuracyIssues(allReports);

  const findings: KeyFinding[] = [];
  const wins: KeyFinding[] = [];
  const bestProvider = providerSnapshots[0] ?? null;
  const worstProvider = providerSnapshots[providerSnapshots.length - 1] ?? null;

  if (worstProvider && worstProvider.topCompetitor) {
    findings.push({
      title: `${worstProvider.name} has the biggest visibility gap`,
      detail: `${Math.round(worstProvider.probability * 100)}% probability while ${worstProvider.topCompetitor} often wins the prompt.`,
      tone: worstProvider.probability < 0.3 ? "negative" : "warning",
    });
  }

  if (queryTypeStats.length > 0) {
    const weakest = queryTypeStats[queryTypeStats.length - 1];
    const strongest = queryTypeStats[0];
    findings.push({
      title: `${weakest.label} is the main blind spot`,
      detail: `${Math.round(weakest.mentionRate * 100)}% mention rate versus ${Math.round(strongest.mentionRate * 100)}% for ${strongest.label}.`,
      tone: weakest.mentionRate < 0.3 ? "negative" : "warning",
    });
  }

  if (accuracyIssues.length > 0) {
    findings.push({
      title: `${accuracyIssues.length} factual issues are affecting trust`,
      detail: `AI responses still contain missing, outdated, or incorrect business information.`,
      tone: "warning",
    });
  }

  if (bestProvider) {
    wins.push({
      title: `${bestProvider.name} is the strongest current channel`,
      detail: `${Math.round(bestProvider.probability * 100)}% recommendation probability gives the clearest proof point.`,
      tone: "positive",
    });
  }

  if (topSource) {
    wins.push({
      title: `${topSource.source} is a meaningful citation source`,
      detail: `It appears ${topSource.citationCount} times across all AI models.`,
      tone: "neutral",
    });
  }

  return {
    visibility: getVisibilityDescriptor(analysis.summary.averageProbability),
    providerSnapshots,
    bestProvider,
    worstProvider,
    averageProbability: analysis.summary.averageProbability,
    topCompetitor: providerSnapshots.find((provider) => provider.topCompetitor)?.topCompetitor ?? null,
    strongestQueryType: queryTypeStats[0] ?? null,
    weakestQueryType: queryTypeStats[queryTypeStats.length - 1] ?? null,
    topSource,
    topSourceGap: findTopSourceGap(providerSnapshots, analysis.sourceInfluences),
    accuracyIssues,
    findings: findings.slice(0, 3),
    wins: wins.slice(0, 3),
  };
}

export function getActionPlanPreview(plan: ActionPlan | null | undefined, limit = 5): ActionPlanItemData[] {
  if (!plan) return [];

  const priorityRank = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return plan.categories
    .flatMap((category) => category.items)
    .slice()
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, limit);
}
