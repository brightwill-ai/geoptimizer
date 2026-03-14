"use client";

import { useState } from "react";
import type { GEOAnalysis } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { ScoreRing } from "./score-ring";
import { QueryEvidence } from "./query-evidence";
import { QueryTypeBreakdown } from "./query-type-breakdown";
import { SourceInfluenceMap } from "./source-influence-map";
import { CompetitorTable } from "./competitor-table";
import { DashboardShell } from "./dashboard-shell";
import { DashboardCard } from "./dashboard-card";
import { SentimentBadge } from "./sentiment-badge";
import type { KPIItem } from "./kpi-row";
import { getReportSnapshot } from "@/lib/report-insights";

interface PartialReportProps {
  analysis: GEOAnalysis;
  analysisId?: string;
  onUnlock: () => void;
}

type PartialTab = "overview" | "evidence";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        color: "#8e8ea0",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

/** Format raw LLM response text into structured React elements */
function formatResponseText(text: string): React.ReactNode[] {
  // Clean markdown artifacts first
  const cleaned = text
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, "$1") // [text](url) → text
    .replace(/^#{1,6}\s+/gm, "")               // Remove headers
    .replace(/`([^`]+)`/g, "$1")                // Remove inline code
    .replace(/^>\s*/gm, "")                     // Remove blockquotes
    .replace(/^[-*]{3,}\s*$/gm, "")             // Remove horizontal rules
    .trim();

  const lines = cleaned.split("\n");
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ol key={`list-${elements.length}`} style={{ margin: "6px 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {currentListItems}
        </ol>
      );
      currentListItems = [];
    }
  };

  const formatInline = (str: string): React.ReactNode => {
    // Bold **text** or __text__
    const parts = str.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
    if (parts.length === 1) return str;
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "#171717", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("__") && part.endsWith("__")) {
        return <strong key={i} style={{ color: "#171717", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flushList();
      continue;
    }

    // Numbered list: "1. **Name** — description"
    const numberedMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const content = numberedMatch[2];
      currentListItems.push(
        <li key={`item-${i}`} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ width: 20, height: 20, borderRadius: 6, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 600, color: "#8e8ea0", flexShrink: 0, marginTop: 1 }}>{num}</span>
          <span style={{ flex: 1 }}>{formatInline(content)}</span>
        </li>
      );
      continue;
    }

    // Bullet list: "- item" or "* item"
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      currentListItems.push(
        <li key={`item-${i}`} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#8e8ea0", flexShrink: 0, marginTop: 8 }} />
          <span style={{ flex: 1 }}>{formatInline(bulletMatch[1])}</span>
        </li>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} style={{ margin: "4px 0", lineHeight: 1.55 }}>{formatInline(line)}</p>
    );
  }
  flushList();
  return elements;
}

function FindingBlock({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: "positive" | "warning" | "negative" | "neutral";
}) {
  const accent =
    tone === "positive"
      ? "#16a34a"
      : tone === "warning"
        ? "#d97706"
        : tone === "negative"
          ? "#dc2626"
          : "#8e8ea0";

  const bg =
    tone === "positive"
      ? "#f0fdf4"
      : tone === "warning"
        ? "#fffbeb"
        : tone === "negative"
          ? "#fef2f2"
          : "#f7f7f8";

  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px solid ${accent}22`,
        background: bg,
      }}
    >
      <div style={{ fontSize: "0.86rem", color: "#171717", fontWeight: 600, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: "0.78rem", color: "#6e6e80", lineHeight: 1.45 }}>
        {detail}
      </div>
    </div>
  );
}

