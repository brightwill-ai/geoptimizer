"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QueryResult } from "@/lib/mock-data";

interface QueryEvidenceProps {
  queries: QueryResult[];
  businessName: string;
}

export function QueryEvidence({ queries, businessName }: QueryEvidenceProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        background: "#14151a",
        borderRadius: 12,
        border: "1px solid #22232a",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1.25rem 1.25rem 0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}
        >
          Query Evidence
        </h3>
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
          {queries.filter((q) => q.businessMentioned).length} of {queries.length} mentioned {businessName}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {queries.map((q, i) => {
          const isExpanded = expandedIndex === i;
          const mentionColor =
            q.mentionType === "primary_recommendation"
              ? "#16a34a"
              : q.mentionType === "passing_mention"
                ? "#d97706"
                : "#dc2626";
          const mentionBg =
            q.mentionType === "primary_recommendation"
              ? "rgba(22,163,74,0.15)"
              : q.mentionType === "passing_mention"
                ? "rgba(217,119,6,0.15)"
                : "rgba(220,38,38,0.15)";
          const mentionLabel =
            q.mentionType === "primary_recommendation"
              ? "Recommended"
              : q.mentionType === "passing_mention"
                ? "Mentioned"
                : "Not mentioned";

          return (
            <div key={i}>
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                style={{
                  width: "100%",
                  padding: "0.875rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "none",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "none")}
              >
                {/* Query number */}
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>

                {/* Query text */}
                <span
                  style={{
                    flex: 1,
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 500,
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {q.queryText}
                </span>

                {/* Mention badge */}
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: mentionBg,
                    color: mentionColor,
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {mentionLabel}
                </span>

                {/* Expand arrow */}
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.3)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Expanded response */}
              <AnimatePresence>
                {isExpanded && q.rawResponseExcerpt && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "0 1.25rem 1rem 3.5rem",
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 8,
                          padding: "0.75rem 1rem",
                          fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.6)",
                          lineHeight: 1.5,
                          fontStyle: "italic",
                          borderLeft: `3px solid ${mentionColor}`,
                        }}
                      >
                        {q.rawResponseExcerpt}
                        {q.rawResponseExcerpt.length >= 490 && (
                          <span style={{ color: "rgba(255,255,255,0.3)" }}> ...</span>
                        )}
                      </div>

                      {/* Metadata row */}
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          marginTop: 8,
                          fontSize: "0.7rem",
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        <span>Type: {q.queryType.replace("_", " ")}</span>
                        {q.rankPosition && <span>Position: #{q.rankPosition}</span>}
                        {q.sentiment && <span>Sentiment: {q.sentiment}</span>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
