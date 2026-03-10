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
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>#</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Business</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mentions</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Count</span>
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
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: c.isSubject ? "rgba(255,255,255,0.03)" : "transparent",
              borderRadius: c.isSubject ? 8 : 0,
              paddingLeft: c.isSubject ? 8 : 0,
              marginLeft: c.isSubject ? -8 : 0,
              paddingRight: c.isSubject ? 8 : 0,
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{c.rank}</span>
            <span
              style={{
                fontSize: "0.8rem",
                color: "#ffffff",
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
                    background: "#ffffff",
                    color: "#0c0d10",
                    fontWeight: 500,
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
                  background: "rgba(255,255,255,0.06)",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 3,
                    background: c.isSubject ? "#ffffff" : "rgba(255,255,255,0.3)",
                    transition: "width 0.6s ease-out",
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#ffffff",
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
