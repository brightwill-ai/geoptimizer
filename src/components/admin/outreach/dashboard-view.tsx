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

export function DashboardView({ stats, onRefresh }: Props) {
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

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

  const kpis = [
    { label: "Total Contacts", value: stats.totalContacts },
    { label: "Sent Today", value: `${stats.sentToday}`, accent: "#10a37f" },
    { label: "Sent This Week", value: stats.sentThisWeek, accent: "#4285f4" },
    { label: "Active Campaigns", value: stats.activeCampaigns, accent: "#d97706" },
    { label: "Unsubscribed", value: stats.totalUnsubscribed, accent: "#dc2626" },
  ];

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: "1rem 1.2rem",
              borderLeft: kpi.accent ? `3px solid ${kpi.accent}` : undefined,
            }}
          >
            <div style={{ fontSize: "0.68rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8e8ea0", marginBottom: 4 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#171717" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

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
              <tr key={send.id}>
                <td style={cellStyle}>{send.contactEmail}</td>
                <td style={cellStyle}>{send.contactBusiness}</td>
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{send.templateName}</td>
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{send.accountLabel}</td>
                <td style={cellStyle}>{statusBadge(send.status)}</td>
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{formatDate(send.sentAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
