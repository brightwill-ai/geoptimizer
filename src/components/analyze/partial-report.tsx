"use client";

import { motion } from "framer-motion";
import type { GEOAnalysis } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { RecommendationHero } from "./recommendation-hero";
import { QueryEvidence } from "./query-evidence";
import { MetricCard } from "./metric-card";
import { SentimentBadge } from "./sentiment-badge";
import { CompetitorTable } from "./competitor-table";
import { QueryTypeBreakdown } from "./query-type-breakdown";
import { SourceInfluenceMap } from "./source-influence-map";

import { SectionDivider } from "@/components/ui/section-divider";

interface PartialReportProps {
  analysis: GEOAnalysis;
  onUnlock: () => void;
}

export function PartialReport({ analysis, onUnlock }: PartialReportProps) {
  const chatgpt = analysis.reports.chatgpt;
  const lockedProviders = LLM_PROVIDERS.filter((p) => p.id !== "chatgpt");
  const pct = Math.round(chatgpt.recommendations.recommendationProbability * 100);

  // Compute position stats from query results
  const positions = chatgpt.queryResults
    .filter((q) => q.rankPosition !== null && q.rankPosition !== undefined)
    .map((q) => q.rankPosition!);
  const avgPosition = positions.length > 0
    ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingBottom: 100, background: "#0c0d10" }}
    >
      {/* Header */}
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
          transition={{ delay: 0.1 }}
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.72rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            <ProviderLogo provider="chatgpt" size={14} />
            ChatGPT Audit
          </div>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.75rem",
              fontWeight: 500,
              color: "#ffffff",
              margin: 0,
            }}
          >
            {analysis.businessName}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Based on {chatgpt.recommendations.totalQueries} real queries through ChatGPT
          </p>
        </motion.div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 2rem 2rem" }}>
        {/* Top row: Probability + Key metrics */}
        <div
          className="analyze-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* Recommendation Probability Hero */}
          <RecommendationHero
            probability={chatgpt.recommendations.recommendationProbability}
            totalQueries={chatgpt.recommendations.totalQueries}
            mentionCount={chatgpt.recommendations.mentionCount}
            businessName={analysis.businessName}
          />

          {/* Key Metrics Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <MetricCard
              label="Mention Rate"
              value={`${chatgpt.recommendations.mentionCount}/${chatgpt.recommendations.totalQueries}`}
              sublabel={`${pct}% of queries mention your business`}
            />
            <MetricCard
              label="Primary Recommendations"
              value={chatgpt.recommendations.primaryRecommendationCount}
              sublabel={`${Math.round(chatgpt.recommendations.primaryProbability * 100)}% primary recommendation rate`}
            />
            <div
              className="analyze-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
            >
              <MetricCard
                label="Ranking"
                value={chatgpt.ranking.position > 0 ? `#${chatgpt.ranking.position}` : "N/A"}
                sublabel={chatgpt.ranking.position > 0 ? `of ${chatgpt.ranking.totalCompetitors} in ${chatgpt.ranking.category}` : "Not ranked in results"}
              />
              <MetricCard
                label="Avg Position"
                value={avgPosition ?? "N/A"}
                sublabel={avgPosition ? `across ${positions.length} ranked queries` : "No rank data yet"}
              />
            </div>
          </div>
        </div>

        <SectionDivider spacing={2} />

        {/* Query Type Breakdown */}
        {chatgpt.queryResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ marginTop: "2.5rem" }}
          >
            <QueryTypeBreakdown
              queryResults={chatgpt.queryResults}
              businessName={analysis.businessName}
            />
          </motion.div>
        )}

        <SectionDivider spacing={2} />

        {/* Competitor + Sentiment row */}
        <div
          className="analyze-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: "2.5rem",
          }}
        >
          {/* Competitor Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: "#14151a",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "1.25rem",
            }}
          >
            <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>Who ChatGPT Recommends Instead</h3>
            <CompetitorTable competitors={chatgpt.competitors} />
          </motion.div>

          {/* Sentiment Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              background: "#14151a",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>Sentiment When Mentioned</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
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
              <span style={{ fontSize: "0.85rem", color: "#ffffff", fontWeight: 500 }}>
                {chatgpt.sentiment.positive}% positive
              </span>
            </div>
            <div
              style={{
                display: "flex",
                height: 8,
                borderRadius: 4,
                overflow: "hidden",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ width: `${chatgpt.sentiment.positive}%`, background: "#16a34a", borderRadius: "4px 0 0 4px" }} />
              <div style={{ width: `${chatgpt.sentiment.neutral}%`, background: "#d97706" }} />
              <div style={{ width: `${chatgpt.sentiment.negative}%`, background: "#dc2626", borderRadius: "0 4px 4px 0" }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
              <span>{chatgpt.sentiment.positive}% positive</span>
              <span>{chatgpt.sentiment.neutral}% neutral</span>
              <span>{chatgpt.sentiment.negative}% negative</span>
            </div>

            {/* Sentiment phrases preview */}
            {chatgpt.sentiment.samplePhrases.length > 0 && (
              <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {chatgpt.sentiment.samplePhrases.slice(0, 2).map((phrase, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <SentimentBadge sentiment={phrase.sentiment} />
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic", lineHeight: 1.4 }}>
                      {phrase.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Source Influence (ChatGPT only) */}
        {(chatgpt.sources?.length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            style={{ marginTop: "2.5rem" }}
          >
            <SourceInfluenceMap
              sources={chatgpt.sources}
              providerName="ChatGPT"
            />
          </motion.div>
        )}

        <SectionDivider spacing={2} />

        {/* Query Evidence Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: "2.5rem" }}
        >
          <QueryEvidence
            queries={chatgpt.queryResults}
            businessName={analysis.businessName}
          />
        </motion.div>

        <SectionDivider spacing={2} />

        {/* Blurred: Claude & Gemini */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: "2.5rem" }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
              Want the full picture?
            </p>
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.1rem",
                fontWeight: 500,
                color: "#ffffff",
                margin: "4px 0 0",
              }}
            >
              Unlock Claude & Gemini analysis
            </h3>
          </div>

          {lockedProviders.map((provider) => (
            <div key={provider.id} style={{ position: "relative", marginBottom: "1.5rem" }}>
              <div
                style={{
                  filter: "blur(6px)",
                  userSelect: "none",
                  pointerEvents: "none",
                  opacity: 0.5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                  <ProviderLogo provider={provider.id} size={18} />
                  <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 500, color: "#ffffff", margin: 0 }}>
                    {provider.name} Analysis
                  </h2>
                </div>
                <div className="analyze-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <MetricCard label="Recommendation Probability" value="—%" />
                  <MetricCard label="Category Ranking" value="#—" />
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(12,13,16,0.3)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 20px",
                    borderRadius: 999,
                    background: "#14151a",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <ProviderLogo provider={provider.id} size={14} />
                  <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "#ffffff" }}>
                    Unlock {provider.name}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Blurred comprehensive teasers */}
          <div style={{ position: "relative", marginTop: "2.5rem" }}>
            <div
              style={{
                filter: "blur(6px)",
                userSelect: "none",
                pointerEvents: "none",
                opacity: 0.5,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Fake cross-platform source influence */}
              <div style={{ background: "#14151a", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>Cross-Platform Source Influence</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Google Reviews", "Yelp", "TripAdvisor", "Google Maps"].map((s, i) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 120, fontSize: "0.8rem", color: "#fff", fontWeight: 500 }}>{s}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${80 - i * 15}%`, borderRadius: 3, background: "#d9770666" }} />
                      </div>
                      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                        {LLM_PROVIDERS.map((p) => (
                          <ProviderLogo key={p.id} provider={p.id} size={10} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fake methodology */}
              <div style={{ background: "#14151a", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", margin: "0 0 1rem 0" }}>Full Methodology & Verification</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 500, color: "#fff" }}>100+</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Total queries</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 500, color: "#fff" }}>3</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>AI platforms</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 500, color: "#fff" }}>8</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Query types</div>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(12,13,16,0.3)",
                borderRadius: 12,
              }}
            >
              <button
                onClick={onUnlock}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 28px",
                  borderRadius: 8,
                  background: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  transition: "opacity 0.15s",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#0c0d10" }}>
                  Unlock full cross-platform report
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(12,13,16,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "1rem 2rem",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {LLM_PROVIDERS.map((p) => (
            <ProviderLogo key={p.id} provider={p.id} size={14} />
          ))}
        </div>
        <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
          Full report: 40+ queries, 3 AI engines, source attribution
        </span>
        <button
          onClick={onUnlock}
          style={{
            padding: "0.6rem 1.5rem",
            fontSize: "0.85rem",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            borderRadius: 8,
            border: "none",
            background: "#ffffff",
            color: "#0c0d10",
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
