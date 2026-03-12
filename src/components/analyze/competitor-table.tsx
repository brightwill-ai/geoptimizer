"use client";

import type { CompetitorEntry } from "@/lib/mock-data";

interface CompetitorTableProps {
  competitors: CompetitorEntry[];
}

export function CompetitorTable({ competitors }: CompetitorTableProps) {
  const sortedCompetitors = [...competitors].sort((a, b) => a.rank - b.rank);
  const maxMentions = Math.max(...sortedCompetitors.map((c) => c.mentionCount), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr 1fr 80px",
          gap: 8,
          padding: "8px 12px",
          borderBottom: "1px solid #e5e5e5",
          background: "#f7f7f8",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", textTransform: "uppercase", letterSpacing: "0.05em" }}>#</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Business</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mentions</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Count</span>
      </div>
      {/* Rows */}
      {sortedCompetitors.map((c, idx) => {
        const pct = (c.mentionCount / maxMentions) * 100;
        const isTopRow = idx === 0;
        const isEvenRow = idx % 2 === 1;
        const defaultBg = c.isSubject
          ? "#f7f7f8"
          : isTopRow
            ? "rgba(217,119,6,0.04)"
            : isEvenRow
              ? "#fafafa"
              : "#ffffff";
        return (
          <div
            key={`${c.rank}-${c.name}`}
            style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 1fr 80px",
              gap: 8,
              padding: "10px 12px",
              borderBottom: "1px solid #ececec",
              background: defaultBg,
              borderRadius: c.isSubject ? 8 : isTopRow ? 6 : 0,
              transition: "background 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f7f7f8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = defaultBg;
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#8e8ea0", fontWeight: 500 }}>{c.rank}</span>
            <span
              style={{
                fontSize: "0.8rem",
                color: "#171717",
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
                    background: "#171717",
                    color: "#ffffff",
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
                  background: "#f0f0f0",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 3,
                    background: c.isSubject ? "#171717" : "#8e8ea0",
                    transition: "width 0.6s ease-out",
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#171717",
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
