"use client";

import { useState } from "react";

interface WarmupAccountStats {
  id: string;
  label: string;
  fromEmail: string;
  fromName: string;
  accountType: string;
  warmupPoolDay: number;
  warmupDailyTarget: number;
  warmupSentToday: number;
  warmupReplyRate: number;
  warmupOpenRate: number;
  warmupSpamRescueRate: number;
  warmupImportantRate: number;
  imapStatus: string;
  imapHost: string | null;
  imapLastError: string | null;
  status: string;
  todayStats: {
    sent: number;
    received: number;
    opens: number;
    replies: number;
    spamRescues: number;
    markedImportant: number;
  };
}

interface WarmupActivity {
  id: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  turnNumber: number;
  sentAt: string | null;
  opened: boolean;
  replied: boolean;
  spamRescued: boolean;
  markedImportant: boolean;
  status: string;
}

export interface WarmupStats {
  poolSize: number;
  totalConversations: number;
  activeConversations: number;
  emailsSentToday: number;
  emailsReceivedToday: number;
  opensToday: number;
  repliesToday: number;
  spamRescuesToday: number;
  markedImportantToday: number;
  accountStats: WarmupAccountStats[];
  recentActivity: WarmupActivity[];
  dailyChart: { date: string; sent: number; received: number; opens: number; replies: number; spamRescues: number }[];
}

interface Props {
  stats: WarmupStats;
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

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function typeBadge(type: string) {
  const isWarmupOnly = type === "warmup_only";
  return (
    <span style={{
      fontSize: "0.65rem", fontWeight: 500, padding: "2px 8px", borderRadius: 999,
      background: isWarmupOnly ? "rgba(192,132,252,0.12)" : "rgba(22,163,74,0.1)",
      color: isWarmupOnly ? "#c084fc" : "#16a34a",
    }}>
      {isWarmupOnly ? "warmup only" : "outreach"}
    </span>
  );
}

function imapDot(status: string) {
  const colors: Record<string, string> = { connected: "#16a34a", error: "#dc2626", unknown: "#8e8ea0" };
  const color = colors[status] || colors.unknown;
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: color, marginRight: 6, verticalAlign: "middle",
    }} />
  );
}

function actionBadge(action: string) {
  const colors: Record<string, { bg: string; color: string }> = {
    sent: { bg: "rgba(142,142,160,0.1)", color: "#8e8ea0" },
    opened: { bg: "rgba(66,133,244,0.1)", color: "#4285f4" },
    replied: { bg: "rgba(192,132,252,0.12)", color: "#c084fc" },
    spam_rescued: { bg: "rgba(217,119,6,0.1)", color: "#d97706" },
    important: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
  };
  const c = colors[action] || colors.sent;
  return (
    <span style={{ fontSize: "0.65rem", fontWeight: 500, padding: "2px 8px", borderRadius: 999, background: c.bg, color: c.color }}>
      {action.replace("_", " ")}
    </span>
  );
}

