"use client";

import type { GEOAnalysis, LLMProvider } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";

interface LLMComparisonTableProps {
  analysis: GEOAnalysis;
}

function scoreColor(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.7) return "#16a34a";
  if (pct >= 0.4) return "#d97706";
  return "#dc2626";
}

function rankColor(position: number): string {
  if (position <= 3) return "#16a34a";
  if (position <= 7) return "#d97706";
  return "#dc2626";
}

export function LLMComparisonTable({ analysis }: LLMComparisonTableProps) {
  const available = LLM_PROVIDERS.filter((p) => analysis.reports[p.id]);

  const safeGet = (id: LLMProvider) => analysis.reports[id];

  const metrics: {
    label: string;
    getValue: (id: LLMProvider) => string;
    getColor: (id: LLMProvider) => string;
  }[] = [
    {
      label: "AI Visibility Score",
      getValue: (id) => { const r = safeGet(id); return r ? `${Math.round(r.recommendations.recommendationProbability * 100)}%` : "\u2014"; },
      getColor: (id) => { const r = safeGet(id); return r ? scoreColor(r.recommendations.recommendationProbability * 100, 100) : "#8e8ea0"; },
    },
    {
      label: "GEO Score",
      getValue: (id) => { const r = safeGet(id); return r ? `${r.overallScore}/100` : "\u2014"; },
      getColor: (id) => { const r = safeGet(id); return r ? scoreColor(r.overallScore, 100) : "#8e8ea0"; },
    },
    {
      label: "Queries Mentioned In",
      getValue: (id) => { const r = safeGet(id); return r ? `${r.recommendations.mentionCount} of ${r.recommendations.totalQueries}` : "\u2014"; },
      getColor: (id) => { const r = safeGet(id); return r ? scoreColor(r.recommendations.mentionCount, r.recommendations.totalQueries) : "#8e8ea0"; },
    },
    {
      label: "Sentiment",
      getValue: (id) => { const r = safeGet(id); return r ? `${r.sentiment.positive}%` : "\u2014"; },
      getColor: (id) => { const r = safeGet(id); return r ? scoreColor(r.sentiment.positive, 100) : "#8e8ea0"; },
    },
    {
      label: "Ranking",
      getValue: (id) => { const r = safeGet(id); return r ? `#${r.ranking.position} of ${r.ranking.totalCompetitors}` : "\u2014"; },
      getColor: (id) => { const r = safeGet(id); return r ? rankColor(r.ranking.position) : "#8e8ea0"; },
    },
    {
      label: "Accuracy",
      getValue: (id) => {
        const r = safeGet(id);
        if (!r || r.accuracy.length === 0) return "\u2014";
        const correct = r.accuracy.filter((a) => a.status === "correct").length;
        return `${Math.round((correct / r.accuracy.length) * 100)}%`;
      },
      getColor: (id) => {
        const r = safeGet(id);
        if (!r || r.accuracy.length === 0) return "#8e8ea0";
        const correct = r.accuracy.filter((a) => a.status === "correct").length;
        return scoreColor(correct, r.accuracy.length);
      },
    },
    {
      label: "Sources Cited",
      getValue: (id) => { const r = safeGet(id); return r?.sources?.length ? `${r.sources.length}` : "\u2014"; },
      getColor: (id) => { const r = safeGet(id); return r?.sources?.length ? scoreColor(r.sources.length, 8) : "#8e8ea0"; },
    },
  ];

  void available; // available providers tracked for future use

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.8rem",
          border: "1px solid #e5e5e5",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderBottom: "1px solid #e5e5e5",
                fontSize: "0.7rem",
                fontWeight: 500,
                color: "#8e8ea0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: "#f7f7f8",
              }}
            >
              Metric
            </th>
            {LLM_PROVIDERS.map((p) => (
              <th
                key={p.id}
                style={{
                  textAlign: "center",
                  padding: "10px 12px",
                  borderBottom: "1px solid #e5e5e5",
                  fontWeight: 500,
                  color: "#171717",
                  fontSize: "0.8rem",
                  background: "#f7f7f8",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: p.color,
                      flexShrink: 0,
                    }}
                  />
                  {p.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, idx) => (
            <tr key={m.label} style={{ background: idx % 2 === 1 ? "#f7f7f8" : "#ffffff" }}>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #ececec",
                  color: "#6e6e80",
                  fontWeight: 500,
                }}
              >
                {m.label}
              </td>
              {LLM_PROVIDERS.map((p) => (
                <td
                  key={p.id}
                  style={{
                    textAlign: "center",
                    padding: "10px 12px",
                    borderBottom: "1px solid #ececec",
                    fontWeight: 500,
                    color: m.getColor(p.id),
                  }}
                >
                  {m.getValue(p.id)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
