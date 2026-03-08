"use client";

import { motion } from "framer-motion";
import type { GEOAnalysis } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import { ScoreRing } from "./score-ring";
import { BarChart } from "./bar-chart";
import { MetricCard } from "./metric-card";
import { SentimentBadge } from "./sentiment-badge";
import { CompetitorTable } from "./competitor-table";

interface PartialReportProps {
  analysis: GEOAnalysis;
  onUnlock: () => void;
}

export function PartialReport({ analysis, onUnlock }: PartialReportProps) {
  const chatgpt = analysis.reports.chatgpt;
  const lockedProviders = LLM_PROVIDERS.filter((p) => p.id !== "chatgpt");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingBottom: 100 }}
    >
      {/* Header */}
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
          transition={{ delay: 0.1 }}
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
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
            GEO Score
            <span style={{ color: "#16a34a", fontWeight: 700 }}>
              ↑ {analysis.summary.scoreTrend} pts this month
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <ScoreRing
              score={analysis.summary.averageScore}
              size={100}
              strokeWidth={10}
            />
            <div style={{ textAlign: "left" }}>
              <h1
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#0c0c0b",
                  margin: 0,
                }}
              >
                {analysis.businessName}
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#9a9793", margin: "4px 0 0" }}>
                GEO visibility score
              </p>
            </div>
          </div>

          {/* Per-LLM score bars */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #dddbd7",
              padding: "1.25rem 1.5rem",
              width: "100%",
              maxWidth: 440,
              marginTop: "0.5rem",
            }}
          >
            <BarChart
              items={LLM_PROVIDERS.map((p) => ({
                label: p.name,
                value: analysis.reports[p.id].overallScore,
                maxValue: 100,
              }))}
              maxValue={100}
              valueFormatter={(v) => `${v}%`}
            />
          </div>
        </motion.div>
      </div>

      {/* ChatGPT Report (visible) */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Section Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: chatgpt.provider.color,
              }}
            />
            <h2
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#0c0c0b",
                margin: 0,
              }}
            >
              {chatgpt.provider.name} Analysis
            </h2>
          </div>

          {/* Metric Grid */}
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
              value={chatgpt.citations.totalMentions}
              trend={chatgpt.citations.mentionTrend}
              sublabel={`${chatgpt.citations.primaryRecommendations} primary, ${chatgpt.citations.passingMentions} passing`}
            />
            <MetricCard
              label="Category Ranking"
              value={`#${chatgpt.ranking.position}`}
              sublabel={`of ${chatgpt.ranking.totalCompetitors} in ${chatgpt.ranking.category}`}
            />
            <MetricCard label="Sentiment">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <SentimentBadge
                  sentiment={
                    chatgpt.sentiment.positive > 60
                      ? "positive"
                      : chatgpt.sentiment.negative > 30
                        ? "negative"
                        : "neutral"
                  }
                  size="md"
                />
                <span style={{ fontSize: "0.75rem", color: "#9a9793" }}>
                  {chatgpt.sentiment.positive}% positive
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
                <div style={{ width: `${chatgpt.sentiment.positive}%`, background: "#16a34a", borderRadius: "3px 0 0 3px" }} />
                <div style={{ width: `${chatgpt.sentiment.neutral}%`, background: "#d97706" }} />
                <div style={{ width: `${chatgpt.sentiment.negative}%`, background: "#dc2626", borderRadius: "0 3px 3px 0" }} />
              </div>
            </MetricCard>
            <MetricCard
              label="Info Accuracy"
              value={`${Math.round(
                (chatgpt.accuracy.filter((a) => a.status === "correct").length /
                  chatgpt.accuracy.length) *
                  100
              )}%`}
              sublabel={`${chatgpt.accuracy.filter((a) => a.status === "correct").length} of ${chatgpt.accuracy.length} fields correct`}
            />
          </div>

          {/* Topic Triggers */}
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
              items={chatgpt.topics.slice(0, 7).map((t) => ({
                label: t.topic,
                value: t.frequency,
              }))}
              valueFormatter={(v) => `${v}`}
            />
          </div>

          {/* Competitor Ranking */}
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
            <CompetitorTable competitors={chatgpt.competitors} />
          </div>

          {/* Accuracy checklist */}
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
              {chatgpt.accuracy.map((a) => (
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
        </motion.div>

        {/* Locked LLM sections */}
        {lockedProviders.map((provider) => {
          const report = analysis.reports[provider.id];
          return (
            <div key={provider.id} style={{ position: "relative", marginBottom: "2rem" }}>
              {/* Blurred content */}
              <div
                style={{
                  filter: "blur(6px)",
                  userSelect: "none",
                  pointerEvents: "none",
                  opacity: 0.7,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: provider.color,
                    }}
                  />
                  <h2
                    style={{
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#0c0c0b",
                      margin: 0,
                    }}
                  >
                    {provider.name} Analysis
                  </h2>
                </div>
                <div
                  className="analyze-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <MetricCard
                    label="Total Citations"
                    value={report.citations.totalMentions}
                    trend={report.citations.mentionTrend}
                  />
                  <MetricCard
                    label="Category Ranking"
                    value={`#${report.ranking.position}`}
                  />
                </div>
              </div>

              {/* Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(240, 238, 234, 0.3)",
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#ffffff",
                      border: "1px solid #dddbd7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                    }}
                  >
                    🔒
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0c0c0b" }}>
                    Unlock {provider.name} report
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid #dddbd7",
          padding: "1rem 2rem",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "#3a3936" }}>
          See the full report across all 4 AI engines
        </span>
        <button
          onClick={onUnlock}
          style={{
            padding: "0.6rem 1.5rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            fontFamily: "'Instrument Sans', sans-serif",
            borderRadius: 999,
            border: "none",
            background: "#0c0c0b",
            color: "#ffffff",
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Unlock full report
        </button>
      </div>
    </motion.div>
  );
}
