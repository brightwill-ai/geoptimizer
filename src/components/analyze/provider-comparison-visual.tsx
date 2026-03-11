"use client";

import { motion } from "framer-motion";
import type { GEOAnalysis } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { ScoreRing } from "./score-ring";
import { SentimentBadge } from "./sentiment-badge";

interface ProviderComparisonVisualProps {
  analysis: GEOAnalysis;
}

export function ProviderComparisonVisual({ analysis }: ProviderComparisonVisualProps) {
  const providers = LLM_PROVIDERS.filter((p) => analysis.reports[p.id]);

  return (
    <div
      className="dashboard-grid-insights"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(providers.length, 3)}, 1fr)`,
        gap: 16,
      }}
    >
      {providers.map((p, i) => {
        const report = analysis.reports[p.id];
        const prob = Math.round(report.recommendations.recommendationProbability * 100);

        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            style={{
              background: "rgba(20, 21, 26, 0.7)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              borderTopWidth: 2,
              borderTopColor: p.color,
              padding: "1.25rem",
              position: "relative",
              overflow: "hidden",
              transition: "border-color 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = `${p.color}40`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            {/* Corner glow */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                background: `radial-gradient(circle at top right, ${p.color}15, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            {/* Provider header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                position: "relative",
                zIndex: 1,
              }}
            >
              <ProviderLogo provider={p.id} size={18} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>
                {p.name}
              </span>
            </div>

            {/* Ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, position: "relative", zIndex: 1 }}>
              <div style={{ filter: `drop-shadow(0 0 12px ${p.color}30)` }}>
                <ScoreRing
                  score={prob}
                  size={72}
                  strokeWidth={6}
                  animated
                />
              </div>
            </div>

            {/* Probability label */}
            <div style={{ textAlign: "center", marginBottom: 20, position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                {prob}%
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>
                recommendation probability
              </div>
            </div>

            {/* Stat rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative", zIndex: 1 }}>
              <StatRow label="GEO Score" value={report.overallScore} />
              <StatRow
                label="Mentions"
                value={`${report.recommendations.mentionCount}/${report.recommendations.totalQueries}`}
              />
              <StatRow
                label="Sentiment"
                value={
                  <SentimentBadge
                    sentiment={
                      report.sentiment.positive > 60
                        ? "positive"
                        : report.sentiment.negative > 30
                          ? "negative"
                          : "neutral"
                    }
                  />
                }
              />
              <StatRow
                label="Ranking"
                value={report.ranking.position > 0 ? `#${report.ranking.position}` : "N/A"}
              />
              <StatRow
                label="Sources"
                value={report.sources?.length ?? 0}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#ffffff" }}>
        {value}
      </span>
    </div>
  );
}
