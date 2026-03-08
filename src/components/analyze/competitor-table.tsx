"use client";

import type { CompetitorEntry } from "@/lib/mock-data";

interface CompetitorTableProps {
  competitors: CompetitorEntry[];
}

export function CompetitorTable({ competitors }: CompetitorTableProps) {
  const maxMentions = Math.max(...competitors.map((c) => c.mentionCount), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr 1fr 80px",
          gap: 8,
          padding: "8px 0",
          borderBottom: "1px solid #dddbd7",
        }}
      >
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#9a9793", textTransform: "uppercase", letterSpacing: "0.05em" }}>#</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#9a9793", textTransform: "uppercase", letterSpacing: "0.05em" }}>Business</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#9a9793", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mentions</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#9a9793", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Count</span>
      </div>
      {/* Rows */}
      {competitors.map((c) => {
        const pct = (c.mentionCount / maxMentions) * 100;
        return (
          <div
            key={c.rank}
            style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 1fr 80px",
              gap: 8,
              padding: "10px 0",
              borderBottom: "1px solid #f0eeea",
              background: c.isSubject ? "rgba(12, 12, 11, 0.03)" : "transparent",
              borderRadius: c.isSubject ? 8 : 0,
              paddingLeft: c.isSubject ? 8 : 0,
              marginLeft: c.isSubject ? -8 : 0,
              paddingRight: c.isSubject ? 8 : 0,
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#9a9793", fontWeight: 500 }}>{c.rank}</span>
            <span
              style={{
                fontSize: "0.8rem",
                color: "#0c0c0b",
                fontWeight: c.isSubject ? 700 : 400,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {c.name}
              {c.isSubject && (
                <span
                  style={{
                    fontSize: "0.6rem",
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: "#0c0c0b",
                    color: "#ffffff",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  You
                </span>
              )}
            </span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "#dddbd7",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 3,
                    background: c.isSubject ? "#0c0c0b" : "#9a9793",
                    transition: "width 0.6s ease-out",
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#0c0c0b",
                textAlign: "right",
              }}
            >
              {c.mentionCount}
            </span>
          </div>
        );
      })}
    </div>
  );
}
