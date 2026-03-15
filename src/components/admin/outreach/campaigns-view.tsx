"use client";

import React, { useState } from "react";
import type { Campaign, OutreachList, OutreachTemplate } from "./outreach-section";

interface Props {
  campaigns: Campaign[];
  lists: OutreachList[];
  templates: OutreachTemplate[];
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
    draft: { bg: "rgba(142,142,160,0.1)", color: "#8e8ea0" },
    active: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
    paused: { bg: "rgba(217,119,6,0.1)", color: "#d97706" },
    complete: { bg: "rgba(66,133,244,0.1)", color: "#4285f4" },
  };
  const c = colors[status] || colors.draft;
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

interface SendLog {
  id: string;
  status: string;
  sentAt: string | null;
  contact: { email: string; businessName: string };
  template: { name: string };
  account: { label: string };
}

export function CampaignsView({ campaigns, lists, templates, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    listId: "",
    templateIds: [] as { id: string; weight: number }[],
    delayMinutes: 4,
    sendWindowStart: 9,
    sendWindowEnd: 17,
    skipWeekends: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendLogs, setSendLogs] = useState<Record<string, SendLog[]>>({});

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/outreach/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create");
        setSaving(false);
        return;
      }
      setShowForm(false);
      setForm({ name: "", listId: "", templateIds: [], delayMinutes: 4, sendWindowStart: 9, sendWindowEnd: 17, skipWeekends: false });
      onRefresh();
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const toggleAction = async (id: string, status: string) => {
    const action = status === "active" ? "pause" : "start";
    await fetch(`/api/admin/outreach/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    onRefresh();
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Delete this draft campaign?")) return;
    await fetch(`/api/admin/outreach/campaigns/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const loadSendLog = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (sendLogs[id]) return;
    try {
      const res = await fetch(`/api/admin/outreach/campaigns/${id}?limit=20`);
      const data = await res.json();
      setSendLogs((prev) => ({ ...prev, [id]: data.sends }));
    } catch { /* ignore */ }
  };

  const toggleTemplate = (templateId: string) => {
    setForm((prev) => {
      const exists = prev.templateIds.find((t) => t.id === templateId);
      if (exists) {
        return { ...prev, templateIds: prev.templateIds.filter((t) => t.id !== templateId) };
      }
      return { ...prev, templateIds: [...prev.templateIds, { id: templateId, weight: 1 }] };
    });
  };

  const updateWeight = (templateId: string, weight: number) => {
    setForm((prev) => ({
      ...prev,
      templateIds: prev.templateIds.map((t) => t.id === templateId ? { ...t, weight } : t),
    }));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", margin: 0 }}>Campaigns</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "6px 14px", fontSize: "0.8rem", fontWeight: 500, borderRadius: 8, border: "1px solid #e5e5e5", background: showForm ? "#f7f7f8" : "#171717", color: showForm ? "#171717" : "#ffffff", cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "New Campaign"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Campaign Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Raleigh Restaurants Q1"
                style={{ width: "100%", padding: "0.6rem 0.8rem", fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "#f7f7f8", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Contact List</label>
              <select
                value={form.listId}
                onChange={(e) => setForm({ ...form, listId: e.target.value })}
                style={{ width: "100%", padding: "0.6rem 0.8rem", fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "#f7f7f8" }}
              >
                <option value="">Select list...</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.contactCount})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Delay (minutes)</label>
              <input
                type="number"
                value={form.delayMinutes}
                onChange={(e) => setForm({ ...form, delayMinutes: parseInt(e.target.value) || 4 })}
                style={{ width: "100%", padding: "0.6rem 0.8rem", fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "#f7f7f8", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Window Start</label>
                <input type="number" value={form.sendWindowStart} onChange={(e) => setForm({ ...form, sendWindowStart: parseInt(e.target.value) })} style={{ width: "100%", padding: "0.6rem 0.8rem", fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "#f7f7f8", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Window End</label>
                <input type="number" value={form.sendWindowEnd} onChange={(e) => setForm({ ...form, sendWindowEnd: parseInt(e.target.value) })} style={{ width: "100%", padding: "0.6rem 0.8rem", fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "#f7f7f8", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Template selection */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Templates (select one or more)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {templates.map((t) => {
                const selected = form.templateIds.find((ft) => ft.id === t.id);
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, border: `1px solid ${selected ? "#171717" : "#e5e5e5"}`, background: selected ? "#f7f7f8" : "#ffffff", cursor: "pointer" }} onClick={() => toggleTemplate(t.id)}>
                    <span style={{ fontSize: "0.78rem", color: "#171717" }}>{t.name}</span>
                    {selected && (
                      <input
                        type="number"
                        min={1}
                        value={selected.weight}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateWeight(t.id, parseInt(e.target.value) || 1)}
                        style={{ width: 36, padding: "2px 4px", fontSize: "0.7rem", borderRadius: 4, border: "1px solid #e5e5e5", textAlign: "center" }}
                        title="Weight"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <label style={{ fontSize: "0.8rem", color: "#171717", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 12 }}>
            <input type="checkbox" checked={form.skipWeekends} onChange={(e) => setForm({ ...form, skipWeekends: e.target.checked })} />
            Skip weekends
          </label>

          {error && <p style={{ fontSize: "0.75rem", color: "#dc2626", margin: "0 0 8px 0" }}>{error}</p>}
          <button
            onClick={handleCreate}
            disabled={saving || !form.name || !form.listId || form.templateIds.length === 0}
            style={{ padding: "8px 20px", fontSize: "0.8rem", fontWeight: 500, borderRadius: 8, border: "none", background: "#171717", color: "#ffffff", cursor: saving ? "not-allowed" : "pointer", opacity: saving || !form.name ? 0.6 : 1 }}
          >
            {saving ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      )}

      {/* Campaign table */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Name</th>
              <th style={headerCellStyle}>List</th>
              <th style={headerCellStyle}>Status</th>
              <th style={headerCellStyle}>Sent</th>
              <th style={headerCellStyle}>Failed</th>
              <th style={headerCellStyle}>Last Send</th>
              <th style={headerCellStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr><td colSpan={7} style={{ ...cellStyle, textAlign: "center", color: "#8e8ea0", padding: "2rem" }}>No campaigns yet</td></tr>
            )}
            {campaigns.map((c) => (
              <React.Fragment key={c.id}>
                <tr onClick={() => loadSendLog(c.id)} style={{ cursor: "pointer", background: expandedId === c.id ? "#fafafa" : undefined }}>
                  <td style={{ ...cellStyle, fontWeight: 500 }}>{c.name}</td>
                  <td style={{ ...cellStyle, color: "#6e6e80" }}>{c.list.name} ({c.list.contactCount})</td>
                  <td style={cellStyle}>{statusBadge(c.status)}</td>
                  <td style={cellStyle}>{c.sentCount}/{c.totalContacts}</td>
                  <td style={{ ...cellStyle, color: c.failedCount > 0 ? "#dc2626" : "#6e6e80" }}>{c.failedCount}</td>
                  <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{formatDate(c.lastSendAt)}</td>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {(c.status === "draft" || c.status === "paused") && (
                        <button onClick={(e) => { e.stopPropagation(); toggleAction(c.id, c.status); }} style={{ padding: "2px 8px", fontSize: "0.7rem", borderRadius: 6, border: "1px solid #16a34a", background: "rgba(22,163,74,0.1)", color: "#16a34a", cursor: "pointer" }}>
                          Start
                        </button>
                      )}
                      {c.status === "active" && (
                        <button onClick={(e) => { e.stopPropagation(); toggleAction(c.id, c.status); }} style={{ padding: "2px 8px", fontSize: "0.7rem", borderRadius: 6, border: "1px solid #d97706", background: "rgba(217,119,6,0.1)", color: "#d97706", cursor: "pointer" }}>
                          Pause
                        </button>
                      )}
                      {c.status === "draft" && (
                        <button onClick={(e) => { e.stopPropagation(); deleteCampaign(c.id); }} style={{ padding: "2px 8px", fontSize: "0.7rem", borderRadius: 6, border: "1px solid #dc2626", background: "rgba(220,38,38,0.1)", color: "#dc2626", cursor: "pointer" }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === c.id && (
                  <tr>
                    <td colSpan={7} style={{ padding: "12px 14px", background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ fontSize: "0.75rem", color: "#6e6e80", marginBottom: 8 }}>
                        <strong>Templates:</strong> {c.templates.map((t) => `${t.template.name} (w:${t.weight})`).join(", ") || "None"}
                        &nbsp;&middot;&nbsp;
                        <strong>Delay:</strong> {c.delayMinutes}min
                        &nbsp;&middot;&nbsp;
                        <strong>Window:</strong> {c.sendWindowStart}:00-{c.sendWindowEnd}:00 {c.timezone}
                        {c.skipWeekends && " · Skip weekends"}
                      </div>
                      {sendLogs[c.id] && (
                        <div>
                          <strong style={{ fontSize: "0.7rem", color: "#8e8ea0" }}>Recent sends:</strong>
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
                            <tbody>
                              {sendLogs[c.id].map((s) => (
                                <tr key={s.id}>
                                  <td style={{ ...cellStyle, padding: "4px 8px", fontSize: "0.72rem" }}>{s.contact.email}</td>
                                  <td style={{ ...cellStyle, padding: "4px 8px", fontSize: "0.72rem", color: "#6e6e80" }}>{s.contact.businessName}</td>
                                  <td style={{ ...cellStyle, padding: "4px 8px", fontSize: "0.72rem", color: "#6e6e80" }}>{s.template.name}</td>
                                  <td style={{ ...cellStyle, padding: "4px 8px" }}>{statusBadge(s.status)}</td>
                                  <td style={{ ...cellStyle, padding: "4px 8px", fontSize: "0.7rem", color: "#6e6e80" }}>{formatDate(s.sentAt)}</td>
                                </tr>
                              ))}
                              {sendLogs[c.id].length === 0 && (
                                <tr><td colSpan={5} style={{ padding: "8px", fontSize: "0.72rem", color: "#8e8ea0" }}>No sends yet</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
