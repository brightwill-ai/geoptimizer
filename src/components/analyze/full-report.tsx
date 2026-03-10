"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { GEOAnalysis, LLMProvider } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { ScoreRing } from "./score-ring";
import { BarChart } from "./bar-chart";
import { MetricCard } from "./metric-card";
import { SentimentBadge } from "./sentiment-badge";
import { CompetitorTable } from "./competitor-table";
import { LLMComparisonTable } from "./llm-comparison-table";
import { RecommendationHero } from "./recommendation-hero";
import { QueryEvidence } from "./query-evidence";
import { SourceInfluenceMap } from "./source-influence-map";
import { QueryTypeBreakdown } from "./query-type-breakdown";
import { ActionItems } from "./action-items";
import { ActionPlan } from "./action-plan";

import { SectionDivider } from "@/components/ui/section-divider";
import type { ActionPlan as ActionPlanType } from "@/lib/mock-data";

interface FullReportProps {
  analysis: GEOAnalysis;
  analysisId?: string;
  actionPlan?: ActionPlanType | null;
  actionPlanStatus?: string;
}

export function FullReport({ analysis, analysisId, actionPlan, actionPlanStatus }: FullReportProps) {
  const availableProviders = LLM_PROVIDERS.filter((p) => analysis.reports[p.id]);
  const [activeTab, setActiveTab] = useState<LLMProvider>(availableProviders[0]?.id ?? "chatgpt");
  const activeReport = analysis.reports[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "#0c0d10" }}
    >
      {/* Summary Header */}
      <div
        style={{
          background: "#0c0d10",
          padding: "5rem 2rem 3rem",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>Complete GEO Report</div>

          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "2rem",
              fontWeight: 500,
              color: "#ffffff",
              margin: 0,
            }}
          >
            {analysis.businessName}
          </h1>

          {/* Probability rings per provider */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 40,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {LLM_PROVIDERS.filter((p) => analysis.reports[p.id]).map((p) => {
              const prob = analysis.reports[p.id].recommendations.recommendationProbability;
              const pctVal = Math.round(prob * 100);
              return (
                <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <ScoreRing
                    score={pctVal}
                    size={80}
                    strokeWidth={7}
                    animated={false}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <ProviderLogo provider={p.id} size={14} />
                    <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#ffffff" }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                    {pctVal}% probability
                  </span>
                </div>
              );
            })}
          </div>

          {/* Average probability callout */}
          <div
            style={{
              background: "#14151a",
              borderRadius: 999,
              padding: "8px 20px",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Average: {Math.round(analysis.summary.averageProbability * 100)}% recommendation probability
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
              across {analysis.methodology.totalQueries} queries
            </span>
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem" }}>
        <SectionDivider spacing={2.5} />

        {/* Methodology Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: "#14151a",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>Methodology</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
            className="analyze-grid"
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 500, color: "#ffffff", fontFamily: "var(--font-mono, monospace)" }}>
                {String(analysis.methodology.totalQueries).padStart(2, "0")}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Total queries</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 500, color: "#ffffff", fontFamily: "var(--font-mono, monospace)" }}>
                {String(analysis.methodology.providers.length).padStart(2, "0")}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>AI platforms</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 500, color: "#ffffff", fontFamily: "var(--font-mono, monospace)" }}>
                {String(analysis.methodology.queryTypes.length).padStart(2, "0")}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Query types</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {analysis.methodology.queryTypes.map((t) => (
              <span
                key={t}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 500,
                }}
              >
                {t.replace("_", " ")}
              </span>
            ))}
          </div>
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: "12px 0 0", fontStyle: "italic" }}>
            {analysis.methodology.disclaimer}
          </p>
        </motion.div>

        <SectionDivider spacing={2.5} />

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "#14151a",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>Cross-Platform Comparison</h3>
          <LLMComparisonTable analysis={analysis} />
        </motion.div>

        <SectionDivider spacing={2.5} />

        {/* Source Influence Map */}
        {analysis.sourceInfluences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ marginBottom: "3rem" }}
          >
            <SourceInfluenceMap sourceInfluences={analysis.sourceInfluences} />
          </motion.div>
        )}

        <SectionDivider spacing={2.5} />

        {/* Tabbed Deep Dive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Tab bar */}
          <div
            className="llm-tabs"
            style={{
              display: "flex",
              gap: 0,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "1.5rem",
              overflowX: "auto",
            }}
          >
            {LLM_PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                style={{
                  padding: "0.75rem 1.25rem",
                  fontSize: "0.85rem",
                  fontWeight: activeTab === p.id ? 600 : 400,
                  fontFamily: "var(--font-sans)",
                  color: activeTab === p.id ? "#ffffff" : "rgba(255,255,255,0.4)",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === p.id ? `2px solid ${p.color}` : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                <ProviderLogo
                  provider={p.id}
                  size={14}
                  style={{
                    opacity: activeTab === p.id ? 1 : 0.4,
                    transition: "opacity 0.15s",
                  }}
                />
                {p.name}
              </button>
            ))}
          </div>

          {/* Active tab content */}
          <div key={activeTab}>
            {!activeReport ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
                No data available for this provider yet.
              </div>
            ) : (<>
            {/* Recommendation Hero for this provider */}
            <RecommendationHero
              probability={activeReport.recommendations.recommendationProbability}
              totalQueries={activeReport.recommendations.totalQueries}
              mentionCount={activeReport.recommendations.mentionCount}
              businessName={analysis.businessName}
              providerName={activeReport.provider.name}
            />

            {/* Query Evidence */}
            {activeReport.queryResults.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <QueryEvidence
                  queries={activeReport.queryResults}
                  businessName={analysis.businessName}
                />
              </div>
            )}

            {/* Query Type Breakdown */}
            {activeReport.queryResults.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <QueryTypeBreakdown
                  queryResults={activeReport.queryResults}
                  businessName={analysis.businessName}
                />
              </div>
            )}

            {/* Per-provider Source Influence */}
            {(activeReport.sources?.length ?? 0) > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <SourceInfluenceMap
                  sources={activeReport.sources}
                  providerName={activeReport.provider.name}
                />
              </div>
            )}

            {/* Metric grid */}
            <div
              className="analyze-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginTop: "1.5rem",
                marginBottom: "3rem",
              }}
            >
              <MetricCard
                label="Total Citations"
                value={activeReport.citations.totalMentions}
                trend={activeReport.citations.mentionTrend}
                sublabel={`${activeReport.citations.primaryRecommendations} primary, ${activeReport.citations.passingMentions} passing`}
              />
              <MetricCard
                label="Category Ranking"
                value={`#${activeReport.ranking.position}`}
                sublabel={`of ${activeReport.ranking.totalCompetitors} in ${activeReport.ranking.category}`}
              />
              <MetricCard label="Sentiment">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <SentimentBadge
                    sentiment={
                      activeReport.sentiment.positive > 60
                        ? "positive"
                        : activeReport.sentiment.negative > 30
                          ? "negative"
                          : "neutral"
                    }
                    size="md"
                  />
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                    {activeReport.sentiment.positive}% positive
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 6,
                    borderRadius: 3,
                    overflow: "hidden",
                    marginTop: 8,
                    background: "rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ width: `${activeReport.sentiment.positive}%`, background: "#16a34a", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ width: `${activeReport.sentiment.neutral}%`, background: "#d97706" }} />
                  <div style={{ width: `${activeReport.sentiment.negative}%`, background: "#dc2626", borderRadius: "0 3px 3px 0" }} />
                </div>
              </MetricCard>
              <MetricCard
                label="Info Accuracy"
                value={`${activeReport.accuracy.length > 0 ? Math.round(
                  (activeReport.accuracy.filter((a) => a.status === "correct").length /
                    activeReport.accuracy.length) *
                    100
                ) : 0}%`}
                sublabel={`${activeReport.accuracy.filter((a) => a.status === "correct").length} of ${activeReport.accuracy.length} fields correct`}
              />
            </div>

            {/* Topics */}
            <div
              style={{
                background: "#14151a",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "1.25rem",
                marginBottom: "3rem",
              }}
            >
              <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>Topic Triggers</h3>
              <BarChart
                items={activeReport.topics.slice(0, 7).map((t) => ({
                  label: t.topic,
                  value: t.frequency,
                }))}
                valueFormatter={(v) => `${v}`}
              />
            </div>

            {/* Competitors */}
            <div
              style={{
                background: "#14151a",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "1.25rem",
                marginBottom: "3rem",
              }}
            >
              <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>Competitor Ranking</h3>
              <CompetitorTable competitors={activeReport.competitors} />
            </div>

            {/* Accuracy */}
            <div
              style={{
                background: "#14151a",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "1.25rem",
                marginBottom: "3rem",
              }}
            >
              <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>Information Accuracy</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeReport.accuracy.map((a) => (
                  <div
                    key={a.field}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                      {a.field}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{a.llmValue}</span>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          background:
                            a.status === "correct"
                              ? "rgba(22,163,74,0.15)"
                              : a.status === "outdated"
                                ? "rgba(217,119,6,0.15)"
                                : a.status === "incorrect"
                                  ? "rgba(220,38,38,0.15)"
                                  : "rgba(255,255,255,0.06)",
                          color:
                            a.status === "correct"
                              ? "#16a34a"
                              : a.status === "outdated"
                                ? "#d97706"
                                : a.status === "incorrect"
                                  ? "#dc2626"
                                  : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {a.status === "correct" ? "✓" : a.status === "missing" ? "?" : "!"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Phrases */}
            <div
              style={{
                background: "#14151a",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "1.25rem",
                marginBottom: "3rem",
              }}
            >
              <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>What {activeReport.provider.name} Says</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeReport.sentiment.samplePhrases.map((phrase, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <SentimentBadge sentiment={phrase.sentiment} />
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontStyle: "italic", lineHeight: 1.4 }}>
                      {phrase.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>)}
          </div>
        </motion.div>

        <SectionDivider spacing={2.5} />

        {/* Cross-LLM Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "#14151a",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1.25rem 0" }}>Cross-Platform Insights</h3>
          <div
            className="analyze-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            {/* Strengths */}
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#16a34a",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                Strengths
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {(analysis.reports.chatgpt ?? activeReport)?.topics
                  .filter((t) => t.strength === "strong")
                  .slice(0, 3)
                  .map((t) => (
                    <li key={t.topic} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
                      {t.topic}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#d97706",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97706" }} />
                Opportunities
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {(analysis.reports.chatgpt ?? activeReport)?.topics
                  .filter((t) => t.strength === "moderate")
                  .slice(0, 3)
                  .map((t) => (
                    <li key={t.topic} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
                      {t.topic}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Info Gaps */}
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#dc2626",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626" }} />
                Information Gaps
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.values(analysis.reports)
                  .flatMap((r) => r.accuracy.filter((a) => a.status !== "correct"))
                  .reduce((unique, item) => {
                    if (!unique.find((u) => u.field === item.field)) unique.push(item);
                    return unique;
                  }, [] as typeof activeReport.accuracy)
                  .slice(0, 3)
                  .map((a) => (
                    <li key={a.field} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
                      {a.field}: {a.status}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <SectionDivider spacing={2.5} />

        {/* Action Plan (comprehensive) or Action Items (fallback) */}
        {analysisId ? (
          <ActionPlan
            analysisId={analysisId}
            initialActionPlan={actionPlan}
            actionPlanStatus={actionPlanStatus}
          />
        ) : (
          <ActionItems analysis={analysis} businessName={analysis.businessName} />
        )}
      </div>
    </motion.div>
  );
}
