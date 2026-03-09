"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { GEOAnalysis, LLMProvider } from "@/lib/mock-data";

interface ActionItemsProps {
  analysis: GEOAnalysis;
  businessName: string;
}

interface ActionItem {
  priority: "high" | "medium" | "low";
  category: string;
  action: string;
  reason: string;
}

const PRIORITY_CONFIG = {
  high: { color: "#dc2626", bg: "rgba(220,38,38,0.12)", label: "High" },
  medium: { color: "#d97706", bg: "rgba(217,119,6,0.12)", label: "Medium" },
  low: { color: "#16a34a", bg: "rgba(22,163,74,0.12)", label: "Low" },
} as const;

function generateRecommendations(
  analysis: GEOAnalysis,
  businessName: string
): ActionItem[] {
  const items: ActionItem[] = [];
  const { summary, reports, sourceInfluences } = analysis;

  // --- 1. Overall recommendation probability ---
  const avgProb = summary.averageProbability;
  if (avgProb < 0.3) {
    items.push({
      priority: "high",
      category: "Online Presence",
      action: `Strengthen ${businessName}'s digital footprint across review sites, directories, and social media to increase AI visibility from the current ${Math.round(avgProb * 100)}% recommendation rate.`,
      reason: `AI engines only recommend ${businessName} ${Math.round(avgProb * 100)}% of the time. A stronger online presence gives these models more positive signals to draw from.`,
    });
  } else if (avgProb < 0.6) {
    items.push({
      priority: "medium",
      category: "Online Presence",
      action: `Expand ${businessName}'s presence on niche directories and industry-specific platforms to push recommendation probability above 60%.`,
      reason: `At ${Math.round(avgProb * 100)}% recommendation probability, there is meaningful room to grow by broadening the sources AI engines can reference.`,
    });
  }

  // --- 2. Discovery query performance ---
  const allQueryResults = Object.values(reports).flatMap(
    (r) => r.queryResults
  );
  const discoveryQueries = allQueryResults.filter(
    (q) => q.queryType === "discovery"
  );
  if (discoveryQueries.length > 0) {
    const discoveryMentionRate =
      discoveryQueries.filter((q) => q.businessMentioned).length /
      discoveryQueries.length;
    if (discoveryMentionRate < 0.4) {
      items.push({
        priority: "high",
        category: "Content Strategy",
        action: `Create location-specific content and optimize for broad discovery queries where ${businessName} was mentioned only ${Math.round(discoveryMentionRate * 100)}% of the time.`,
        reason:
          "Discovery queries (e.g. \"best restaurants near me\") are how new customers find businesses through AI. Low visibility here means missed first-impression opportunities.",
      });
    }
  }

  // --- 3. Sentiment analysis ---
  const allReports = Object.values(reports);
  const avgNegative =
    allReports.reduce((sum, r) => sum + r.sentiment.negative, 0) /
    allReports.length;
  const avgPositive =
    allReports.reduce((sum, r) => sum + r.sentiment.positive, 0) /
    allReports.length;

  if (avgNegative > 15) {
    const negPhrases = allReports
      .flatMap((r) =>
        r.sentiment.samplePhrases.filter((p) => p.sentiment === "negative")
      )
      .slice(0, 2);
    const phraseSummary =
      negPhrases.length > 0
        ? ` Common themes include: ${negPhrases.map((p) => p.text.replace(/"/g, "")).join("; ")}.`
        : "";
    items.push({
      priority: "high",
      category: "Reviews & Reputation",
      action: `Address the negative sentiment appearing in ${Math.round(avgNegative)}% of AI-generated responses about ${businessName}.${phraseSummary}`,
      reason:
        "AI engines synthesize reviews and mentions. Persistent negative themes get amplified in recommendations, directly reducing your recommendation probability.",
    });
  } else if (avgPositive < 65) {
    items.push({
      priority: "medium",
      category: "Reviews & Reputation",
      action: `Actively encourage satisfied customers to leave reviews to boost ${businessName}'s positive sentiment from ${Math.round(avgPositive)}% toward the 70%+ range.`,
      reason:
        "A higher ratio of positive reviews gives AI engines stronger positive signals, increasing the likelihood of favorable recommendations.",
    });
  }

  // --- 4. Information accuracy ---
  const allAccuracy = allReports.flatMap((r) => r.accuracy);
  const uniqueFields = new Map<
    string,
    { field: string; statuses: string[] }
  >();
  for (const a of allAccuracy) {
    const existing = uniqueFields.get(a.field);
    if (existing) {
      existing.statuses.push(a.status);
    } else {
      uniqueFields.set(a.field, { field: a.field, statuses: [a.status] });
    }
  }
  const problemFields = [...uniqueFields.values()].filter((f) =>
    f.statuses.some((s) => s === "incorrect" || s === "missing" || s === "outdated")
  );

  if (problemFields.length > 0) {
    const fieldNames = problemFields
      .slice(0, 4)
      .map((f) => f.field)
      .join(", ");
    const severity = problemFields.some((f) =>
      f.statuses.includes("incorrect")
    )
      ? "high"
      : problemFields.some((f) => f.statuses.includes("missing"))
        ? "high"
        : "medium";
    items.push({
      priority: severity,
      category: "Business Information",
      action: `Update and verify ${businessName}'s information for: ${fieldNames}. Ensure consistency across Google Business Profile, Yelp, and your website.`,
      reason: `${problemFields.length} data field${problemFields.length > 1 ? "s" : ""} ${problemFields.length > 1 ? "are" : "is"} incorrect, outdated, or missing in AI responses. Inconsistent info erodes trust and lowers recommendation likelihood.`,
    });
  }

  // --- 5. Competitor ranking ---
  const competitorGaps: { provider: string; rank: number; total: number; topCompetitor: string }[] = [];
  for (const report of allReports) {
    const subjectEntry = report.competitors.find((c) => c.isSubject);
    const topCompetitor = report.competitors.find(
      (c) => !c.isSubject && c.rank === 1
    );
    if (subjectEntry && subjectEntry.rank > 2) {
      competitorGaps.push({
        provider: report.provider.name,
        rank: subjectEntry.rank,
        total: report.competitors.length,
        topCompetitor: topCompetitor?.name ?? "the top-ranked competitor",
      });
    }
  }

  if (competitorGaps.length > 0) {
    const worstGap = competitorGaps.sort((a, b) => b.rank - a.rank)[0];
    items.push({
      priority: worstGap.rank > 4 ? "high" : "medium",
      category: "Competitive Positioning",
      action: `Study what ${worstGap.topCompetitor} does differently — they rank #1 on ${worstGap.provider} while ${businessName} ranks #${worstGap.rank}. Analyze their review volume, content strategy, and directory presence.`,
      reason: `${businessName} is outranked on ${competitorGaps.length} of ${allReports.length} AI platform${allReports.length > 1 ? "s" : ""}. Closing this gap directly improves recommendation probability.`,
    });
  }

  // --- 6. Source influence / directory presence ---
  const directorySources = sourceInfluences.filter(
    (s) => s.sourceType === "directory"
  );
  const reviewSources = sourceInfluences.filter(
    (s) => s.sourceType === "review_platform"
  );

  // Also check per-report sources for directory coverage
  const allSources = allReports.flatMap((r) => r.sources ?? []);
  const directorySourceCount = allSources.filter(
    (s) => s.sourceType === "directory"
  ).length;
  const officialSiteCount = allSources.filter(
    (s) => s.sourceType === "official_site"
  ).length;

  if (
    directorySources.length === 0 &&
    directorySourceCount < allReports.length
  ) {
    items.push({
      priority: "medium",
      category: "Directory Listings",
      action: `Claim and optimize ${businessName}'s listings on Google Business Profile, Apple Maps, Bing Places, and industry-specific directories.`,
      reason:
        "AI engines heavily rely on directory data for local recommendations. Weak directory presence means less structured data for models to reference.",
    });
  }

  if (officialSiteCount === 0) {
    items.push({
      priority: "medium",
      category: "Website & SEO",
      action: `Ensure ${businessName}'s website is crawlable, has structured data (schema.org markup), and contains the key information AI engines look for: services, location, hours, and unique value propositions.`,
      reason:
        "No AI engine cited an official website as a source. A well-structured website is a primary signal that helps AI engines provide accurate, favorable recommendations.",
    });
  }

  // --- 7. Query type coverage ---
  if (allQueryResults.length > 0) {
    const queryTypeStats = new Map<
      string,
      { total: number; mentioned: number }
    >();
    for (const q of allQueryResults) {
      const existing = queryTypeStats.get(q.queryType) ?? {
        total: 0,
        mentioned: 0,
      };
      existing.total++;
      if (q.businessMentioned) existing.mentioned++;
      queryTypeStats.set(q.queryType, existing);
    }

    const weakTypes = [...queryTypeStats.entries()]
      .filter(
        ([, stats]) =>
          stats.total >= 2 && stats.mentioned / stats.total < 0.3
      )
      .sort((a, b) => a[1].mentioned / a[1].total - b[1].mentioned / b[1].total);

    if (weakTypes.length > 0) {
      const typeNames = weakTypes
        .slice(0, 3)
        .map(([type]) => type.replace(/_/g, " "))
        .join(", ");
      items.push({
        priority: "medium",
        category: "Content Gaps",
        action: `Create targeted content addressing ${typeNames} queries, where ${businessName} currently has low mention rates.`,
        reason: `These query categories represent real ways customers search for businesses like ${businessName}. Filling these gaps captures demand you are currently missing.`,
      });
    }
  }

  // --- 8. Provider-specific gap ---
  const providers = Object.keys(reports) as LLMProvider[];
  if (providers.length > 1) {
    const providerProbs = providers.map((pid) => ({
      provider: reports[pid].provider.name,
      prob: reports[pid].recommendations.recommendationProbability,
    }));
    const best = providerProbs.sort((a, b) => b.prob - a.prob)[0];
    const worst = providerProbs[providerProbs.length - 1];
    const gap = best.prob - worst.prob;

    if (gap > 0.3) {
      items.push({
        priority: "low",
        category: "Platform Strategy",
        action: `Investigate why ${worst.provider} recommends ${businessName} at only ${Math.round(worst.prob * 100)}% vs ${best.provider}'s ${Math.round(best.prob * 100)}%. Different AI engines weight different sources — ensure broad source coverage.`,
        reason: `A ${Math.round(gap * 100)} percentage point gap between platforms suggests some AI engines lack access to ${businessName}'s strongest signals.`,
      });
    }
  }

  // Sort: high first, then medium, then low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Return 5-8 items
  return items.slice(0, 8);
}

