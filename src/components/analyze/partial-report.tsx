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

export function PartialReport({ analysis, onUnlock }: PartialReportProps) {
  const chatgpt = analysis.reports.chatgpt;
  const snapshot = getReportSnapshot(chatgpt);
  const [activeTab, setActiveTab] = useState<PartialTab>("overview");
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
          : "See how ChatGPT, Claude, and Gemini compare across 40+ prompts."
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
        Unlock full audit — $99
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

  const headerRight = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {lockedProviders.map((provider) => (
        <span key={provider.id} className="analysis-provider-pill">
          <ProviderLogo provider={provider.id} size={12} />
          {provider.name}
        </span>
      ))}
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

            {/* What your customers see — verbatim AI response */}
            {worstDiscoveryQuery && (
              <DashboardCard title="What your customers see" subtitle={`When someone asks: "${worstDiscoveryQuery.queryText}"`} accentColor="#10a37f">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 0 0 2px rgba(16,163,127,0.2)",
                    }}>
                      <ProviderLogo provider="chatgpt" size={14} />
                    </div>
                    <div style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: "2px 12px 12px 12px",
                      background: "#fffbeb",
                      borderLeft: "3px solid #d97706",
                      fontSize: "0.82rem",
                      fontFamily: "var(--font-mono, monospace)",
                      color: "#6e6e80",
                      lineHeight: 1.6,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}>
                      {worstDiscoveryQuery.rawResponseExcerpt}
                      {!worstDiscoveryQuery.businessMentioned && (
                        <div style={{
                          marginTop: 10,
                          padding: "6px 10px",
                          borderRadius: 6,
                          background: "#fef2f2",
                          border: "1px solid rgba(220,38,38,0.15)",
                          fontSize: "0.75rem",
                          color: "#dc2626",
                          fontWeight: 500,
                        }}>
                          {analysis.businessName} was not mentioned in this response
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DashboardCard>
            )}

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

            <div className="dashboard-grid">
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

              {/* CTA card — inverted dark element */}
              <DashboardCard
                title={topCompetitor ? `Is ${topCompetitor} winning on Claude and Gemini too?` : "Unlock full audit"}
                subtitle="Get the full picture across all 3 AI engines"
                accentColor="#ffffff"
                style={{ background: "#171717", border: "1px solid #171717" }}
              >
                <div style={{ display: "grid", gap: 14 }}>
                  <p style={{ margin: 0, fontSize: "0.84rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
                    {topCompetitor
                      ? `You've seen how ChatGPT favors ${topCompetitor}. The full audit reveals whether Claude and Gemini do the same — plus an 80-step action plan to fix it.`
                      : "40+ prompts across ChatGPT, Claude, and Gemini. Source influence mapping, accuracy checks, and a personalized 80-step action plan."
                    }
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {LLM_PROVIDERS.map((provider) => (
                      <span key={provider.id} className="analysis-provider-pill">
                        <ProviderLogo provider={provider.id} size={12} />
                        {provider.name}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={onUnlock}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-sans)",
                      borderRadius: 8,
                      border: "none",
                      background: "#ffffff",
                      color: "#171717",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    Unlock full audit — $99
                  </button>
                </div>
              </DashboardCard>
            </div>
          </div>
        )}

        {activeTab === "evidence" && (
          <DashboardCard noPadding>
            <QueryEvidence
              queries={chatgpt.queryResults}
              businessName={analysis.businessName}
            />
          </DashboardCard>
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
