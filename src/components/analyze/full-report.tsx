"use client";

import { useState, useCallback } from "react";
import type { ActionPlan as ActionPlanType, GEOAnalysis, InformationAccuracy, LLMProvider } from "@/lib/mock-data";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { ScoreRing } from "./score-ring";
import { QueryEvidence } from "./query-evidence";
import { SourceInfluenceMap } from "./source-influence-map";
import { QueryTypeBreakdown } from "./query-type-breakdown";
import { CompetitorTable } from "./competitor-table";
import { ActionItems } from "./action-items";
import { ActionPlan } from "./action-plan";
import { DashboardShell } from "./dashboard-shell";
import { DashboardCard } from "./dashboard-card";
import { DashboardNav } from "./dashboard-nav";
import { SentimentBadge } from "./sentiment-badge";
import type { KPIItem } from "./kpi-row";
import { getActionPlanPreview, getAnalysisSnapshot, getReportSnapshot } from "@/lib/report-insights";

interface FullReportProps {
  analysis: GEOAnalysis;
  analysisId?: string;
  actionPlan?: ActionPlanType | null;
  actionPlanStatus?: string;
}

type DashboardTab = "overview" | "providers" | "sources" | "evidence" | "action-plan";

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

function InsightCard({
  title,
  detail,
  tone,
  badge,
}: {
  title: string;
  detail: string;
  tone: "positive" | "warning" | "negative" | "neutral";
  badge?: string;
}) {
  const accent =
    tone === "positive"
      ? "#16a34a"
      : tone === "warning"
        ? "#d97706"
        : tone === "negative"
          ? "#dc2626"
          : "#8e8ea0";

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: 14,
        border: `1px solid #e5e5e5`,
        borderTop: `2px solid ${accent}`,
        background: "#f7f7f8",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: "0.98rem", color: "#171717", fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
        {badge && (
          <span
            style={{
              whiteSpace: "nowrap",
              fontSize: "0.68rem",
              padding: "4px 8px",
              borderRadius: 999,
              background: `${accent}18`,
              color: accent,
              fontWeight: 600,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: "0.82rem", color: "#6e6e80", lineHeight: 1.5 }}>
        {detail}
      </div>
    </div>
  );
}

function AccuracyIssueList({ issues }: { issues: InformationAccuracy[] }) {
  if (issues.length === 0) {
    return (
      <div className="analysis-mini-panel">
        <span>Accuracy</span>
        <strong>No issues found</strong>
        <small>No incorrect, outdated, or missing fields were captured in the current analysis.</small>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {issues.slice(0, 5).map((issue) => (
        <div
          key={`${issue.field}-${issue.status}`}
          className="analysis-mini-panel"
          style={{ gap: 6 }}
        >
          <span>{issue.field}</span>
          <strong>{issue.status}</strong>
          <small>{issue.llmValue}</small>
        </div>
      ))}
    </div>
  );
}

export function FullReport({ analysis, analysisId, actionPlan, actionPlanStatus }: FullReportProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const availableProviders = LLM_PROVIDERS.filter((provider) => analysis.reports[provider.id]);

  const handleDownloadPDF = useCallback(async () => {
    setPdfLoading(true);
    try {
      const { generateReportPDF } = await import("@/lib/pdf");
      await generateReportPDF(analysis, actionPlan);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  }, [analysis, actionPlan]);
  const analysisSnapshot = getAnalysisSnapshot(analysis);
  const [dashTab, setDashTab] = useState<DashboardTab>("overview");
  const [providerTab, setProviderTab] = useState<LLMProvider>(availableProviders[0]?.id ?? "chatgpt");
  const [evidenceProvider, setEvidenceProvider] = useState<LLMProvider>(availableProviders[0]?.id ?? "chatgpt");
  const activeReport = analysis.reports[providerTab];
  const activeSnapshot = activeReport ? getReportSnapshot(activeReport) : null;
  const evidenceReport = analysis.reports[evidenceProvider];
  const actionPreview = getActionPlanPreview(actionPlan, 5);
  const totalMentions = Object.values(analysis.reports).reduce(
    (sum, report) => sum + report.recommendations.mentionCount,
    0
  );
  const totalQueries = Object.values(analysis.reports).reduce(
    (sum, report) => sum + report.recommendations.totalQueries,
    0
  );
  const visibilityRatio = `${totalMentions}/${totalQueries} prompts`;
  const activeVisibilityRatio = `${activeReport.recommendations.mentionCount}/${activeReport.recommendations.totalQueries} prompts`;

  const kpiItems: KPIItem[] = [
    {
      label: "Visibility",
      value: `${Math.round(analysisSnapshot.averageProbability * 100)}%`,
      sublabel: analysisSnapshot.visibility.label,
      detail: visibilityRatio,
      accentColor: analysisSnapshot.visibility.color,
      ring: { score: Math.round(analysisSnapshot.averageProbability * 100) },
    },
    {
      label: "Best provider",
      value: analysisSnapshot.bestProvider?.name ?? "N/A",
      sublabel: analysisSnapshot.bestProvider
        ? `${Math.round(analysisSnapshot.bestProvider.probability * 100)}% recommendation probability`
        : "No provider data",
    },
    {
      label: "Prompt coverage",
      value: visibilityRatio,
      sublabel: "Prompts that mentioned the business",
    },
    {
      label: "Accuracy issues",
      value: analysisSnapshot.accuracyIssues.length,
      sublabel: analysisSnapshot.accuracyIssues.length > 0 ? "Need verification" : "No factual issues found",
    },
  ];

  const headerMeta = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <span className="analysis-meta-pill">Complete report</span>
      <span className="analysis-meta-pill">{analysis.methodology.totalQueries} total queries</span>
      <span className="analysis-meta-pill">{analysis.methodology.providers.length} AI providers</span>
      <span className="analysis-meta-pill">{analysis.methodology.queryTypes.length} query types</span>
    </div>
  );

  const headerRight = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {availableProviders.map((provider) => (
        <span key={provider.id} className="analysis-provider-pill">
          <ProviderLogo provider={provider.id} size={12} />
          {provider.name}
        </span>
      ))}
    </div>
  );

  return (
    <DashboardShell
      businessName={analysis.businessName}
      subtitle="Cross-provider GEO report with comparative visibility, source influence, evidence, and action planning."
      headerLeft={
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {availableProviders.map((provider) => (
            <ProviderLogo key={provider.id} provider={provider.id} size={16} />
          ))}
        </div>
      }
      headerMeta={headerMeta}
      headerRight={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {headerRight}
          <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 8,
            background: "#f7f7f8",
            border: "1px solid #e5e5e5",
            color: pdfLoading ? "#8e8ea0" : "#6e6e80",
            fontSize: "0.78rem",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            cursor: pdfLoading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            if (!pdfLoading) {
              e.currentTarget.style.background = "#e5e5e5";
              e.currentTarget.style.borderColor = "#d0d0d0";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#f7f7f8";
            e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {pdfLoading ? "Generating..." : "Download PDF"}
        </button>
        </div>
      }
      kpiItems={kpiItems}
      layout="sidebar"
      tabIcons={{
        overview: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
        providers: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
        sources: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
        evidence: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
        "action-plan": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>,
      }}
      tabs={[
        { id: "overview", label: "Overview" },
        { id: "providers", label: "Providers" },
        { id: "sources", label: "Sources" },
        { id: "evidence", label: "Evidence" },
        { id: "action-plan", label: "Action Plan" },
      ]}
      activeTab={dashTab}
      onTabChange={(id) => setDashTab(id as DashboardTab)}
      navLayoutId="full-report-tab"
      stickyMode="compact"
    >
      <div>
      {dashTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          <DashboardCard span={2} accentColor={analysisSnapshot.visibility.color}>
            <div className="analysis-hero-grid">
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: analysisSnapshot.visibility.background,
                    color: analysisSnapshot.visibility.color,
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    marginBottom: 14,
                  }}
                >
                  {analysisSnapshot.visibility.label} visibility
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.65rem, 3vw, 2.5rem)",
                    lineHeight: 1.04,
                    color: "#171717",
                    letterSpacing: "-0.04em",
                    maxWidth: 880,
                  }}
                >
                  {analysis.businessName} is competitive, but not yet a dependable AI recommendation.
                </h2>
                <p
                  style={{
                    margin: "14px 0 0",
                    maxWidth: 760,
                    fontSize: "0.95rem",
                    color: "#6e6e80",
                    lineHeight: 1.6,
                  }}
                >
                  {analysisSnapshot.bestProvider?.name ?? "Your strongest provider"} proves there is already a path to visibility,
                  but weaker source coverage, factual inconsistency, and underperforming query types are still limiting how
                  often the business becomes the default recommendation.
                </p>
                <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                  {analysisSnapshot.wins.map((win) => (
                    <div
                      key={win.title}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "#f7f7f8",
                        border: "1px solid #e5e5e5",
                      }}
                    >
                      <div style={{ color: "#171717", fontWeight: 600, marginBottom: 4 }}>{win.title}</div>
                      <div style={{ color: "#6e6e80", fontSize: "0.8rem", lineHeight: 1.45 }}>
                        {win.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analysis-hero-score">
                <div>
                  <ScoreRing score={Math.round(analysisSnapshot.averageProbability * 100)} size={136} strokeWidth={10} />
                </div>
                <div style={{ display: "grid", gap: 10, width: "100%" }}>
                  <div className="analysis-mini-stat">
                    <span>Best provider</span>
                    <strong>{analysisSnapshot.bestProvider?.name ?? "N/A"}</strong>
                  </div>
                  <div className="analysis-mini-stat">
                    <span>Prompt coverage</span>
                    <strong>{visibilityRatio}</strong>
                  </div>
                  <div className="analysis-mini-stat">
                    <span>Top source</span>
                    <strong>{analysisSnapshot.topSource?.source ?? "No source data"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          <div>
            <SectionLabel>Priority Findings</SectionLabel>
            <div className="dashboard-grid-insights">
              <InsightCard
                title={analysisSnapshot.findings[0]?.title ?? "Visibility is uneven across providers"}
                detail={analysisSnapshot.findings[0]?.detail ?? "The business performs noticeably better on one provider than the others."}
                tone={analysisSnapshot.findings[0]?.tone ?? "warning"}
                badge="Biggest blocker"
              />
              <InsightCard
                title={analysisSnapshot.topSourceGap ?? "Source coverage needs to be strengthened"}
                detail="Cross-provider citations are not balanced enough yet, which makes the recommendation probability fragile."
                tone="warning"
                badge="Source gap"
              />
              <InsightCard
                title={analysisSnapshot.bestProvider ? `${analysisSnapshot.bestProvider.name} is the clearest proof point` : "A clear proof point exists"}
                detail={analysisSnapshot.wins[0]?.detail ?? "At least one provider already sees enough value to recommend the business at a competitive rate."}
                tone="positive"
                badge="Best signal"
              />
            </div>
          </div>

          <div>
            <SectionLabel>Provider Comparison</SectionLabel>
            <div className="dashboard-grid-insights">
              {analysisSnapshot.providerSnapshots.map((provider) => (
                <DashboardCard
                  key={provider.id}
                  title={provider.name}
                  icon={<ProviderLogo provider={provider.id} size={14} />}
                  accentColor={provider.color}
                >
                  <div style={{ display: "grid", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: "1.55rem", fontWeight: 700, color: "#171717", lineHeight: 1 }}>
                          {Math.round(provider.probability * 100)}%
                        </div>
                        <div style={{ marginTop: 6, fontSize: "0.76rem", color: "#8e8ea0" }}>
                          recommendation probability
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: `${provider.color}18`,
                          border: `1px solid ${provider.color}30`,
                          color: provider.color,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {provider.mentionCount}/{provider.totalQueries} prompts
                      </div>
                    </div>
                    <div className="analysis-mini-grid">
                      <div className="analysis-mini-panel">
                        <span>Prompt coverage</span>
                        <strong>{provider.mentionCount}/{provider.totalQueries}</strong>
                        <small>prompts that mentioned the business</small>
                      </div>
                      <div className="analysis-mini-panel">
                        <span>Top competitor</span>
                        <strong>{provider.topCompetitor ?? "None"}</strong>
                        <small>current default winner on this provider</small>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Competitor And Query Patterns</SectionLabel>
            <div className="dashboard-grid">
              <DashboardCard title="Who wins today" subtitle="Competitive pressure across providers">
                <CompetitorTable competitors={analysis.reports.chatgpt?.competitors ?? activeReport.competitors} />
              </DashboardCard>
              <DashboardCard title="Where the business appears" subtitle="How prompt intent changes visibility">
                <div style={{ display: "grid", gap: 14 }}>
                  <div className="analysis-mini-grid">
                    <div className="analysis-mini-panel">
                      <span>Strongest query type</span>
                      <strong>{analysisSnapshot.strongestQueryType?.label ?? "N/A"}</strong>
                      <small>
                        {analysisSnapshot.strongestQueryType
                          ? `${Math.round(analysisSnapshot.strongestQueryType.mentionRate * 100)}% mention rate`
                          : "No query data"}
                      </small>
                    </div>
                    <div className="analysis-mini-panel">
                      <span>Weakest query type</span>
                      <strong>{analysisSnapshot.weakestQueryType?.label ?? "N/A"}</strong>
                      <small>
                        {analysisSnapshot.weakestQueryType
                          ? `${Math.round(analysisSnapshot.weakestQueryType.mentionRate * 100)}% mention rate`
                          : "No query data"}
                      </small>
                    </div>
                  </div>
                  <QueryTypeBreakdown
                    queryResults={Object.values(analysis.reports).flatMap((report) => report.queryResults)}
                    businessName={analysis.businessName}
                  />
                </div>
              </DashboardCard>
            </div>
          </div>

          <div>
            <SectionLabel>Sources And Accuracy</SectionLabel>
            <div className="dashboard-grid">
              <DashboardCard title="Source influence" subtitle="What AI trusts most today">
                {analysis.sourceInfluences.length > 0 ? (
                  <SourceInfluenceMap sourceInfluences={analysis.sourceInfluences} />
                ) : (
                  <div className="analysis-mini-panel">
                    <span>Source influence</span>
                    <strong>No source data</strong>
                    <small>The current analysis did not capture citation source details.</small>
                  </div>
                )}
              </DashboardCard>
              <DashboardCard title="Accuracy issues" subtitle="Facts that still reduce trust">
                <AccuracyIssueList issues={analysisSnapshot.accuracyIssues} />
              </DashboardCard>
            </div>
          </div>

          <div>
            <SectionLabel>Action Preview</SectionLabel>
            <DashboardCard title="Top priorities" subtitle="The first fixes to tackle">
              {actionPreview.length > 0 ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {actionPreview.map((item) => (
                    <div
                      key={item.id}
                      className="analysis-mini-panel"
                      style={{ gap: 6 }}
                    >
                      <span>{item.priority}</span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="analysis-mini-panel">
                  <span>Action plan</span>
                  <strong>
                    {actionPlanStatus === "generating"
                      ? "Action plan is still generating"
                      : "Open the action plan tab for the full checklist"}
                  </strong>
                  <small>
                    The overview intentionally shows only the priorities. Detailed execution stays in the action-plan section.
                  </small>
                </div>
              )}
            </DashboardCard>
          </div>

          <DashboardCard title="Methodology" subtitle="How to read this report">
            <div className="analysis-mini-grid">
              <div className="analysis-mini-panel">
                <span>Total queries</span>
                <strong>{analysis.methodology.totalQueries}</strong>
                <small>Real prompts executed across providers</small>
              </div>
              <div className="analysis-mini-panel">
                <span>Providers</span>
                <strong>{analysis.methodology.providers.length}</strong>
                <small>{analysis.methodology.providers.join(", ")}</small>
              </div>
              <div className="analysis-mini-panel">
                <span>Query types</span>
                <strong>{analysis.methodology.queryTypes.length}</strong>
                <small>{analysis.methodology.queryTypes.join(", ")}</small>
              </div>
            </div>
            <p style={{ marginTop: 14, color: "#8e8ea0", fontSize: "0.78rem", lineHeight: 1.55 }}>
              {analysis.methodology.disclaimer}
            </p>
          </DashboardCard>
        </div>
      )}

      {dashTab === "providers" && activeReport && activeSnapshot && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ marginBottom: 4 }}>
            <DashboardNav
              tabs={availableProviders.map((provider) => ({ id: provider.id, label: provider.name, color: provider.color }))}
              activeTab={providerTab}
              onTabChange={(id) => setProviderTab(id as LLMProvider)}
              layoutId="provider-deep-dive"
            />
          </div>

          <DashboardCard accentColor={activeReport.provider.color}>
            <div className="analysis-hero-grid">
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: activeSnapshot.visibility.background,
                    color: activeSnapshot.visibility.color,
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    marginBottom: 14,
                  }}
                >
                  {activeReport.provider.name}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.45rem, 2.8vw, 2.1rem)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.04em",
                    color: "#171717",
                  }}
                >
                  {activeReport.provider.name} is {activeSnapshot.visibility.label.toLowerCase()} on this business.
                </h2>
                <p
                  style={{
                    margin: "14px 0 0",
                    color: "#6e6e80",
                    fontSize: "0.92rem",
                    lineHeight: 1.6,
                    maxWidth: 720,
                  }}
                >
                  {activeReport.provider.name} mentioned {analysis.businessName} in {activeReport.recommendations.mentionCount} of{" "}
                  {activeReport.recommendations.totalQueries} prompts. The main pressure point is{" "}
                  {activeSnapshot.weakestQueryType?.label ?? "its weakest query cluster"} where visibility still drops too often.
                </p>
              </div>

              <div className="analysis-hero-score">
                <div>
                  <ScoreRing score={Math.round(activeReport.recommendations.recommendationProbability * 100)} size={126} strokeWidth={9} />
                </div>
                <div style={{ display: "grid", gap: 10, width: "100%" }}>
                  <div className="analysis-mini-stat">
                    <span>Prompt coverage</span>
                    <strong>{activeVisibilityRatio}</strong>
                  </div>
                  <div className="analysis-mini-stat">
                    <span>Sentiment</span>
                    <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <SentimentBadge sentiment={activeSnapshot.sentimentLabel} size="md" />
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          <div className="dashboard-grid">
            <DashboardCard title="Top blockers" accentColor="#d97706">
              <div style={{ display: "grid", gap: 10 }}>
                {activeSnapshot.blockers.map((blocker) => (
                  <InsightCard
                    key={blocker.title}
                    title={blocker.title}
                    detail={blocker.detail}
                    tone={blocker.tone}
                  />
                ))}
              </div>
            </DashboardCard>
            <DashboardCard title="Current strengths" accentColor="#16a34a">
              <div style={{ display: "grid", gap: 10 }}>
                {activeSnapshot.wins.map((win) => (
                  <InsightCard
                    key={win.title}
                    title={win.title}
                    detail={win.detail}
                    tone={win.tone}
                  />
                ))}
              </div>
            </DashboardCard>
          </div>

          <div className="dashboard-grid">
            <DashboardCard title="Query pattern">
              <QueryTypeBreakdown
                queryResults={activeReport.queryResults}
                businessName={analysis.businessName}
              />
            </DashboardCard>
            <DashboardCard title="Competitor ranking">
              <CompetitorTable competitors={activeReport.competitors} />
            </DashboardCard>
          </div>

          <div className="dashboard-grid">
            <DashboardCard title={`${activeReport.provider.name} sources`}>
              {(activeReport.sources?.length ?? 0) > 0 ? (
                <SourceInfluenceMap sources={activeReport.sources} providerName={activeReport.provider.name} />
              ) : (
                <div className="analysis-mini-panel">
                  <span>Sources</span>
                  <strong>No source data</strong>
                  <small>This provider did not return source attribution in the current result set.</small>
                </div>
              )}
            </DashboardCard>
            <DashboardCard title="Accuracy and language">
              <div style={{ display: "grid", gap: 14 }}>
                <AccuracyIssueList issues={activeSnapshot.accuracyIssues} />
                {activeSnapshot.sampleQuote && (
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
                    {activeSnapshot.sampleQuote}
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      {dashTab === "sources" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <DashboardCard title="Cross-provider source influence" subtitle="Which sources are shaping AI recommendations the most">
            {analysis.sourceInfluences.length > 0 ? (
              <SourceInfluenceMap sourceInfluences={analysis.sourceInfluences} />
            ) : (
              <div className="analysis-mini-panel">
                <span>Source influence</span>
                <strong>No source data</strong>
                <small>The current analysis did not capture source overlap details.</small>
              </div>
            )}
          </DashboardCard>

          <div className="dashboard-grid-insights">
            {availableProviders.map((provider) => {
              const report = analysis.reports[provider.id];
              return (
                <DashboardCard
                  key={provider.id}
                  title={`${provider.name} sources`}
                  icon={<ProviderLogo provider={provider.id} size={14} />}
                  accentColor={provider.color}
                >
                  {(report.sources?.length ?? 0) > 0 ? (
                    <SourceInfluenceMap sources={report.sources} providerName={provider.name} />
                  ) : (
                    <div className="analysis-mini-panel">
                      <span>{provider.name}</span>
                      <strong>No source data</strong>
                      <small>This provider did not expose source attribution in the current result set.</small>
                    </div>
                  )}
                </DashboardCard>
              );
            })}
          </div>
        </div>
      )}

      {dashTab === "evidence" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <DashboardNav
            tabs={availableProviders.map((provider) => ({
              id: provider.id,
              label: provider.name,
              count: analysis.reports[provider.id]?.queryResults.length,
              color: provider.color,
            }))}
            activeTab={evidenceProvider}
            onTabChange={(id) => setEvidenceProvider(id as LLMProvider)}
            layoutId="evidence-provider"
          />

          {evidenceReport?.queryResults.length > 0 ? (
            <DashboardCard noPadding>
              <QueryEvidence
                queries={evidenceReport.queryResults}
                businessName={analysis.businessName}
              />
            </DashboardCard>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#8e8ea0",
                fontSize: "0.85rem",
              }}
            >
              No evidence available for this provider.
            </div>
          )}
        </div>
      )}

      {dashTab === "action-plan" && (
        <div>
          {analysisId ? (
            <ActionPlan
              analysisId={analysisId}
              initialActionPlan={actionPlan}
              actionPlanStatus={actionPlanStatus}
            />
          ) : (
            <ActionItems analysis={analysis} businessName={analysis.businessName} />
          )}
        </div>
      )}
    </div>
    {/* Support footer */}
    <div style={{ textAlign: "center", padding: "2rem 0 1rem", fontSize: "0.75rem", color: "#8e8ea0" }}>
      Need help? Reach us at{" "}
      <a href="mailto:support@brightwill.ai" style={{ color: "#4285f4", textDecoration: "none" }}>
        support@brightwill.ai
      </a>
    </div>
    </DashboardShell>
  );
}
