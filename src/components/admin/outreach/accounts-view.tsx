"use client";

import { useState } from "react";
import type { AccountFull } from "./outreach-section";

interface Props {
  accounts: AccountFull[];
  onRefresh: () => void;
}

function statusBadge(status: string) {
  const colors: Record<string, { bg: string; color: string }> = {
    active: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
    paused: { bg: "rgba(217,119,6,0.1)", color: "#d97706" },
    error: { bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
    disabled: { bg: "rgba(142,142,160,0.1)", color: "#8e8ea0" },
  };
  const c = colors[status] || colors.disabled;
  return (
    <span style={{ fontSize: "0.7rem", fontWeight: 500, padding: "2px 8px", borderRadius: 999, background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.8rem",
  fontSize: "0.8rem",
  borderRadius: 8,
  border: "1px solid #e5e5e5",
  background: "#f7f7f8",
  color: "#171717",
  outline: "none",
  boxSizing: "border-box",
};

export function AccountsView({ accounts, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    smtpHost: "smtp.zoho.com",
    smtpPort: "465",
    smtpUser: "",
    smtpPass: "",
    fromName: "William",
    fromEmail: "",
    replyTo: "",
    warmupEnabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/outreach/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          smtpPort: parseInt(form.smtpPort),
          smtpSecure: parseInt(form.smtpPort) === 465,
          label: form.fromEmail,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create");
        return;
      }
      setShowForm(false);
      setForm({ smtpHost: "smtp.zoho.com", smtpPort: "465", smtpUser: "", smtpPass: "", fromName: "William", fromEmail: "", replyTo: "", warmupEnabled: true });
      onRefresh();
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const testAccount = async (id: string) => {
    const email = prompt("Send test email to:");
    if (!email) return;
    setTestResult((r) => ({ ...r, [id]: "Sending..." }));
    try {
      const res = await fetch(`/api/admin/outreach/accounts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: email }),
      });
      const data = await res.json();
      setTestResult((r) => ({ ...r, [id]: data.success ? "Test sent!" : `Error: ${data.error}` }));
    } catch {
      setTestResult((r) => ({ ...r, [id]: "Network error" }));
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await fetch(`/api/admin/outreach/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    onRefresh();
  };

  const removeAccount = async (id: string) => {
    if (!confirm("Remove this account?")) return;
    await fetch(`/api/admin/outreach/accounts/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", margin: 0 }}>Email Accounts</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "6px 14px", fontSize: "0.8rem", fontWeight: 500, borderRadius: 8, border: "1px solid #e5e5e5", background: showForm ? "#f7f7f8" : "#171717", color: showForm ? "#171717" : "#ffffff", cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "Add Account"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>SMTP Host</label>
              <input style={inputStyle} value={form.smtpHost} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>SMTP Port</label>
              <input style={inputStyle} value={form.smtpPort} onChange={(e) => setForm({ ...form, smtpPort: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>SMTP User</label>
              <input style={inputStyle} value={form.smtpUser} onChange={(e) => setForm({ ...form, smtpUser: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>SMTP Password</label>
              <input style={inputStyle} type="password" value={form.smtpPass} onChange={(e) => setForm({ ...form, smtpPass: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>From Name</label>
              <input style={inputStyle} value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>From Email</label>
              <input style={inputStyle} value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Reply-To (optional)</label>
              <input style={inputStyle} value={form.replyTo} onChange={(e) => setForm({ ...form, replyTo: e.target.value })} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
              <label style={{ fontSize: "0.8rem", color: "#171717", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={form.warmupEnabled} onChange={(e) => setForm({ ...form, warmupEnabled: e.target.checked })} />
                Enable warmup
              </label>
            </div>
          </div>
          {error && <p style={{ fontSize: "0.75rem", color: "#dc2626", margin: "0 0 8px 0" }}>{error}</p>}
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{ padding: "8px 20px", fontSize: "0.8rem", fontWeight: 500, borderRadius: 8, border: "none", background: "#171717", color: "#ffffff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Creating..." : "Add Account"}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
        {accounts.map((account) => (
          <div key={account.id} style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem 1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#171717" }}>{account.fromEmail}</span>
              {statusBadge(account.status)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6e6e80", marginBottom: 8 }}>
              {account.smtpHost}:{account.smtpPort} &middot; From: {account.fromName}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6e6e80", marginBottom: 8 }}>
              Day {account.warmupDay} &middot; {account.warmupPhase.replace("_", " ")} &middot; Warmup {account.warmupEnabled ? "on" : "off"}
            </div>
            {/* Progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#8e8ea0", marginBottom: 2 }}>
                <span>Today</span>
                <span>{account.sentToday}/{account.dailyLimit}</span>
              </div>
              <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3 }}>
                <div style={{ height: 6, borderRadius: 3, background: "#16a34a", width: `${Math.min((account.sentToday / Math.max(account.dailyLimit, 1)) * 100, 100)}%`, transition: "width 0.3s" }} />
              </div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#8e8ea0", marginBottom: 8 }}>
              Total: {account.totalSent} sent &middot; Errors: {account.consecutiveErrors}
              {account.lastError && <div style={{ color: "#dc2626", marginTop: 2 }}>{account.lastError}</div>}
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => testAccount(account.id)} style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", color: "#171717", cursor: "pointer" }}>
                Test
              </button>
              <button onClick={() => toggleStatus(account.id, account.status)} style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", color: "#171717", cursor: "pointer" }}>
                {account.status === "active" ? "Pause" : "Resume"}
              </button>
              <button onClick={() => removeAccount(account.id)} style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", color: "#dc2626", cursor: "pointer" }}>
                Remove
              </button>
              {testResult[account.id] && (
                <span style={{ fontSize: "0.7rem", color: "#6e6e80", alignSelf: "center" }}>{testResult[account.id]}</span>
              )}
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div style={{ color: "#8e8ea0", fontSize: "0.85rem", padding: "1rem 0" }}>
            No email accounts configured yet.
          </div>
        )}
      </div>
    </div>
  );
}
