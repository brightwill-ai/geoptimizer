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
        color: "rgba(255,255,255,0.38)",
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
          : "rgba(255,255,255,0.35)";

  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px solid ${accent}22`,
        background: `${accent}10`,
      }}
    >
      <div style={{ fontSize: "0.86rem", color: "#ffffff", fontWeight: 600, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.58)", lineHeight: 1.45 }}>
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
    <div className="analysis-sticky-cta">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {LLM_PROVIDERS.map((provider) => (
          <ProviderLogo key={provider.id} provider={provider.id} size={14} />
        ))}
      </div>
      <span style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.62)" }}>
        See how ChatGPT, Claude, and Gemini compare across 40+ prompts.
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
          color: "#0c0d10",
          cursor: "pointer",
        }}
      >
        Unlock full audit
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
            <DashboardCard span={2} accentColor={snapshot.visibility.color}>
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
                      color: "#ffffff",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    ChatGPT sees {analysis.businessName}, but not reliably enough yet.
                  </h2>
                  <p
                    style={{
                      margin: "14px 0 0",
                      maxWidth: 720,
                      fontSize: "0.95rem",
                      color: "rgba(255,255,255,0.62)",
                      lineHeight: 1.6,
                    }}
                  >
                    {snapshot.visibility.description} The clearest gap is in{" "}
                    <strong style={{ color: "#ffffff" }}>
                      {snapshot.weakestQueryType?.label ?? "discovery"}
                    </strong>{" "}
                    prompts, where AI still defaults to{" "}
                    <strong style={{ color: "#ffffff" }}>
                      {snapshot.topCompetitor ?? "other practices"}
                    </strong>
                    .
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                    <span className="analysis-meta-pill">Snapshot first</span>
                    <span className="analysis-meta-pill">Why it happened next</span>
                    <span className="analysis-meta-pill">Full audit adds cross-platform proof</span>
                  </div>
                </div>

                <div className="analysis-hero-score">
                  <ScoreRing score={probability} size={132} strokeWidth={10} />
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
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.62)",
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

              <DashboardCard title="Unlock full audit" subtitle="What you know now vs what comes next" accentColor="#ffffff">
                <div className="analysis-upgrade-grid">
                  <div className="analysis-mini-panel">
                    <span>What this free audit tells you</span>
                    <strong>Enough to understand the current problem</strong>
                    <small>
                      Visibility level, strongest and weakest prompt types, top competitor, and the evidence behind the result.
                    </small>
                  </div>
                  <div className="analysis-mini-panel">
                    <span>What the full audit adds</span>
                    <strong>Enough to decide what to fix first</strong>
                    <small>
                      40+ prompts across three AI engines, source overlap, accuracy issues, and a ranked action plan.
                    </small>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {LLM_PROVIDERS.map((provider) => (
                    <span key={provider.id} className="analysis-provider-pill">
                      <ProviderLogo provider={provider.id} size={12} />
                      {provider.name}
                    </span>
                  ))}
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
      </DashboardShell>
    </div>
  );
}