export function PartialReport({ analysis, analysisId, onUnlock }: PartialReportProps) {
  const chatgpt = analysis.reports.chatgpt;
  const snapshot = getReportSnapshot(chatgpt);
  const [activeTab, setActiveTab] = useState<PartialTab>("overview");
  const [emailValue, setEmailValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const lockedProviders = LLM_PROVIDERS.filter((provider) => provider.id !== "chatgpt");
  const probability = Math.round(chatgpt.recommendations.recommendationProbability * 100);
  const visibilityRatio = `${chatgpt.recommendations.mentionCount}/${chatgpt.recommendations.totalQueries} prompts`;

  // Competitor-first data
  const topCompetitor = snapshot.topCompetitor;
  const competitorWins = chatgpt.recommendations.notMentionedCount;
  const totalQueries = chatgpt.recommendations.totalQueries;
  const worstDiscoveryQuery = chatgpt.queryResults.find(
    (q) => (q.queryType === "discovery" || q.queryType === "subcategory_discovery") && !q.businessMentioned
  ) ?? chatgpt.queryResults.find((q) => !q.businessMentioned);

  const kpiItems: KPIItem[] = [
    {
      label: "Visibility",
      value: `${probability}%`,
      sublabel: `${snapshot.visibility.label} in ChatGPT`,
      detail: visibilityRatio,
      accentColor: snapshot.visibility.color,
      ring: { score: probability },
    },
    {
      label: "Strongest query",
      value: snapshot.strongestQueryType?.label ?? "N/A",
      sublabel: snapshot.strongestQueryType
        ? `${Math.round(snapshot.strongestQueryType.mentionRate * 100)}% mention rate`
        : "No query data",
    },
    {
      label: "Top competitor",
      value: snapshot.topCompetitor ?? "None",
      sublabel: "Most often recommended ahead of you",
    },
  ];

  const stickyCta = (
    <div className="analysis-sticky-cta" style={{ background: "#171717" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {LLM_PROVIDERS.map((provider) => (
          <ProviderLogo key={provider.id} provider={provider.id} size={14} />
        ))}
      </div>
      <span style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.7)" }}>
        {topCompetitor
          ? `${topCompetitor} is beating you on ChatGPT. Find out if they're winning everywhere.`
          : "See how ChatGPT, Claude, and Gemini compare across 100+ prompts."
        }
      </span>
      <button
        onClick={onUnlock}
        style={{
          padding: "0.7rem 1.2rem",
          fontSize: "0.82rem",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          borderRadius: 10,
          border: "none",
          background: "#ffffff",
          color: "#171717",
          cursor: "pointer",
        }}
      >
        Unlock full audit — $19
      </button>
    </div>
  );

  const headerMeta = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <span className="analysis-meta-pill">Free audit</span>
      <span className="analysis-meta-pill">ChatGPT only</span>
      <span className="analysis-meta-pill">{chatgpt.recommendations.totalQueries} real queries</span>
    </div>
  );

  const handleShareLinkedIn = () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCopyLink = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  const shareButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    color: "#6e6e80",
    fontSize: "0.76rem",
    fontWeight: 500,
    fontFamily: "var(--font-sans)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const headerRight = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
      {lockedProviders.map((provider) => (
        <span key={provider.id} className="analysis-provider-pill">
          <ProviderLogo provider={provider.id} size={12} />
          {provider.name}
        </span>
      ))}
      <button onClick={handleShareLinkedIn} style={shareButtonStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        Share
      </button>
      <button onClick={handleCopyLink} style={shareButtonStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        {linkCopied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );

  return (
    <div style={{ paddingBottom: 110 }}>
      <DashboardShell
        businessName={analysis.businessName}
        subtitle={`ChatGPT recommended this business in ${chatgpt.recommendations.mentionCount} of ${chatgpt.recommendations.totalQueries} relevant prompts.`}
        headerLeft={<ProviderLogo provider="chatgpt" size={20} />}
        headerMeta={headerMeta}
        headerRight={headerRight}
        kpiItems={kpiItems}
        layout="sidebar"
        tabIcons={{
          overview: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
          evidence: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
        }}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "evidence", label: "Evidence" },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as PartialTab)}
        navLayoutId="partial-report-tab"
        stickyFooter={stickyCta}
        stickyMode="compact"
      >
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <DashboardCard span={2} accentColor={snapshot.visibility.color} style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}>
              <div className="analysis-hero-grid">
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "5px 12px",
                      borderRadius: 999,
                      background: snapshot.visibility.background,
                      color: snapshot.visibility.color,
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      marginBottom: 14,
                    }}
                  >
                    {snapshot.visibility.label} visibility
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "clamp(1.55rem, 3vw, 2.25rem)",
                      lineHeight: 1.06,
                      color: "#171717",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {topCompetitor
                      ? <>ChatGPT recommends <strong style={{ color: "#d97706" }}>{topCompetitor}</strong> over you for {competitorWins} of {totalQueries} queries</>
                      : <>ChatGPT doesn&apos;t mention {analysis.businessName} in {competitorWins} of {totalQueries} relevant queries</>
                    }
                  </h2>
                  <p
                    style={{
                      margin: "14px 0 0",
                      maxWidth: 720,
                      fontSize: "0.95rem",
                      color: "#6e6e80",
                      lineHeight: 1.6,
                    }}
                  >
                    {topCompetitor ? (
                      <>When someone asks for the best in your category near{" "}
                        <strong style={{ color: "#171717" }}>
                          {analysis.businessName.split(",")[0]}
                        </strong>
                        , ChatGPT sends them to{" "}
                        <strong style={{ color: "#171717" }}>{topCompetitor}</strong> instead.
                        The biggest gap is in{" "}
                        <strong style={{ color: "#171717" }}>
                          {snapshot.weakestQueryType?.label ?? "discovery"}
                        </strong>{" "}prompts.
                      </>
                    ) : (
                      <>{snapshot.visibility.description} The clearest gap is in{" "}
                        <strong style={{ color: "#171717" }}>
                          {snapshot.weakestQueryType?.label ?? "discovery"}
                        </strong>{" "}
                        prompts, where AI still defaults to other businesses.
                      </>
                    )}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                    <span className="analysis-meta-pill">Snapshot first</span>
                    <span className="analysis-meta-pill">Why it happened next</span>
                    <span className="analysis-meta-pill">Full audit adds cross-platform proof</span>
                  </div>
                </div>

                <div className="analysis-hero-score">
                  <div>
                    <ScoreRing score={probability} size={132} strokeWidth={10} />
                  </div>
                  <div style={{ display: "grid", gap: 10, width: "100%" }}>
                    <div className="analysis-mini-stat">
                      <span>Mentioned in prompts</span>
                      <strong>
                        {visibilityRatio}
                      </strong>
                    </div>
                    <div className="analysis-mini-stat">
                      <span>Primary recommendations</span>
                      <strong>{chatgpt.recommendations.primaryRecommendationCount}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* CTA — upgrade to full audit */}
            <DashboardCard
              accentColor="#ffffff"
              style={{ background: "#171717", border: "1px solid #171717" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#ffffff", lineHeight: 1.3 }}>
                    {topCompetitor
                      ? `Is ${topCompetitor} winning on Claude and Gemini too?`
                      : "See how you rank across all 3 AI engines"
                    }
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                    100+ prompts across ChatGPT, Claude & Gemini. Source mapping + 80-step action plan.
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {LLM_PROVIDERS.map((provider) => (
                      <ProviderLogo key={provider.id} provider={provider.id} size={16} />
                    ))}
                  </div>
                  <button
                    onClick={onUnlock}
                    style={{
                      padding: "0.7rem 1.4rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-sans)",
                      borderRadius: 8,
                      border: "none",
                      background: "#ffffff",
                      color: "#171717",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Unlock full audit — $19
                  </button>
                </div>
              </div>
            </DashboardCard>

            {/* What your customers see — verbatim AI response, natural page scroll */}
            {worstDiscoveryQuery && (
              <DashboardCard title="What your customers see" accentColor="#10a37f">
                <div
                  className="query-response-scroll"
                  style={{
                    maxHeight: 360,
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* User query bubble */}
                  <div style={{
                    alignSelf: "flex-end",
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: "12px 12px 2px 12px",
                    background: "#f7f7f8",
                    border: "1px solid #e5e5e5",
                    fontSize: "0.84rem",
                    color: "#171717",
                    lineHeight: 1.5,
                    flexShrink: 0,
                  }}>
                    {worstDiscoveryQuery.queryText}
                  </div>
                  {/* AI response bubble */}
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#10a37f15",
                      border: "2px solid rgba(16,163,127,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <ProviderLogo provider="chatgpt" size={14} />
                    </div>
                    <div style={{
                      flex: 1,
                      borderRadius: "2px 12px 12px 12px",
                      background: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderLeft: "3px solid #10a37f",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      padding: "12px 14px",
                      fontSize: "0.82rem",
                      color: "#6e6e80",
                      lineHeight: 1.55,
                    }}>
                      {formatResponseText(worstDiscoveryQuery.rawResponseExcerpt)}
                    </div>
                  </div>
                  {!worstDiscoveryQuery.businessMentioned && (
                    <div style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "#fef2f2",
                      border: "1px solid rgba(220,38,38,0.15)",
                      fontSize: "0.78rem",
                      color: "#dc2626",
                      fontWeight: 500,
                      textAlign: "center",
                      flexShrink: 0,
                    }}>
                      {analysis.businessName} was not mentioned in this response
                    </div>
                  )}
                </div>
              </DashboardCard>
            )}

            {/* Email capture — save your results */}
            {analysisId && !emailSaved && (
              <DashboardCard
                accentColor="#16a34a"
                style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}
              >
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#171717", marginBottom: 4 }}>
                  Save your results
                </div>
                <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "#6e6e80", lineHeight: 1.5 }}>
                  Get notified when your AI visibility changes. We&apos;ll check monthly.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!emailValue.trim()) return;
                    setEmailSubmitting(true);
                    setEmailError("");
                    try {
                      const res = await fetch(`/api/analysis/${analysisId}/email-capture`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: emailValue.trim(), name: nameValue.trim() || undefined }),
                      });
                      if (!res.ok) throw new Error("Failed to save");
                      setEmailSaved(true);
                    } catch {
                      setEmailError("Something went wrong. Please try again.");
                    } finally {
                      setEmailSubmitting(false);
                    }
                  }}
                  style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                >
                  <input
                    type="text"
                    placeholder="Name (optional)"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    style={{
                      flex: "0 1 160px",
                      padding: "10px 12px",
                      fontSize: "0.84rem",
                      fontFamily: "var(--font-sans)",
                      borderRadius: 8,
                      border: "1px solid #e5e5e5",
                      background: "#f7f7f8",
                      color: "#171717",
                      outline: "none",
                    }}
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    style={{
                      flex: "1 1 200px",
                      padding: "10px 12px",
                      fontSize: "0.84rem",
                      fontFamily: "var(--font-sans)",
                      borderRadius: 8,
                      border: "1px solid #e5e5e5",
                      background: "#f7f7f8",
                      color: "#171717",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={emailSubmitting}
                    style={{
                      padding: "10px 20px",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-sans)",
                      borderRadius: 8,
                      border: "none",
                      background: "#171717",
                      color: "#ffffff",
                      cursor: emailSubmitting ? "not-allowed" : "pointer",
                      opacity: emailSubmitting ? 0.6 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {emailSubmitting ? "Saving..." : "Save"}
                  </button>
                </form>
                {emailError && (
                  <div style={{ marginTop: 8, fontSize: "0.78rem", color: "#dc2626" }}>{emailError}</div>
                )}
              </DashboardCard>
            )}

            {/* Email saved success state */}
            {emailSaved && (
              <DashboardCard
                accentColor="#16a34a"
                style={{ background: "#ffffff", borderLeft: "3px solid #16a34a", border: "1px solid #e5e5e5", borderLeftWidth: 3, borderLeftColor: "#16a34a" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#171717" }}>Saved!</div>
                    <div style={{ fontSize: "0.78rem", color: "#6e6e80" }}>We&apos;ll email you monthly updates on your AI visibility.</div>
                  </div>
                </div>
              </DashboardCard>
            )}

            {/* Quick Wins — rule-based action items from audit data */}
            <DashboardCard title="3 quick wins to start now" accentColor="#171717">
              <div style={{ display: "grid", gap: 10 }}>
                {(() => {
                  const wins: { icon: string; title: string; detail: string }[] = [];
                  const notMentioned = chatgpt.recommendations.notMentionedCount > 0;
                  const hasCompetitors = (chatgpt.competitors?.length ?? 0) > 0;
                  const sentimentScore = chatgpt.sentiment?.positive ?? 0;
                  const weakSentiment = sentimentScore < 60;
                  const topSource = snapshot.topSource;

                  if (notMentioned) {
                    const platform = topSource?.name ?? "Google Business Profile";
                    wins.push({
                      icon: "1",
                      title: `Claim and optimize your ${platform} listing`,
                      detail: `AI models pull from review platforms and directories. ${platform} was the most cited source — make sure your profile is complete with hours, photos, and descriptions.`,
                    });
                  } else {
                    wins.push({
                      icon: "1",
                      title: "Keep your directory listings up to date",
                      detail: "AI models cross-reference multiple sources. Ensure your Google Business, Yelp, and industry listings have consistent, current information.",
                    });
                  }

                  if (hasCompetitors && topCompetitor) {
                    wins.push({
                      icon: "2",
                      title: "Add structured data (Schema.org) to your website",
                      detail: `${topCompetitor} is currently recommended ahead of you. Schema markup helps AI models understand what your business does and improves your chances of being cited.`,
                    });
                  } else {
                    wins.push({
                      icon: "2",
                      title: "Add structured data (Schema.org) to your website",
                      detail: "Schema markup helps AI models understand your business type, location, and services — making it easier for them to recommend you in relevant queries.",
                    });
                  }

                  if (weakSentiment) {
                    wins.push({
                      icon: "3",
                      title: "Respond to recent reviews on Google and Yelp",
                      detail: "Your sentiment signal is weaker than it should be. AI models factor in review tone — responding to reviews (especially negative ones) shows engagement and can shift sentiment.",
                    });
                  } else {
                    wins.push({
                      icon: "3",
                      title: "Collect more customer reviews",
                      detail: "Review volume strongly predicts AI recommendations. Businesses with 100+ reviews are 3x more likely to be recommended. Ask satisfied customers to leave a review.",
                    });
                  }

                  return wins.map((win) => (
                    <div
                      key={win.icon}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: "#f7f7f8",
                        border: "1px solid #e5e5e5",
                      }}
                    >
                      <span style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: "#171717",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1,
                      }}>{win.icon}</span>
                      <div>
                        <div style={{ fontSize: "0.86rem", fontWeight: 600, color: "#171717", marginBottom: 4 }}>
                          {win.title}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#6e6e80", lineHeight: 1.5 }}>
                          {win.detail}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
                <button
                  onClick={onUnlock}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: "1px dashed #e5e5e5",
                    background: "transparent",
                    color: "#6e6e80",
                    fontSize: "0.82rem",
                    fontFamily: "var(--font-sans)",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  Run the full audit for your complete 80-step action plan
                </button>
              </div>
            </DashboardCard>

            <div>
              <SectionLabel>Snapshot</SectionLabel>
              <div className="dashboard-grid">
                <DashboardCard title="Top blockers" accentColor="#d97706">
                  <div style={{ display: "grid", gap: 10 }}>
                    {snapshot.blockers.map((blocker) => (
                      <FindingBlock
                        key={blocker.title}
                        title={blocker.title}
                        detail={blocker.detail}
                        tone={blocker.tone}
                      />
                    ))}
                  </div>
                </DashboardCard>

                <DashboardCard title="What is already working" accentColor="#16a34a">
                  <div style={{ display: "grid", gap: 10 }}>
                    {snapshot.wins.map((win) => (
                      <FindingBlock
                        key={win.title}
                        title={win.title}
                        detail={win.detail}
                        tone={win.tone}
                      />
                    ))}
                  </div>
                </DashboardCard>
              </div>
            </div>

            <div>
              <SectionLabel>Why This Happened</SectionLabel>
              <div className="dashboard-grid">
                <DashboardCard title="Query pattern" subtitle="Where ChatGPT sees the business">
                  <div style={{ display: "grid", gap: 14 }}>
                    <div className="analysis-mini-grid">
                      <div className="analysis-mini-panel">
                        <span>Strongest</span>
                        <strong>{snapshot.strongestQueryType?.label ?? "N/A"}</strong>
                        <small>
                          {snapshot.strongestQueryType
                            ? `${Math.round(snapshot.strongestQueryType.mentionRate * 100)}% mention rate`
                            : "No query data"}
                        </small>
                      </div>
                      <div className="analysis-mini-panel">
                        <span>Weakest</span>
                        <strong>{snapshot.weakestQueryType?.label ?? "N/A"}</strong>
                        <small>
                          {snapshot.weakestQueryType
                            ? `${Math.round(snapshot.weakestQueryType.mentionRate * 100)}% mention rate`
                            : "No query data"}
                        </small>
                      </div>
                    </div>
                    <QueryTypeBreakdown
                      queryResults={chatgpt.queryResults}
                      businessName={analysis.businessName}
                    />
                  </div>
                </DashboardCard>

                <DashboardCard title="Competitive context" subtitle="Who wins when you do not">
                  <div style={{ display: "grid", gap: 14 }}>
                    <div className="analysis-mini-panel">
                      <span>Main threat</span>
                      <strong>{snapshot.topCompetitor ?? "No competitor data"}</strong>
                      <small>Currently the competitor most likely to be recommended first.</small>
                    </div>
                    <CompetitorTable competitors={chatgpt.competitors} />
                  </div>
                </DashboardCard>
              </div>
            </div>

            {/* Blurred preview — what the full audit reveals */}
            <div style={{ position: "relative" }}>
              <SectionLabel>Full Audit Preview</SectionLabel>
              <div style={{ position: "relative" }}>
                {/* Blurred fake content */}
                <div style={{
                  filter: "blur(6px)",
                  opacity: 0.5,
                  pointerEvents: "none",
                  userSelect: "none",
                }}>
                  <div className="dashboard-grid">
                    {/* Fake Claude card */}
                    <DashboardCard accentColor="#c084fc">
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <ProviderLogo provider="claude" size={20} />
                        <div>
                          <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#171717" }}>Claude Analysis</div>
                          <div style={{ fontSize: "0.75rem", color: "#8e8ea0" }}>37+ queries analyzed</div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: 10 }}>
                        <div className="analysis-mini-panel">
                          <span>Visibility</span>
                          <strong>??%</strong>
                          <small>Recommendation probability</small>
                        </div>
                        <div className="analysis-mini-panel">
                          <span>Top competitor</span>
                          <strong>Locked</strong>
                          <small>Who Claude recommends instead</small>
                        </div>
                      </div>
                    </DashboardCard>

                    {/* Fake Gemini card */}
                    <DashboardCard accentColor="#4285f4">
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <ProviderLogo provider="gemini" size={20} />
                        <div>
                          <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#171717" }}>Gemini Analysis</div>
                          <div style={{ fontSize: "0.75rem", color: "#8e8ea0" }}>37+ queries analyzed</div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: 10 }}>
                        <div className="analysis-mini-panel">
                          <span>Visibility</span>
                          <strong>??%</strong>
                          <small>Recommendation probability</small>
                        </div>
                        <div className="analysis-mini-panel">
                          <span>Top competitor</span>
                          <strong>Locked</strong>
                          <small>Who Gemini recommends instead</small>
                        </div>
                      </div>
                    </DashboardCard>
                  </div>

                  {/* Fake cross-platform comparison */}
                  <div style={{ marginTop: 16 }}>
                    <DashboardCard>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#171717" }}>Cross-Platform Comparison</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                        {LLM_PROVIDERS.map((p) => (
                          <div key={p.id} style={{ textAlign: "center", padding: 16, borderRadius: 10, background: "#f7f7f8", border: "1px solid #e5e5e5" }}>
                            <ProviderLogo provider={p.id} size={24} />
                            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#171717", marginTop: 8 }}>??%</div>
                            <div style={{ fontSize: "0.72rem", color: "#8e8ea0" }}>{p.name}</div>
                          </div>
                        ))}
                      </div>
                    </DashboardCard>
                  </div>

                  {/* Fake action plan */}
                  <div style={{ marginTop: 16 }}>
                    <DashboardCard>
                      <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#171717", marginBottom: 10 }}>80-Step Action Plan</div>
                      <div style={{ display: "grid", gap: 8 }}>
                        {["Claim & verify Google Business Profile", "Add schema.org markup to homepage", "Get listed on top 5 review platforms"].map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "#f7f7f8", border: "1px solid #e5e5e5" }}>
                            <div style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid #d0d0d0" }} />
                            <span style={{ fontSize: "0.82rem", color: "#6e6e80" }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </DashboardCard>
                  </div>
                </div>

                {/* Unlock overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}>
                  <div style={{
                    background: "#ffffff",
                    border: "1px solid #e5e5e5",
                    borderRadius: 16,
                    padding: "28px 36px",
                    textAlign: "center",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    maxWidth: 420,
                  }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                      {LLM_PROVIDERS.map((provider) => (
                        <div key={provider.id} style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${provider.color}12`,
                          border: `1px solid ${provider.color}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <ProviderLogo provider={provider.id} size={18} />
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#171717", marginBottom: 6 }}>
                      {topCompetitor
                        ? `Is ${topCompetitor} winning on Claude and Gemini too?`
                        : "See the full picture across all 3 AI engines"
                      }
                    </div>
                    <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "#6e6e80", lineHeight: 1.5 }}>
                      100+ prompts, cross-platform source mapping, and a personalized 80-step action plan to fix every gap.
                    </p>
                    <button
                      onClick={onUnlock}
                      style={{
                        width: "100%",
                        padding: "0.85rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        fontFamily: "var(--font-sans)",
                        borderRadius: 10,
                        border: "none",
                        background: "#171717",
                        color: "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      Unlock full audit — $19
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "evidence" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <DashboardCard noPadding>
              <QueryEvidence
                queries={chatgpt.queryResults}
                businessName={analysis.businessName}
              />
            </DashboardCard>

            <DashboardCard title="Source and sentiment readout" subtitle="Why ChatGPT formed this impression">
              <div style={{ display: "grid", gap: 14 }}>
                <div className="analysis-mini-grid">
                  <div className="analysis-mini-panel">
                    <span>Most cited source</span>
                    <strong>{snapshot.topSource?.name ?? "No source data"}</strong>
                    <small>
                      {snapshot.topSource
                        ? `${snapshot.topSource.count} citations`
                        : "No source data available"}
                    </small>
                  </div>
                  <div className="analysis-mini-panel">
                    <span>Sentiment</span>
                    <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <SentimentBadge sentiment={snapshot.sentimentLabel} size="md" />
                    </strong>
                    <small>{chatgpt.sentiment.positive}% positive phrasing when mentioned</small>
                  </div>
                </div>
                {snapshot.sampleQuote && (
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: "#f7f7f8",
                      border: "1px solid #e5e5e5",
                      color: "#6e6e80",
                      fontStyle: "italic",
                    }}
                  >
                    {snapshot.sampleQuote}
                  </div>
                )}
                {(chatgpt.sources?.length ?? 0) > 0 && (
                  <SourceInfluenceMap sources={chatgpt.sources} providerName="ChatGPT" />
                )}
              </div>
            </DashboardCard>
          </div>
        )}
      {/* Support footer */}
      <div style={{ textAlign: "center", padding: "2rem 0 1rem", fontSize: "0.75rem", color: "#8e8ea0" }}>
        Need help? Reach us at{" "}
        <a href="mailto:support@brightwill.ai" style={{ color: "#4285f4", textDecoration: "none" }}>
          support@brightwill.ai
        </a>
      </div>
      </DashboardShell>
    </div>
  );
}
