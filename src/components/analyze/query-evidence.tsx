"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeTheme } from "@/contexts/analyze-theme";
import type { QueryResult, LLMProvider } from "@/lib/mock-data";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { formatQueryTypeLabel } from "@/lib/report-insights";


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

const ITEMS_PER_PAGE = 7;

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
  const theme = useAnalyzeTheme();
  const isLight = theme === "light";
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mentionFilter, setMentionFilter] = useState<"all" | "mentioned" | "not_mentioned">("all");
  const [queryTypeFilter, setQueryTypeFilter] = useState<string>("all");

  const queryTypeOptions = Array.from(new Set(queries.map((query) => query.queryType)));
  const mentionedCount = queries.filter((query) => query.businessMentioned).length;
  const primaryCount = queries.filter((query) => query.mentionType === "primary_recommendation").length;

  const filteredQueries = queries.filter((query) => {
    if (mentionFilter === "mentioned" && !query.businessMentioned) return false;
    if (mentionFilter === "not_mentioned" && query.businessMentioned) return false;
    if (queryTypeFilter !== "all" && query.queryType !== queryTypeFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredQueries.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageQueries = filteredQueries.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const selectChipStyle = (active: boolean) => ({
    border: `1px solid ${isLight ? (active ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)") : (active ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)")}`,
    background: isLight ? (active ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)") : (active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"),
    color: isLight ? (active ? "#18181b" : "#52525b") : (active ? "#ffffff" : "rgba(255,255,255,0.48)"),
  });

  const containerBg = isLight ? "#fafafa" : "#14151a";
  const containerBorder = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)";
  const headerColor = isLight ? "#71717a" : "rgba(255,255,255,0.4)";
  const cardBg = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
  const cardBorder = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
  const labelColor = isLight ? "#71717a" : "rgba(255,255,255,0.38)";
  const titleColor = isLight ? "#18181b" : "#ffffff";
  const bodyColor = isLight ? "#52525b" : "rgba(255,255,255,0.42)";
  const metaColor = isLight ? "#a1a1aa" : "rgba(255,255,255,0.4)";
  const dividerColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)";
  const rowHover = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
  const responseBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)";
  const paginationBorder = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const paginationBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)";
  const paginationColor = isLight ? "#52525b" : "rgba(255,255,255,0.5)";
  const paginationDisabled = isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)";

  const handleMentionFilter = (value: "all" | "mentioned" | "not_mentioned") => {
    setMentionFilter(value);
    setCurrentPage(1);
    setExpandedIndex(null);
  };

  const handleQueryTypeFilter = (value: string) => {
    setQueryTypeFilter(value);
    setCurrentPage(1);
    setExpandedIndex(null);
  };

  return (
    <div
      style={{
        background: containerBg,
        borderRadius: 12,
        border: `1px solid ${containerBorder}`,
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
        <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: headerColor }}>Query Evidence</div>
        <span style={{ fontSize: "0.72rem", color: headerColor }}>
          {mentionedCount} of {queries.length} mentioned {businessName}
        </span>
      </div>

      <div
        style={{
          padding: "0 1.25rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <div style={{ fontSize: "0.68rem", color: labelColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Mentioned
            </div>
            <div style={{ marginTop: 8, fontSize: "1.3rem", fontWeight: 600, color: titleColor }}>
              {mentionedCount}/{queries.length}
            </div>
          </div>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <div style={{ fontSize: "0.68rem", color: labelColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Primary recommendations
            </div>
            <div style={{ marginTop: 8, fontSize: "1.3rem", fontWeight: 600, color: titleColor }}>
              {primaryCount}
            </div>
          </div>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <div style={{ fontSize: "0.68rem", color: labelColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Query types
            </div>
            <div style={{ marginTop: 8, fontSize: "1.3rem", fontWeight: 600, color: titleColor }}>
              {queryTypeOptions.length}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All queries" },
              { id: "mentioned", label: "Mentioned only" },
              { id: "not_mentioned", label: "Not mentioned" },
            ].map((option) => {
              const active = mentionFilter === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleMentionFilter(option.id as "all" | "mentioned" | "not_mentioned")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    cursor: "pointer",
                    fontSize: "0.74rem",
                    fontWeight: 500,
                    transition: "all 0.15s ease",
                    ...selectChipStyle(active),
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.72rem", color: labelColor }}>Query type</span>
            <select
              value={queryTypeFilter}
              onChange={(event) => handleQueryTypeFilter(event.target.value)}
              style={{
                borderRadius: 999,
                border: `1px solid ${paginationBorder}`,
                background: cardBg,
                color: titleColor,
                padding: "7px 12px",
                fontSize: "0.75rem",
              }}
            >
              <option value="all">All types</option>
              {queryTypeOptions.map((queryType) => (
                <option key={queryType} value={queryType}>
                  {formatQueryTypeLabel(queryType)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {pageQueries.length === 0 && (
          <div
            style={{
              padding: "2rem 1.25rem",
              textAlign: "center",
              color: bodyColor,
              fontSize: "0.84rem",
              borderTop: `1px solid ${dividerColor}`,
            }}
          >
            No query evidence matches the current filters.
          </div>
        )}
        {pageQueries.map((q, pageIdx) => {
          const globalIdx = startIdx + pageIdx;
          const isExpanded = expandedIndex === globalIdx;
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

          const providerColor = PROVIDER_COLORS[q.provider] ?? (isLight ? "#71717a" : "rgba(255,255,255,0.4)");
          const providerName = PROVIDER_NAMES[q.provider] ?? q.provider;

          return (
            <div key={globalIdx}>
              {/* Row header — click to expand */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : globalIdx)}
                style={{
                  width: "100%",
                  padding: "0.875rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "none",
                  border: "none",
                  borderTop: `1px solid ${dividerColor}`,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = rowHover)
                }
                onMouseOut={(e) => (e.currentTarget.style.background = "none")}
              >
                {/* Query number */}
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: responseBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    fontFamily: "var(--font-mono, monospace)",
                    color: metaColor,
                    flexShrink: 0,
                  }}
                >
                  {String(globalIdx + 1).padStart(2, "0")}
                </span>

                {/* Query text */}
                <span
                  style={{
                    flex: 1,
                    fontSize: "0.8rem",
                    color: titleColor,
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
                    fontWeight: 500,
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
                    color: metaColor,
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
                            background: isLight ? "#e4e4e7" : "#22232a",
                            borderRadius: "12px 12px 4px 12px",
                            padding: "0.75rem 1rem",
                            border: `1px solid ${cardBorder}`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 500,
                              color: labelColor,
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
                              color: titleColor,
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
                            boxShadow: `0 0 0 2px ${providerColor}30`,
                          }}
                        >
                          <ProviderLogo provider={q.provider} size={14} />
                        </div>

                        {/* Response bubble */}
                        <div
                          style={{
                            maxWidth: "85%",
                            background: cardBg,
                            borderRadius: "12px 12px 12px 4px",
                            padding: "0.75rem 1rem",
                            borderLeft: `3px solid ${providerColor}`,
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: isLight ? "0 2px 12px rgba(0,0,0,0.06)" : "0 2px 12px rgba(0,0,0,0.2)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 500,
                              color: providerColor,
                              marginBottom: 6,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              flexShrink: 0,
                            }}
                          >
                            {providerName}
                          </div>
                          <div
                            className="query-response-scroll"
                            style={{
                              fontSize: "0.8rem",
                              color: bodyColor,
                              lineHeight: 1.6,
                              whiteSpace: "pre-line",
                              maxHeight: 160,
                              overflowY: "auto",
                              overscrollBehavior: "contain",
                            }}
                          >
                            {cleanResponseText(q.rawResponseExcerpt)}
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
                          color: metaColor,
                        }}
                      >
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: responseBg,
                          }}
                        >
                          {q.queryType.replace(/_/g, " ")}
                        </span>
                        {q.rankPosition && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: responseBg,
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
                                    : responseBg,
                              color:
                                q.sentiment === "positive"
                                  ? "#16a34a"
                                  : q.sentiment === "negative"
                                    ? "#dc2626"
                                    : metaColor,
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "0.75rem 1.25rem 1rem",
            borderTop: `1px solid ${dividerColor}`,
          }}
        >
          {/* Previous */}
          <button
            onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); setExpandedIndex(null); }}
            disabled={currentPage === 1}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${paginationBorder}`,
              background: currentPage === 1 ? "transparent" : paginationBg,
              color: currentPage === 1 ? paginationDisabled : paginationColor,
              cursor: currentPage === 1 ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseOver={(e) => { if (currentPage > 1) e.currentTarget.style.background = responseBg; }}
            onMouseOut={(e) => { e.currentTarget.style.background = currentPage === 1 ? "transparent" : paginationBg; }}
          >
            &#8249;
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show: first, last, current, and neighbors of current
            const show =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;
            const showEllipsis =
              !show &&
              (page === currentPage - 2 || page === currentPage + 2);

            if (showEllipsis) {
              return (
                <span
                  key={page}
                  style={{
                    width: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    color: metaColor,
                  }}
                >
                  &middot;&middot;&middot;
                </span>
              );
            }

            if (!show) return null;

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); setExpandedIndex(null); }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: isActive ? (isLight ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(255,255,255,0.2)") : `1px solid ${paginationBorder}`,
                  background: isActive ? (isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)") : "transparent",
                  color: isActive ? titleColor : paginationColor,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "var(--font-mono, monospace)",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = rowHover; }}
                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {page}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); setExpandedIndex(null); }}
            disabled={currentPage === totalPages}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${paginationBorder}`,
              background: currentPage === totalPages ? "transparent" : paginationBg,
              color: currentPage === totalPages ? paginationDisabled : paginationColor,
              cursor: currentPage === totalPages ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseOver={(e) => { if (currentPage < totalPages) e.currentTarget.style.background = responseBg; }}
            onMouseOut={(e) => { e.currentTarget.style.background = currentPage === totalPages ? "transparent" : paginationBg; }}
          >
            &#8250;
          </button>
        </div>
      )}
    </div>
  );
}