export function ActionItems({ analysis, businessName }: ActionItemsProps) {
  const recommendations = useMemo(
    () => generateRecommendations(analysis, businessName),
    [analysis, businessName]
  );

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Section header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h3
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "rgba(255,255,255,0.4)",
            margin: "0 0 0.25rem 0",
            fontFamily: "var(--font-sans)",
          }}
        >
          Action Items
        </h3>
        <p
          style={{
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.6)",
            margin: 0,
            lineHeight: 1.5,
            fontFamily: "var(--font-sans)",
          }}
        >
          {recommendations.length} prioritized recommendations based on your
          analysis results
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {recommendations.map((item, index) => {
          const config = PRIORITY_CONFIG[item.priority];
          return (
            <motion.div
              key={`${item.category}-${index}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.08 * index,
                duration: 0.35,
                ease: "easeOut",
              }}
              style={{
                background: "#14151a",
                borderRadius: 12,
                border: "1px solid #22232a",
                padding: "1.25rem",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              {/* Number */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {index + 1}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Badges row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Priority badge */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 10px",
                      borderRadius: 999,
                      background: config.bg,
                      fontSize: "0.68rem",
                      fontWeight: 500,
                      color: config.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {config.label}
                  </span>

                  {/* Category label */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 10px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      fontSize: "0.68rem",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Action text */}
                <p
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "#ffffff",
                    lineHeight: 1.5,
                    margin: "0 0 6px 0",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {item.action}
                </p>

                {/* Reason */}
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: 1.45,
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {item.reason}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
