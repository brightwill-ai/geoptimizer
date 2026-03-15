"use client";

import { useState } from "react";
import type { OutreachTemplate, AccountFull } from "./outreach-section";

interface Props {
  templates: OutreachTemplate[];
  accounts: AccountFull[];
  onRefresh: () => void;
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
  fontFamily: "monospace",
};

export function TemplatesView({ templates, accounts, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", htmlBody: "", plainTextBody: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState<string | null>(null);
  const [testSending, setTestSending] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});
  const [showGuide, setShowGuide] = useState(false);

  const resetForm = () => {
    setForm({ name: "", subject: "", htmlBody: "", plainTextBody: "", description: "" });
    setEditingId(null);
    setShowForm(false);
    setPreviewHtml(null);
    setPreviewSubject(null);
    setError("");
  };

  const startEdit = (t: OutreachTemplate) => {
    setForm({ name: t.name, subject: t.subject, htmlBody: t.htmlBody, plainTextBody: t.plainTextBody, description: t.description || "" });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const url = editingId ? `/api/admin/outreach/templates/${editingId}` : "/api/admin/outreach/templates";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }
      resetForm();
      onRefresh();
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const handlePreview = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/outreach/templates/${id}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setPreviewSubject(data.subject);
      setPreviewHtml(data.html);
    } catch { /* ignore */ }
  };

  const handleTestSend = async (templateId: string) => {
    if (accounts.length === 0) {
      setTestResult((r) => ({ ...r, [templateId]: "No accounts configured" }));
      return;
    }
    const email = prompt("Send test email to:");
    if (!email) return;
    setTestSending(templateId);
    try {
      const res = await fetch(`/api/admin/outreach/templates/${templateId}/test-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: email, accountId: accounts[0].id }),
      });
      const data = await res.json();
      setTestResult((r) => ({ ...r, [templateId]: data.success ? "Test sent!" : `Error: ${data.error}` }));
    } catch {
      setTestResult((r) => ({ ...r, [templateId]: "Network error" }));
    }
    setTestSending(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/admin/outreach/templates/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div>
      {/* CSV Format Guide */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setShowGuide(!showGuide)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "#171717", padding: 0 }}
        >
          <span style={{ fontSize: "0.7rem" }}>{showGuide ? "v" : ">"}</span>
          Template Variables Guide
        </button>
        {showGuide && (
          <div style={{ marginTop: 12, fontSize: "0.78rem", color: "#6e6e80", lineHeight: 1.7 }}>
            <p style={{ margin: "0 0 8px" }}>Available placeholders for subject &amp; body:</p>
            <code style={{ display: "block", background: "#f7f7f8", padding: 12, borderRadius: 8, fontSize: "0.72rem", lineHeight: 1.6 }}>
              {"{businessName}"} {"{city}"} {"{category}"} {"{cuisineType}"} {"{firstName}"}<br/>
              {"{email}"} {"{website}"} {"{phone}"} {"{address}"} {"{zipCode}"}<br/>
              {"{categoryNoun}"} (computed) {"{searchExample}"} (computed) {"{unsubscribeUrl}"} (auto)
            </code>
            <p style={{ margin: "8px 0 0" }}>
              <strong>Cold outreach:</strong> Use minimal HTML (looks personal). <strong>Branded:</strong> Use full HTML with styling for warm leads/follow-ups.
            </p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", margin: 0 }}>Templates</h3>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          style={{ padding: "6px 14px", fontSize: "0.8rem", fontWeight: 500, borderRadius: 8, border: "1px solid #e5e5e5", background: showForm ? "#f7f7f8" : "#171717", color: showForm ? "#171717" : "#ffffff", cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "New Template"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Name</label>
              <input style={{ ...inputStyle, fontFamily: "inherit" }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Curiosity v2" />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Subject</label>
              <input style={inputStyle} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Is ChatGPT recommending {businessName}?" />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>HTML Body</label>
              <textarea style={{ ...inputStyle, minHeight: 200, resize: "vertical" }} value={form.htmlBody} onChange={(e) => setForm({ ...form, htmlBody: e.target.value })} placeholder="<div>Hi {firstName}, ...</div>" />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Plain Text Body</label>
              <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} value={form.plainTextBody} onChange={(e) => setForm({ ...form, plainTextBody: e.target.value })} placeholder="Hi {firstName}, ..." />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Description (optional)</label>
              <input style={{ ...inputStyle, fontFamily: "inherit" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          {error && <p style={{ fontSize: "0.75rem", color: "#dc2626", margin: "0 0 8px 0" }}>{error}</p>}
          <button onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", fontSize: "0.8rem", fontWeight: 500, borderRadius: 8, border: "none", background: "#171717", color: "#ffffff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : editingId ? "Update Template" : "Create Template"}
          </button>
        </div>
      )}

      {/* Preview panel */}
      {previewHtml && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#171717", margin: 0 }}>Preview</h4>
            <button onClick={() => { setPreviewHtml(null); setPreviewSubject(null); }} style={{ fontSize: "0.75rem", color: "#8e8ea0", background: "none", border: "none", cursor: "pointer" }}>Close</button>
          </div>
          {previewSubject && <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#171717", marginBottom: 8 }}>Subject: {previewSubject}</div>}
          <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16, background: "#fafafa" }} dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}

      {/* Template cards */}
      <div style={{ display: "grid", gap: 12 }}>
        {templates.map((t) => {
          const vars: string[] = JSON.parse(t.variables || "[]");
          return (
            <div key={t.id} style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem 1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#171717" }}>{t.name}</span>
                  {!t.isActive && <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "#8e8ea0" }}>(inactive)</span>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => startEdit(t)} style={{ padding: "3px 8px", fontSize: "0.7rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", color: "#171717", cursor: "pointer" }}>Edit</button>
                  <button onClick={() => handlePreview(t.id)} style={{ padding: "3px 8px", fontSize: "0.7rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", color: "#171717", cursor: "pointer" }}>Preview</button>
                  <button onClick={() => handleTestSend(t.id)} disabled={testSending === t.id} style={{ padding: "3px 8px", fontSize: "0.7rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", color: "#4285f4", cursor: "pointer" }}>
                    {testSending === t.id ? "Sending..." : "Send Test"}
                  </button>
                  <button onClick={() => handleDelete(t.id)} style={{ padding: "3px 8px", fontSize: "0.7rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", color: "#dc2626", cursor: "pointer" }}>Delete</button>
                </div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#6e6e80", marginBottom: 6 }}>
                Subject: {t.subject}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#8e8ea0", marginBottom: 6 }}>
                {t.plainTextBody.slice(0, 100)}...
              </div>
              {vars.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {vars.map((v) => (
                    <span key={v} style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: 4, background: "#f7f7f8", color: "#6e6e80", border: "1px solid #ececec" }}>
                      {`{${v}}`}
                    </span>
                  ))}
                </div>
              )}
              {testResult[t.id] && (
                <div style={{ fontSize: "0.7rem", color: "#6e6e80", marginTop: 6 }}>{testResult[t.id]}</div>
              )}
            </div>
          );
        })}
        {templates.length === 0 && (
          <div style={{ color: "#8e8ea0", fontSize: "0.85rem", padding: "1rem 0" }}>
            No templates yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}
