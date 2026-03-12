"use client";

import { motion } from "framer-motion";
import type { QueryResult } from "@/lib/mock-data";


interface QueryTypeBreakdownProps {
  queryResults: QueryResult[];
  businessName: string;
  blurred?: boolean;
}

const queryTypeLabels: Record<string, string> = {
  discovery: "Discovery",
  subcategory_discovery: "Niche Search",
  direct: "Direct",
  comparison: "Comparison",
  use_case: "Use Case",
  reviews: "Reviews",
  specifics: "Specifics",
  source_probing: "Source Probing",
  verification: "Verification",
  reputation: "Reputation",
  rephrased_discovery: "Rephrased",
};

const queryTypeDescriptions: Record<string, string> = {
  discovery: "Generic search queries",
  subcategory_discovery: "Subcategory-specific search terms",
  direct: "Directly asking about your business",
  comparison: "Comparing you to competitors",
  use_case: "Scenario-based recommendations",
  reviews: "Reputation and review queries",
  specifics: "Service/product detail queries",
  source_probing: "Fact-checking queries",
  verification: "Cross-reference verification",
  reputation: "Brand perception queries",
  rephrased_discovery: "Alternate phrasing discovery",
};

export function QueryTypeBreakdown({ queryResults, blurred }: QueryTypeBreakdownProps) {
  if (queryResults.length === 0) return null;

  // Group by query type
  const typeMap = new Map<string, { total: number; mentioned: number; primary: number }>();
  for (const q of queryResults) {
    const existing = typeMap.get(q.queryType) ?? { total: 0, mentioned: 0, primary: 0 };
    existing.total++;
    if (q.businessMentioned) existing.mentioned++;
    if (q.mentionType === "primary_recommendation") existing.primary++;
    typeMap.set(q.queryType, existing);
  }

  const types = Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      label: queryTypeLabels[type] ?? type.replace("_", " "),
      description: queryTypeDescriptions[type] ?? "",
      ...data,
      mentionRate: data.total > 0 ? data.mentioned / data.total : 0,
      primaryRate: data.total > 0 ? data.primary / data.total : 0,
    }))
    .sort((a, b) => b.mentionRate - a.mentionRate);

  // Overall stats
  const avgMentionRate = types.reduce((sum, t) => sum + t.mentionRate, 0) / types.length;
  const bestType = types[0];
  const worstType = types[types.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e5e5e5",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        ...(blurred ? { filter: "blur(6px)", userSelect: "none" as const, pointerEvents: "none" as const } : {}),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8e8ea0" }}>Query Type Breakdown</div>
        <span style={{ fontSize: "0.7rem", color: "#8e8ea0" }}>
          {queryResults.length} queries across {types.length} types
        </span>
      </div>

      {/* Summary stats row */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20,
          padding: "12px 16px",
          borderRadius: 8,
          background: "#f7f7f8",
        }}
      >
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 500, color: "#171717" }}>
            {Math.round(avgMentionRate * 100)}%
          </div>
          <div style={{ fontSize: "0.65rem", color: "#8e8ea0" }}>Avg mention rate</div>
        </div>
        {bestType && (
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#16a34a" }}>
              {bestType.label}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#8e8ea0" }}>
              Strongest ({Math.round(bestType.mentionRate * 100)}%)
            </div>
          </div>
        )}
        {worstType && worstType.type !== bestType?.type && (
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#dc2626" }}>
              {worstType.label}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#8e8ea0" }}>
              Weakest ({Math.round(worstType.mentionRate * 100)}%)
            </div>
          </div>
        )}
      </div>

      {/* Per-type bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {types.map((t) => {
          const mentionPct = t.mentionRate * 100;
          const primaryPct = t.primaryRate * 100;
          const color = mentionPct >= 60 ? "#16a34a" : mentionPct >= 30 ? "#d97706" : "#dc2626";

          return (
            <div key={t.type}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#171717" }}>
                    {t.label}
                  </span>
                  {t.description && (
                    <span style={{ fontSize: "0.68rem", color: "#8e8ea0", marginLeft: 8 }}>
                      {t.description}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.72rem", color: "#8e8ea0" }}>
                    {t.mentioned}/{t.total}
                  </span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500, color, width: 36, textAlign: "right" }}>
                    {Math.round(mentionPct)}%
                  </span>
                </div>
              </div>
              {/* Stacked bar: primary (bright) + passing (dimmer) */}
              <div style={{ height: 6, borderRadius: 3, background: "#f0f0f0", overflow: "hidden", display: "flex" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${primaryPct}%`,
                    background: color,
                    transition: "width 0.8s ease-out",
                  }}
                />
                <div
                  style={{
                    height: "100%",
                    width: `${mentionPct - primaryPct}%`,
                    background: `${color}44`,
                    transition: "width 0.8s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: "0.65rem", color: "#8e8ea0" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 4, borderRadius: 2, background: "#16a34a" }} />
          Primary recommendation
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 4, borderRadius: 2, background: "#16a34a44" }} />
          Passing mention
        </span>
      </div>
    </motion.div>
  );
}
