"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { GEOAnalysis, LLMProvider } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import { ScoreRing } from "./score-ring";
import { BarChart } from "./bar-chart";
import { MetricCard } from "./metric-card";
import { SentimentBadge } from "./sentiment-badge";
import { CompetitorTable } from "./competitor-table";
import { LLMComparisonTable } from "./llm-comparison-table";

interface FullReportProps {
  analysis: GEOAnalysis;
}

export function FullReport({ analysis }: FullReportProps) {
  const [activeTab, setActiveTab] = useState<LLMProvider>("chatgpt");
  const activeReport = analysis.reports[activeTab];
  const bestProvider = LLM_PROVIDERS.find((p) => p.id === analysis.summary.bestPerformer)!;
  const worstProvider = LLM_PROVIDERS.find((p) => p.id === analysis.summary.worstPerformer)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Summary Header */}
      <div
        style={{
          background: "linear-gradient(180deg, #e8e4f0 0%, #f0eeea 100%)",
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#9a9793",
            }}
          >
            Complete GEO Report
            <span style={{ color: "#16a34a", fontWeight: 700 }}>
              ↑ {analysis.summary.scoreTrend} pts this month
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#0c0c0b",
              margin: 0,
            }}
          >
            {analysis.businessName}
          </h1>

          {/* Score rings row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {LLM_PROVIDERS.map((p) => (
              <ScoreRing
                key={p.id}
                score={analysis.reports[p.id].overallScore}
                size={80}
                strokeWidth={7}
                label={p.name}
                animated={false}
              />
            ))}
          </div>

          {/* Callouts */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <div
              style={{
                background: "#dcfce7",
                borderRadius: 999,
                padding: "6px 16px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#16a34a",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: bestProvider.color }} />
              Best: {bestProvider.name} ({analysis.reports[bestProvider.id].overallScore}/100)
            </div>
            <div
              style={{
                background: "#fef3c7",
                borderRadius: 999,
                padding: "6px 16px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#d97706",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: worstProvider.color }} />
              Needs attention: {worstProvider.name} ({analysis.reports[worstProvider.id].overallScore}/100)
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem" }}>
        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #dddbd7",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#9a9793",
              margin: "0 0 1rem 0",
            }}
          >
            Cross-Platform Comparison
          </h3>
          <LLMComparisonTable analysis={analysis} />
        </motion.div>

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
              borderBottom: "1px solid #dddbd7",
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
                  fontFamily: "'Instrument Sans', sans-serif",
                  color: activeTab === p.id ? "#0c0c0b" : "#9a9793",
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
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: p.color,
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
            {/* Metric grid */}
            <div
              className="analyze-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: "2rem",
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
                  <span style={{ fontSize: "0.75rem", color: "#9a9793" }}>
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
                    background: "#dddbd7",
                  }}
                >
                  <div style={{ width: `${activeReport.sentiment.positive}%`, background: "#16a34a", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ width: `${activeReport.sentiment.neutral}%`, background: "#d97706" }} />
                  <div style={{ width: `${activeReport.sentiment.negative}%`, background: "#dc2626", borderRadius: "0 3px 3px 0" }} />
                </div>
              </MetricCard>
              <MetricCard
                label="Info Accuracy"
                value={`${Math.round(
                  (activeReport.accuracy.filter((a) => a.status === "correct").length /
                    activeReport.accuracy.length) *
                    100
                )}%`}
                sublabel={`${activeReport.accuracy.filter((a) => a.status === "correct").length} of ${activeReport.accuracy.length} fields correct`}
              />
            </div>

            {/* Topics */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #dddbd7",
                padding: "1.25rem",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#9a9793",
                  margin: "0 0 1rem 0",
                }}
              >
                Topic Triggers
              </h3>
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
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #dddbd7",
                padding: "1.25rem",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#9a9793",
                  margin: "0 0 1rem 0",
                }}
              >
                Competitor Ranking
              </h3>
              <CompetitorTable competitors={activeReport.competitors} />
            </div>

            {/* Accuracy */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #dddbd7",
                padding: "1.25rem",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#9a9793",
                  margin: "0 0 1rem 0",
                }}
              >
                Information Accuracy
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeReport.accuracy.map((a) => (
                  <div
                    key={a.field}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #f0eeea",
                    }}
                  >
                    <span style={{ fontSize: "0.8rem", color: "#3a3936", fontWeight: 500 }}>
                      {a.field}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.75rem", color: "#9a9793" }}>{a.llmValue}</span>
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
                              ? "#dcfce7"
                              : a.status === "outdated"
                                ? "#fef3c7"
                                : a.status === "incorrect"
                                  ? "#fee2e2"
                                  : "#f0eeea",
                          color:
                            a.status === "correct"
                              ? "#16a34a"
                              : a.status === "outdated"
                                ? "#d97706"
                                : a.status === "incorrect"
                                  ? "#dc2626"
                                  : "#9a9793",
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
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #dddbd7",
                padding: "1.25rem",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#9a9793",
                  margin: "0 0 1rem 0",
                }}
              >
                What {activeReport.provider.name} Says
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeReport.sentiment.samplePhrases.map((phrase, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "#faf9f7",
                    }}
                  >
                    <SentimentBadge sentiment={phrase.sentiment} />
                    <span style={{ fontSize: "0.8rem", color: "#3a3936", fontStyle: "italic", lineHeight: 1.4 }}>
                      {phrase.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cross-LLM Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #dddbd7",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#9a9793",
              margin: "0 0 1.25rem 0",
            }}
          >
            Cross-Platform Insights
          </h3>
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
                  fontWeight: 600,
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
                {analysis.reports.chatgpt.topics
                  .filter((t) => t.strength === "strong")
                  .slice(0, 3)
                  .map((t) => (
                    <li key={t.topic} style={{ fontSize: "0.78rem", color: "#3a3936" }}>
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
                  fontWeight: 600,
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
                {analysis.reports.chatgpt.topics
                  .filter((t) => t.strength === "moderate")
                  .slice(0, 3)
                  .map((t) => (
                    <li key={t.topic} style={{ fontSize: "0.78rem", color: "#3a3936" }}>
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
                  fontWeight: 600,
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
                  }, [] as typeof analysis.reports.chatgpt.accuracy)
                  .slice(0, 3)
                  .map((a) => (
                    <li key={a.field} style={{ fontSize: "0.78rem", color: "#3a3936" }}>
                      {a.field}: {a.status}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
