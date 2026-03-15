"use client";

import { useState } from "react";
import type { Account, RecentSend } from "./outreach-section";

interface Props {
  stats: {
    totalContacts: number;
    totalSent: number;
    sentToday: number;
    sentThisWeek: number;
    activeCampaigns: number;
    totalBounced: number;
    totalUnsubscribed: number;
    accounts: Account[];
    recentSends: RecentSend[];
    totalFailed: number;
    totalBouncedSends: number;
    deliveryMetrics: {
      totalAttempted: number;
      bounceRate: number;
      failRate: number;
      deliveryRate: number;
    };
    activeCampaignDetails: {
      id: string;
      name: string;
      status: string;
      sentCount: number;
      failedCount: number;
      totalContacts: number;
      lastSendAt: string | null;
      listName: string;
    }[];
  };
  onRefresh: () => void;
}

const cellStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: "0.8rem",
  color: "#171717",
  borderBottom: "1px solid #f0f0f0",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 200,
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  fontWeight: 600,
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#8e8ea0",
  background: "#f7f7f8",
  borderBottom: "1px solid #e5e5e5",
};

function statusBadge(status: string) {
  const colors: Record<string, { bg: string; color: string }> = {
    sent: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
    active: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
    pending: { bg: "rgba(142,142,160,0.1)", color: "#8e8ea0" },
    failed: { bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
    bounced: { bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
    error: { bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
    paused: { bg: "rgba(217,119,6,0.1)", color: "#d97706" },
  };
  const c = colors[status] || colors.pending;
  return (
    <span style={{ fontSize: "0.7rem", fontWeight: 500, padding: "2px 8px", borderRadius: 999, background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function rateColor(rate: number, thresholds: { good: number; warn: number; invert?: boolean }) {
  if (thresholds.invert) {
    // Lower is better (bounce rate, fail rate)
    if (rate <= thresholds.good) return "#16a34a";
    if (rate <= thresholds.warn) return "#d97706";
    return "#dc2626";
  }
  // Higher is better (delivery rate)
  if (rate >= thresholds.good) return "#16a34a";
  if (rate >= thresholds.warn) return "#d97706";
  return "#dc2626";
}

export function DashboardView({ stats, onRefresh }: Props) {
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [previewSend, setPreviewSend] = useState<RecentSend | null>(null);

  const runCycle = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/outreach/send", { method: "POST" });
      const data = await res.json();
      if (data.skipped) {
        setSendResult("Cycle already running");
      } else {
        setSendResult(`Sent: ${data.sent}, Failed: ${data.failed}, Campaigns: ${data.campaignsProcessed}`);
      }
      onRefresh();
    } catch {
      setSendResult("Error running send cycle");
    }
    setSending(false);
  };

  const markBounced = async (email: string) => {
    if (!confirm(`Mark ${email} as bounced? They'll be excluded from all future campaigns.`)) return;
    try {
      await fetch("/api/webhooks/bounce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      onRefresh();
    } catch { /* ignore */ }
  };

  const dm = stats.deliveryMetrics;

  const deliveryCards = [
    {
      label: "Delivery Rate",
      value: `${(dm.deliveryRate * 100).toFixed(1)}%`,
      color: rateColor(dm.deliveryRate, { good: 0.95, warn: 0.85 }),
      sublabel: `${dm.totalAttempted} attempted (30d)`,
    },
    {
      label: "Bounce Rate",
      value: `${(dm.bounceRate * 100).toFixed(1)}%`,
      color: rateColor(dm.bounceRate, { good: 0.02, warn: 0.05, invert: true }),
      sublabel: `${stats.totalBouncedSends} bounced`,
    },
    {
      label: "Fail Rate",
      value: `${(dm.failRate * 100).toFixed(1)}%`,
      color: rateColor(dm.failRate, { good: 0.02, warn: 0.05, invert: true }),
      sublabel: `${stats.totalFailed} failed`,
    },
  ];

  const kpis = [
    { label: "Total Sent", value: stats.totalSent },
    { label: "Sent Today", value: stats.sentToday, accent: "#10a37f" },
    { label: "Sent This Week", value: stats.sentThisWeek, accent: "#4285f4" },
    { label: "Active Campaigns", value: stats.activeCampaigns, accent: "#d97706" },
    { label: "Bounced", value: stats.totalBounced, accent: stats.totalBounced > 0 ? "#dc2626" : undefined },
    { label: "Unsubscribed", value: stats.totalUnsubscribed, accent: stats.totalUnsubscribed > 0 ? "#dc2626" : undefined },
  ];

  return (
    <div>
      {/* Delivery Health Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
        {deliveryCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: "1.1rem 1.3rem",
              borderLeft: `3px solid ${card.color}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontSize: "0.68rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8e8ea0", marginBottom: 4 }}>
              {card.label}
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: card.color, marginBottom: 2 }}>
              {card.value}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#8e8ea0" }}>{card.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Activity KPIs Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: "0.85rem 1rem",
              borderLeft: kpi.accent ? `3px solid ${kpi.accent}` : undefined,
            }}
          >
            <div style={{ fontSize: "0.65rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8e8ea0", marginBottom: 2 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#171717" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Campaign Progress */}
      {stats.activeCampaignDetails.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", marginBottom: "0.75rem" }}>Campaign Progress</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {stats.activeCampaignDetails.map((campaign) => {
              const progress = campaign.totalContacts > 0 ? campaign.sentCount / campaign.totalContacts : 0;
              return (
                <div key={campaign.id} style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#171717" }}>{campaign.name}</span>
                      <span style={{ fontSize: "0.72rem", color: "#8e8ea0" }}>{campaign.listName}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {statusBadge(campaign.status)}
                      <span style={{ fontSize: "0.75rem", color: "#6e6e80", fontWeight: 500 }}>
                        {campaign.sentCount}/{campaign.totalContacts}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2 }}>
                    <div style={{
                      height: 4,
                      borderRadius: 2,
                      background: campaign.status === "active" ? "#16a34a" : "#d97706",
                      width: `${Math.min(progress * 100, 100)}%`,
                      transition: "width 0.3s",
                    }} />
                  </div>
                  {campaign.failedCount > 0 && (
                    <div style={{ fontSize: "0.68rem", color: "#dc2626", marginTop: 4 }}>
                      {campaign.failedCount} failed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Account Health + Run Cycle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", margin: 0 }}>Email Accounts</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {sendResult && <span style={{ fontSize: "0.75rem", color: "#6e6e80" }}>{sendResult}</span>}
          <button
            onClick={runCycle}
            disabled={sending}
            style={{
              padding: "6px 14px",
              fontSize: "0.8rem",
              fontWeight: 500,
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              background: "#171717",
              color: "#ffffff",
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending ? 0.6 : 1,
            }}
          >
            {sending ? "Running..." : "Run Send Cycle"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: "2rem" }}>
        {stats.accounts.map((account) => (
          <div key={account.id} style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem 1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#171717" }}>{account.label}</span>
              {statusBadge(account.status)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6e6e80", marginBottom: 8 }}>
              Day {account.warmupDay} &middot; {account.warmupPhase.replace("_", " ")}
            </div>
            {/* Warmup progress bar */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#8e8ea0", marginBottom: 2 }}>
                <span>Today</span>
                <span>{account.sentToday}/{account.dailyLimit}</span>
              </div>
              <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
                <div style={{
                  height: 6,
                  borderRadius: 3,
                  background: account.sentToday >= account.dailyLimit ? "#d97706" : "#16a34a",
                  width: `${Math.min((account.sentToday / Math.max(account.dailyLimit, 1)) * 100, 100)}%`,
                  transition: "width 0.3s",
                }} />
              </div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#8e8ea0" }}>
              Total sent: {account.totalSent}
              {account.consecutiveErrors > 0 && (
                <span style={{ color: "#dc2626", marginLeft: 8 }}>Errors: {account.consecutiveErrors}</span>
              )}
            </div>
          </div>
        ))}
        {stats.accounts.length === 0 && (
          <div style={{ color: "#8e8ea0", fontSize: "0.85rem", padding: "1rem 0" }}>
            No email accounts configured. Go to the Accounts tab to add one.
          </div>
        )}
      </div>

      {/* Recent Send Log */}
      <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", marginBottom: "0.75rem" }}>Recent Sends</h3>
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Recipient</th>
              <th style={headerCellStyle}>Business</th>
              <th style={headerCellStyle}>Template</th>
              <th style={headerCellStyle}>Account</th>
              <th style={headerCellStyle}>Status</th>
              <th style={headerCellStyle}>Sent</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentSends.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...cellStyle, textAlign: "center", color: "#8e8ea0", padding: "2rem" }}>
                  No sends yet
                </td>
              </tr>
            )}
            {stats.recentSends.map((send) => (
              <tr
                key={send.id}
                onClick={() => setPreviewSend(previewSend?.id === send.id ? null : send)}
                style={{ cursor: "pointer", background: previewSend?.id === send.id ? "#fafafa" : undefined }}
              >
                <td style={cellStyle}>{send.contactEmail}</td>
                <td style={cellStyle}>{send.contactBusiness}</td>
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{send.templateName}</td>
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{send.accountLabel}</td>
                <td style={cellStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {statusBadge(send.status)}
                    {(send.status === "failed" || send.status === "sent") && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markBounced(send.contactEmail); }}
                        style={{
                          padding: "1px 6px",
                          fontSize: "0.62rem",
                          fontWeight: 500,
                          borderRadius: 4,
                          border: "1px solid rgba(220,38,38,0.3)",
                          background: "transparent",
                          color: "#dc2626",
                          cursor: "pointer",
                          lineHeight: "1.4",
                        }}
                      >
                        Bounce
                      </button>
                    )}
                  </div>
                </td>
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{formatDate(send.sentAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Email Preview Modal */}
      {previewSend && (
        <div
          onClick={() => setPreviewSend(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#ffffff", borderRadius: 12, width: "100%", maxWidth: 700, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          >
            {/* Modal header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", marginBottom: 4 }}>
                    {previewSend.renderedSubject}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6e6e80" }}>
                    To: {previewSend.contactEmail} ({previewSend.contactBusiness})
                    &nbsp;&middot;&nbsp;Via: {previewSend.accountLabel}
                    &nbsp;&middot;&nbsp;{formatDate(previewSend.sentAt)}
                    &nbsp;&middot;&nbsp;{statusBadge(previewSend.status)}
                  </div>
                  {previewSend.errorMessage && (
                    <div style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: 4 }}>
                      Error: {previewSend.errorMessage}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setPreviewSend(null)}
                  style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#8e8ea0", cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>
            </div>
            {/* Email body */}
            <div style={{ flex: 1, overflow: "auto", padding: 0 }}>
              {previewSend.renderedHtml ? (
                <iframe
                  srcDoc={previewSend.renderedHtml}
                  style={{ width: "100%", height: "100%", minHeight: 400, border: "none" }}
                  sandbox="allow-same-origin"
                  title="Email preview"
                />
              ) : previewSend.renderedText ? (
                <div style={{ padding: 20, fontSize: "0.85rem", color: "#171717", whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "inherit" }}>
                  {previewSend.renderedText}
                </div>
              ) : (
                <div style={{ padding: 20, fontSize: "0.85rem", color: "#8e8ea0" }}>
                  No content available for this send.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
