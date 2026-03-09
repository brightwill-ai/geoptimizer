"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QueryResult, LLMProvider } from "@/lib/mock-data";
import { ProviderLogo } from "@/components/ui/provider-logo";

interface QueryEvidenceProps {
  queries: QueryResult[];
  businessName: string;
}

const PROVIDER_COLORS: Record<LLMProvider, string> = {
  chatgpt: "#10a37f",
  claude: "#c084fc",
  gemini: "#4285f4",
};

const PROVIDER_NAMES: Record<LLMProvider, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
};

/** Strip markdown artifacts and return clean readable text. */
function cleanResponseText(text: string): string {
  let cleaned = text;

  // Remove markdown link syntax [text](url) → just "text"
  cleaned = cleaned.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

  // Remove markdown headers (## ... ###)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // Remove markdown bold **text** or __text__
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/__([^_]+)__/g, "$1");

  // Remove markdown italic *text* or _text_ (single)
  cleaned = cleaned.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1");
  cleaned = cleaned.replace(/(?<!_)_([^_]+)_(?!_)/g, "$1");

  // Remove markdown bullet point formatting (- item or * item)
  cleaned = cleaned.replace(/^[\s]*[-*]\s+/gm, "");

  // Remove numbered list formatting (1. item)
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, "");

  // Remove horizontal rules (--- or ***)
  cleaned = cleaned.replace(/^[-*]{3,}\s*$/gm, "");

  // Remove inline code backticks
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // Remove blockquote markers
  cleaned = cleaned.replace(/^>\s*/gm, "");

  // Collapse multiple blank lines into one
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
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
          {queries.filter((q) => q.businessMentioned).length} of {queries.length} mentioned{" "}
          {businessName}
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

          const providerColor = PROVIDER_COLORS[q.provider] ?? "rgba(255,255,255,0.4)";
          const providerName = PROVIDER_NAMES[q.provider] ?? q.provider;

          return (
            <div key={i}>
              {/* Row header — click to expand */}
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
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
                }
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
                  &#9660;
                </span>
              </button>

              {/* Expanded chat interface */}
              <AnimatePresence>
                {isExpanded && q.rawResponseExcerpt && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "0.5rem 1.25rem 1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {/* ── User query bubble (right-aligned) ── */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "85%",
                            background: "#1a1b21",
                            borderRadius: "12px 12px 4px 12px",
                            padding: "0.75rem 1rem",
                            border: "1px solid #22232a",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.35)",
                              marginBottom: 6,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            Query
                          </div>
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "#ffffff",
                              lineHeight: 1.45,
                              fontWeight: 500,
                            }}
                          >
                            {q.queryText}
                          </div>
                        </div>
                      </div>

                      {/* ── AI response bubble (left-aligned) ── */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Provider avatar */}
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: `${providerColor}15`,
                            border: `1px solid ${providerColor}30`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          <ProviderLogo provider={q.provider} size={14} />
                        </div>

                        {/* Response bubble */}
                        <div
                          style={{
                            maxWidth: "85%",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "12px 12px 12px 4px",
                            padding: "0.75rem 1rem",
                            borderLeft: `3px solid ${providerColor}`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              color: providerColor,
                              marginBottom: 6,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {providerName}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "rgba(255,255,255,0.6)",
                              lineHeight: 1.6,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {cleanResponseText(q.rawResponseExcerpt)}
                            {q.rawResponseExcerpt.length >= 490 && (
                              <span style={{ color: "rgba(255,255,255,0.25)" }}> ...</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Metadata row ── */}
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          marginTop: 2,
                          paddingLeft: 38,
                          fontSize: "0.7rem",
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          {q.queryType.replace(/_/g, " ")}
                        </span>
                        {q.rankPosition && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: "rgba(255,255,255,0.04)",
                            }}
                          >
                            Position #{q.rankPosition}
                          </span>
                        )}
                        {q.sentiment && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 999,
                              background:
                                q.sentiment === "positive"
                                  ? "rgba(22,163,74,0.1)"
                                  : q.sentiment === "negative"
                                    ? "rgba(220,38,38,0.1)"
                                    : "rgba(255,255,255,0.04)",
                              color:
                                q.sentiment === "positive"
                                  ? "#16a34a"
                                  : q.sentiment === "negative"
                                    ? "#dc2626"
                                    : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {q.sentiment}
                          </span>
                        )}
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
