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
      label: "Recommendation Probability",
      getValue: (id) => { const r = safeGet(id); return r ? `${Math.round(r.recommendations.recommendationProbability * 100)}%` : "—"; },
      getColor: (id) => { const r = safeGet(id); return r ? scoreColor(r.recommendations.recommendationProbability * 100, 100) : "rgba(255,255,255,0.4)"; },
    },
    {
      label: "GEO Score",
      getValue: (id) => { const r = safeGet(id); return r ? `${r.overallScore}/100` : "—"; },
      getColor: (id) => { const r = safeGet(id); return r ? scoreColor(r.overallScore, 100) : "rgba(255,255,255,0.4)"; },
    },
    {
      label: "Queries Mentioned In",
      getValue: (id) => { const r = safeGet(id); return r ? `${r.recommendations.mentionCount} of ${r.recommendations.totalQueries}` : "—"; },
      getColor: (id) => { const r = safeGet(id); return r ? scoreColor(r.recommendations.mentionCount, r.recommendations.totalQueries) : "rgba(255,255,255,0.4)"; },
    },
    {
      label: "Sentiment",
      getValue: (id) => { const r = safeGet(id); return r ? `${r.sentiment.positive}%` : "—"; },
      getColor: (id) => { const r = safeGet(id); return r ? scoreColor(r.sentiment.positive, 100) : "rgba(255,255,255,0.4)"; },
    },
    {
      label: "Ranking",
      getValue: (id) => { const r = safeGet(id); return r ? `#${r.ranking.position} of ${r.ranking.totalCompetitors}` : "—"; },
      getColor: (id) => { const r = safeGet(id); return r ? rankColor(r.ranking.position) : "rgba(255,255,255,0.4)"; },
    },
    {
      label: "Accuracy",
      getValue: (id) => {
        const r = safeGet(id);
        if (!r || r.accuracy.length === 0) return "—";
        const correct = r.accuracy.filter((a) => a.status === "correct").length;
        return `${Math.round((correct / r.accuracy.length) * 100)}%`;
      },
      getColor: (id) => {
        const r = safeGet(id);
        if (!r || r.accuracy.length === 0) return "rgba(255,255,255,0.4)";
        const correct = r.accuracy.filter((a) => a.status === "correct").length;
        return scoreColor(correct, r.accuracy.length);
      },
    },
    {
      label: "Sources Cited",
      getValue: (id) => { const r = safeGet(id); return r?.sources?.length ? `${r.sources.length}` : "—"; },
      getColor: (id) => { const r = safeGet(id); return r?.sources?.length ? scoreColor(r.sources.length, 8) : "rgba(255,255,255,0.4)"; },
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
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: "0.7rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
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
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  fontWeight: 500,
                  color: "#ffffff",
                  fontSize: "0.8rem",
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
          {metrics.map((m) => (
            <tr key={m.label}>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.7)",
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
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
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
