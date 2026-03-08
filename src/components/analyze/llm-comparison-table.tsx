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
  const metrics: {
    label: string;
    getValue: (id: LLMProvider) => string;
    getColor: (id: LLMProvider) => string;
  }[] = [
    {
      label: "GEO Score",
      getValue: (id) => `${analysis.reports[id].overallScore}/100`,
      getColor: (id) => scoreColor(analysis.reports[id].overallScore, 100),
    },
    {
      label: "Citations",
      getValue: (id) => `${analysis.reports[id].citations.totalMentions}`,
      getColor: (id) => scoreColor(analysis.reports[id].citations.totalMentions, 100),
    },
    {
      label: "Sentiment",
      getValue: (id) => `${analysis.reports[id].sentiment.positive}%`,
      getColor: (id) => scoreColor(analysis.reports[id].sentiment.positive, 100),
    },
    {
      label: "Ranking",
      getValue: (id) => `#${analysis.reports[id].ranking.position} of ${analysis.reports[id].ranking.totalCompetitors}`,
      getColor: (id) => rankColor(analysis.reports[id].ranking.position),
    },
    {
      label: "Accuracy",
      getValue: (id) => {
        const acc = analysis.reports[id].accuracy;
        const correct = acc.filter((a) => a.status === "correct").length;
        return `${Math.round((correct / acc.length) * 100)}%`;
      },
      getColor: (id) => {
        const acc = analysis.reports[id].accuracy;
        const correct = acc.filter((a) => a.status === "correct").length;
        return scoreColor(correct, acc.length);
      },
    },
  ];

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
                borderBottom: "1px solid #dddbd7",
                fontSize: "0.7rem",
                fontWeight: 500,
                color: "#9a9793",
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
                  borderBottom: "1px solid #dddbd7",
                  fontWeight: 600,
                  color: "#0c0c0b",
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
                  borderBottom: "1px solid #f0eeea",
                  color: "#3a3936",
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
                    borderBottom: "1px solid #f0eeea",
                    fontWeight: 600,
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