export function WarmupView({ stats, onRefresh }: Props) {
  const [running, setRunning] = useState(false);
  const [cycleResult, setCycleResult] = useState<string | null>(null);
  const [configAccountId, setConfigAccountId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testingImap, setTestingImap] = useState<string | null>(null);
  const [imapTestResult, setImapTestResult] = useState<{ id: string; msg: string } | null>(null);
  const [previewActivity, setPreviewActivity] = useState<WarmupActivity | null>(null);

  // Config form state
  const [configForm, setConfigForm] = useState({
    imapHost: "", imapPort: "993", imapUser: "", imapPass: "", imapSecure: true,
    warmupPoolEnabled: true, warmupReplyRate: "30", warmupOpenRate: "100",
    warmupSpamRescueRate: "100", warmupImportantRate: "50",
  });

  const runWarmupCycle = async () => {
    setRunning(true);
    setCycleResult(null);
    try {
      const res = await fetch("/api/admin/outreach/warmup/cycle", { method: "POST" });
      const data = await res.json();
      if (data.skipped) {
        setCycleResult(data.skipReason || "Cycle skipped");
      } else {
        setCycleResult(`Sent: ${data.emailsSent}, Opened: ${data.emailsOpened}, Spam rescued: ${data.spamRescues}`);
      }
      onRefresh();
    } catch {
      setCycleResult("Error running warmup cycle");
    }
    setRunning(false);
  };

  const openConfig = (account: WarmupAccountStats) => {
    if (configAccountId === account.id) {
      setConfigAccountId(null);
      return;
    }
    setConfigAccountId(account.id);
    setConfigForm({
      imapHost: account.imapHost || "",
      imapPort: "993",
      imapUser: "",
      imapPass: "",
      imapSecure: true,
      warmupPoolEnabled: true,
      warmupReplyRate: String(account.warmupReplyRate),
      warmupOpenRate: String(account.warmupOpenRate),
      warmupSpamRescueRate: String(account.warmupSpamRescueRate),
      warmupImportantRate: String(account.warmupImportantRate),
    });
  };

  const saveConfig = async (accountId: string) => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        warmupPoolEnabled: configForm.warmupPoolEnabled,
        warmupReplyRate: parseInt(configForm.warmupReplyRate) || 30,
        warmupOpenRate: parseInt(configForm.warmupOpenRate) || 100,
        warmupSpamRescueRate: parseInt(configForm.warmupSpamRescueRate) || 100,
        warmupImportantRate: parseInt(configForm.warmupImportantRate) || 50,
      };
      if (configForm.imapHost) body.imapHost = configForm.imapHost;
      if (configForm.imapPort) body.imapPort = parseInt(configForm.imapPort) || 993;
      if (configForm.imapUser) body.imapUser = configForm.imapUser;
      if (configForm.imapPass) body.imapPass = configForm.imapPass;
      body.imapSecure = configForm.imapSecure;

      await fetch(`/api/admin/outreach/warmup/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setConfigAccountId(null);
      onRefresh();
    } catch {
      // silent
    }
    setSaving(false);
  };

  const testImap = async (accountId: string) => {
    setTestingImap(accountId);
    setImapTestResult(null);
    try {
      const res = await fetch(`/api/admin/outreach/warmup/accounts/${accountId}/test-imap`, { method: "POST" });
      const data = await res.json();
      setImapTestResult({ id: accountId, msg: data.success ? "IMAP connected successfully" : `Error: ${data.error}` });
      onRefresh();
    } catch {
      setImapTestResult({ id: accountId, msg: "Failed to test IMAP" });
    }
    setTestingImap(null);
  };

  const kpis = [
    { label: "Pool Size", value: stats.poolSize },
    { label: "Sent Today", value: stats.emailsSentToday, accent: "#10a37f" },
    { label: "Opens Today", value: stats.opensToday, accent: "#4285f4" },
    { label: "Replies Today", value: stats.repliesToday, accent: "#c084fc" },
    { label: "Spam Rescues", value: stats.spamRescuesToday, accent: "#d97706" },
  ];

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12,
              padding: "1rem 1.2rem", borderLeft: kpi.accent ? `3px solid ${kpi.accent}` : undefined,
            }}
          >
            <div style={{ fontSize: "0.68rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8e8ea0", marginBottom: 4 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#171717" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Pool Accounts Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", margin: 0 }}>Warmup Pool</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {cycleResult && <span style={{ fontSize: "0.75rem", color: "#6e6e80" }}>{cycleResult}</span>}
          <button
            onClick={runWarmupCycle}
            disabled={running}
            style={{
              padding: "6px 14px", fontSize: "0.8rem", fontWeight: 500, borderRadius: 8,
              border: "1px solid #e5e5e5", background: "#171717", color: "#ffffff",
              cursor: running ? "not-allowed" : "pointer", opacity: running ? 0.6 : 1,
            }}
          >
            {running ? "Running..." : "Run Warmup Cycle"}
          </button>
        </div>
      </div>

      {/* Pool Account Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12, marginBottom: "2rem" }}>
        {stats.accountStats.map((account) => (
          <div key={account.id} style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem 1.2rem" }}>
            {/* Header: email + badges */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {imapDot(account.imapStatus)}
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#171717" }}>{account.fromEmail}</span>
              </div>
              {typeBadge(account.accountType)}
            </div>

            {/* Pool day + target */}
            <div style={{ fontSize: "0.75rem", color: "#6e6e80", marginBottom: 8 }}>
              Pool Day {account.warmupPoolDay} &middot; Target: {account.warmupDailyTarget}/day
            </div>

            {/* Warmup progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#8e8ea0", marginBottom: 2 }}>
                <span>Warmup Sent</span>
                <span>{account.warmupSentToday}/{account.warmupDailyTarget}</span>
              </div>
              <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
                <div style={{
                  height: 6, borderRadius: 3,
                  background: account.warmupSentToday >= account.warmupDailyTarget ? "#d97706" : "#16a34a",
                  width: `${Math.min((account.warmupSentToday / Math.max(account.warmupDailyTarget, 1)) * 100, 100)}%`,
                  transition: "width 0.3s",
                }} />
              </div>
            </div>

            {/* Mini stats */}
            <div style={{ display: "flex", gap: 12, fontSize: "0.7rem", color: "#8e8ea0", marginBottom: 8 }}>
              <span>Opens: {account.todayStats.opens}</span>
              <span>Replies: {account.todayStats.replies}</span>
              <span>Rescues: {account.todayStats.spamRescues}</span>
            </div>

            {/* IMAP error */}
            {account.imapLastError && (
              <div style={{ fontSize: "0.7rem", color: "#dc2626", marginBottom: 8 }}>
                IMAP: {account.imapLastError}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => openConfig(account)}
                style={{
                  padding: "4px 12px", fontSize: "0.75rem", fontWeight: 500, borderRadius: 6,
                  border: "1px solid #e5e5e5", background: configAccountId === account.id ? "#f7f7f8" : "#ffffff",
                  color: "#171717", cursor: "pointer",
                }}
              >
                {configAccountId === account.id ? "Close" : "Configure"}
              </button>
              {account.imapHost && (
                <button
                  onClick={() => testImap(account.id)}
                  disabled={testingImap === account.id}
                  style={{
                    padding: "4px 12px", fontSize: "0.75rem", fontWeight: 500, borderRadius: 6,
                    border: "1px solid #e5e5e5", background: "#ffffff", color: "#4285f4", cursor: "pointer",
                    opacity: testingImap === account.id ? 0.6 : 1,
                  }}
                >
                  {testingImap === account.id ? "Testing..." : "Test IMAP"}
                </button>
              )}
            </div>

            {/* IMAP test result */}
            {imapTestResult?.id === account.id && (
              <div style={{ fontSize: "0.7rem", marginTop: 6, color: imapTestResult.msg.startsWith("Error") ? "#dc2626" : "#16a34a" }}>
                {imapTestResult.msg}
              </div>
            )}

            {/* Configure panel */}
            {configAccountId === account.id && (
              <div style={{ marginTop: 12, padding: 12, background: "#f7f7f8", borderRadius: 8 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#171717", marginBottom: 8 }}>IMAP Settings</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#8e8ea0", display: "block", marginBottom: 2 }}>IMAP Host</label>
                    <input
                      value={configForm.imapHost}
                      onChange={(e) => setConfigForm({ ...configForm, imapHost: e.target.value })}
                      placeholder="imap.gmail.com"
                      style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", border: "1px solid #e5e5e5", borderRadius: 6, background: "#ffffff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#8e8ea0", display: "block", marginBottom: 2 }}>Port</label>
                    <input
                      value={configForm.imapPort}
                      onChange={(e) => setConfigForm({ ...configForm, imapPort: e.target.value })}
                      placeholder="993"
                      style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", border: "1px solid #e5e5e5", borderRadius: 6, background: "#ffffff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#8e8ea0", display: "block", marginBottom: 2 }}>IMAP User</label>
                    <input
                      value={configForm.imapUser}
                      onChange={(e) => setConfigForm({ ...configForm, imapUser: e.target.value })}
                      placeholder="user@gmail.com"
                      style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", border: "1px solid #e5e5e5", borderRadius: 6, background: "#ffffff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#8e8ea0", display: "block", marginBottom: 2 }}>IMAP Password</label>
                    <input
                      type="password"
                      value={configForm.imapPass}
                      onChange={(e) => setConfigForm({ ...configForm, imapPass: e.target.value })}
                      placeholder="app password"
                      style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", border: "1px solid #e5e5e5", borderRadius: 6, background: "#ffffff" }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#171717", marginBottom: 8 }}>Warmup Rates (%)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#8e8ea0", display: "block", marginBottom: 2 }}>Open Rate</label>
                    <input
                      value={configForm.warmupOpenRate}
                      onChange={(e) => setConfigForm({ ...configForm, warmupOpenRate: e.target.value })}
                      style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", border: "1px solid #e5e5e5", borderRadius: 6, background: "#ffffff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#8e8ea0", display: "block", marginBottom: 2 }}>Reply Rate</label>
                    <input
                      value={configForm.warmupReplyRate}
                      onChange={(e) => setConfigForm({ ...configForm, warmupReplyRate: e.target.value })}
                      style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", border: "1px solid #e5e5e5", borderRadius: 6, background: "#ffffff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#8e8ea0", display: "block", marginBottom: 2 }}>Spam Rescue</label>
                    <input
                      value={configForm.warmupSpamRescueRate}
                      onChange={(e) => setConfigForm({ ...configForm, warmupSpamRescueRate: e.target.value })}
                      style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", border: "1px solid #e5e5e5", borderRadius: 6, background: "#ffffff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.68rem", color: "#8e8ea0", display: "block", marginBottom: 2 }}>Mark Important</label>
                    <input
                      value={configForm.warmupImportantRate}
                      onChange={(e) => setConfigForm({ ...configForm, warmupImportantRate: e.target.value })}
                      style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", border: "1px solid #e5e5e5", borderRadius: 6, background: "#ffffff" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label style={{ fontSize: "0.75rem", color: "#171717", display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={configForm.warmupPoolEnabled}
                      onChange={(e) => setConfigForm({ ...configForm, warmupPoolEnabled: e.target.checked })}
                    />
                    Pool Enabled
                  </label>
                  <label style={{ fontSize: "0.75rem", color: "#171717", display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={configForm.imapSecure}
                      onChange={(e) => setConfigForm({ ...configForm, imapSecure: e.target.checked })}
                    />
                    IMAP SSL
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button
                    onClick={() => saveConfig(account.id)}
                    disabled={saving}
                    style={{
                      padding: "6px 16px", fontSize: "0.8rem", fontWeight: 500, borderRadius: 6,
                      border: "none", background: "#171717", color: "#ffffff", cursor: "pointer",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {stats.accountStats.length === 0 && (
          <div style={{ color: "#8e8ea0", fontSize: "0.85rem", padding: "1rem 0" }}>
            No accounts in the warmup pool. Go to the Accounts tab to add email accounts, then enable warmup pool here.
          </div>
        )}
      </div>

      {/* 7-Day Chart */}
      {stats.dailyChart.length > 0 && (
        <>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", marginBottom: "0.75rem" }}>7-Day Activity</h3>
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 100 }}>
              {stats.dailyChart.map((day) => {
                const maxVal = Math.max(...stats.dailyChart.map((d) => d.sent + d.opens + d.spamRescues), 1);
                const total = day.sent + day.opens + day.spamRescues;
                const height = Math.max((total / maxVal) * 80, 4);
                return (
                  <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "60%", height, background: "#10a37f", borderRadius: 3, transition: "height 0.3s" }} />
                    </div>
                    <span style={{ fontSize: "0.6rem", color: "#8e8ea0" }}>
                      {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12, fontSize: "0.7rem", color: "#8e8ea0" }}>
              <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#10a37f", marginRight: 4 }} />Sent + Opens + Rescues</span>
            </div>
          </div>
        </>
      )}

      {/* Recent Activity Log */}
      <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", marginBottom: "0.75rem" }}>Recent Activity</h3>
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Time</th>
              <th style={headerCellStyle}>Actions</th>
              <th style={headerCellStyle}>From</th>
              <th style={headerCellStyle}>To</th>
              <th style={headerCellStyle}>Subject</th>
              <th style={headerCellStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentActivity.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...cellStyle, textAlign: "center", color: "#8e8ea0", padding: "2rem" }}>
                  No warmup activity yet. Add at least 2 accounts to the pool to start.
                </td>
              </tr>
            )}
            {stats.recentActivity.map((activity) => (
              <tr
                key={activity.id}
                onClick={() => setPreviewActivity(previewActivity?.id === activity.id ? null : activity)}
                style={{ cursor: "pointer", background: previewActivity?.id === activity.id ? "#fafafa" : undefined }}
              >
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{formatDate(activity.sentAt)}</td>
                <td style={cellStyle}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {actionBadge("sent")}
                    {activity.opened && actionBadge("opened")}
                    {activity.spamRescued && actionBadge("spam_rescued")}
                    {activity.markedImportant && actionBadge("important")}
                    {activity.replied && actionBadge("replied")}
                  </div>
                </td>
                <td style={{ ...cellStyle, fontSize: "0.75rem" }}>{activity.fromEmail}</td>
                <td style={{ ...cellStyle, fontSize: "0.75rem" }}>{activity.toEmail}</td>
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{activity.subject}</td>
                <td style={cellStyle}>{actionBadge(activity.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Email Preview Modal */}
      {previewActivity && (
        <div
          onClick={() => setPreviewActivity(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#ffffff", borderRadius: 12, width: "100%", maxWidth: 600, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", marginBottom: 4 }}>
                    {previewActivity.subject}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6e6e80" }}>
                    From: {previewActivity.fromEmail} &middot; To: {previewActivity.toEmail} &middot; {formatDate(previewActivity.sentAt)}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                    {previewActivity.opened && actionBadge("opened")}
                    {previewActivity.spamRescued && actionBadge("spam_rescued")}
                    {previewActivity.markedImportant && actionBadge("important")}
                    {previewActivity.replied && actionBadge("replied")}
                  </div>
                </div>
                <button
                  onClick={() => setPreviewActivity(null)}
                  style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#8e8ea0", cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
              <div style={{ fontSize: "0.85rem", color: "#171717", whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "inherit" }}>
                {previewActivity.bodyText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
