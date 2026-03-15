"use client";

import { useState, useEffect, useCallback } from "react";
import type { OutreachList } from "./outreach-section";

interface Contact {
  id: string;
  email: string;
  businessName: string;
  firstName: string | null;
  category: string;
  city: string;
  cuisineType: string | null;
  status: string;
  createdAt: string;
  listMemberships: { list: { id: string; name: string } }[];
}

interface Props {
  lists: OutreachList[];
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
    pending: { bg: "rgba(142,142,160,0.1)", color: "#8e8ea0" },
    sent: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
    bounced: { bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
    unsubscribed: { bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
    failed: { bg: "rgba(217,119,6,0.1)", color: "#d97706" },
  };
  const c = colors[status] || colors.pending;
  return (
    <span style={{ fontSize: "0.7rem", fontWeight: 500, padding: "2px 8px", borderRadius: 999, background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

export function ContactsView({ lists, onRefresh }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("");
  const [filterList, setFilterList] = useState("");
  const [loading, setLoading] = useState(true);

  // CSV upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [uploadListName, setUploadListName] = useState("");
  const [uploadListId, setUploadListId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [detectPhase, setDetectPhase] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterCity) params.set("city", filterCity);
    if (filterList) params.set("listId", filterList);
    try {
      const res = await fetch(`/api/admin/outreach/contacts?${params}`);
      const data = await res.json();
      setContacts(data.contacts);
      setTotal(data.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, filterStatus, filterCity, filterList]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleFileSelect = async (file: File) => {
    setUploadFile(file);
    setUploadResult(null);
    setDetectPhase(true);
    // Auto-populate list name from filename (e.g., "nc_outreach_contacts.csv" → "nc outreach contacts")
    if (!uploadListName && !uploadListId) {
      const name = file.name.replace(/\.csv$/i, "").replace(/[_-]/g, " ").trim();
      setUploadListName(name);
    }

    // Send file to detect columns
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/outreach/contacts/upload", { method: "POST", body: formData });
      const data = await res.json();
      setCsvHeaders(data.headers || []);
      setColumnMapping(data.autoMapping || {});
    } catch { /* ignore */ }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("columnMapping", JSON.stringify(columnMapping));
    if (uploadListName) formData.append("listName", uploadListName);
    if (uploadListId) formData.append("listId", uploadListId);

    try {
      const res = await fetch("/api/admin/outreach/contacts/upload", { method: "POST", body: formData });
      const data = await res.json();
      setUploadResult(`${data.imported} imported, ${data.duplicates} duplicates, ${data.errors} errors`);
      setUploadFile(null);
      setCsvHeaders([]);
      setDetectPhase(false);
      fetchContacts();
      onRefresh();
    } catch {
      setUploadResult("Upload failed");
    }
    setUploading(false);
  };

  const ourFields = ["email", "businessName", "firstName", "category", "city", "cuisineType", "website", "phone", "address", "zipCode", "source"];

  const downloadTemplate = () => {
    const headers = ["Email", "Business Name", "First Name", "Category", "City", "Cuisine/Type", "Website", "Phone", "Full Address", "Zip Code", "Source"];
    const sampleRow = [
      "contact@example.com",
      "Joe's Coffee Shop",
      "Joe",
      "restaurant",
      "Raleigh",
      "Coffee",
      "https://joescoffee.com",
      "(919) 555-0123",
      "123 Main St, Raleigh, NC",
      "27601",
      "Google Maps",
    ];
    const csv = [headers.join(","), sampleRow.map((v) => `"${v}"`).join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outreach-contacts-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      {/* CSV Upload Zone */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#171717", margin: 0 }}>Import Contacts</h3>
          <button
            onClick={downloadTemplate}
            style={{ padding: "5px 12px", fontSize: "0.75rem", fontWeight: 500, borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", color: "#171717", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download CSV Template
          </button>
        </div>

        {!detectPhase && (
          <div
            style={{
              border: "2px dashed #e5e5e5",
              borderRadius: 8,
              padding: "2rem",
              textAlign: "center",
              cursor: "pointer",
              background: "#fafafa",
            }}
            onClick={() => document.getElementById("csv-input")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
          >
            <input id="csv-input" type="file" accept=".csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
            <p style={{ fontSize: "0.85rem", color: "#6e6e80", margin: 0 }}>Drop CSV file here or click to browse</p>
          </div>
        )}

        {detectPhase && csvHeaders.length > 0 && (
          <div>
            <p style={{ fontSize: "0.8rem", color: "#6e6e80", marginBottom: 12 }}>
              File: {uploadFile?.name} &middot; Map CSV columns to contact fields:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {ourFields.map((field) => (
                <div key={field} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.75rem", color: "#171717", fontWeight: 500, minWidth: 100 }}>{field}</span>
                  <select
                    value={columnMapping[field] || ""}
                    onChange={(e) => setColumnMapping({ ...columnMapping, [field]: e.target.value })}
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      borderRadius: 6,
                      border: "1px solid #e5e5e5",
                      background: "#f7f7f8",
                      color: "#171717",
                    }}
                  >
                    <option value="">— skip —</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>Add to list</label>
                <select
                  value={uploadListId}
                  onChange={(e) => { setUploadListId(e.target.value); if (e.target.value) setUploadListName(""); }}
                  style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#f7f7f8" }}
                >
                  <option value="">New list...</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.contactCount})</option>
                  ))}
                </select>
              </div>
              {!uploadListId && (
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "#8e8ea0", display: "block", marginBottom: 4 }}>New list name</label>
                  <input
                    value={uploadListName}
                    onChange={(e) => setUploadListName(e.target.value)}
                    placeholder="e.g., Raleigh Restaurants"
                    style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#f7f7f8", boxSizing: "border-box" }}
                  />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleUpload}
                disabled={uploading || !columnMapping.email || !columnMapping.businessName || (!uploadListId && !uploadListName.trim())}
                style={{ padding: "8px 20px", fontSize: "0.8rem", fontWeight: 500, borderRadius: 8, border: "none", background: "#171717", color: "#ffffff", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading || !columnMapping.email || (!uploadListId && !uploadListName.trim()) ? 0.6 : 1 }}
              >
                {uploading ? "Importing..." : "Import"}
              </button>
              <button onClick={() => { setDetectPhase(false); setUploadFile(null); setCsvHeaders([]); }} style={{ padding: "8px 14px", fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "#ffffff", color: "#171717", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {uploadResult && (
          <p style={{ fontSize: "0.8rem", color: "#16a34a", marginTop: 8 }}>{uploadResult}</p>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: "1rem", flexWrap: "wrap" }}>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ padding: "6px 10px", fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "#ffffff" }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="bounced">Bounced</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <input
          placeholder="Filter by city..."
          value={filterCity}
          onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}
          style={{ padding: "6px 10px", fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "#ffffff", width: 160 }}
        />
        <select
          value={filterList}
          onChange={(e) => { setFilterList(e.target.value); setPage(1); }}
          style={{ padding: "6px 10px", fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e5e5", background: "#ffffff" }}
        >
          <option value="">All Lists</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <span style={{ fontSize: "0.8rem", color: "#8e8ea0", alignSelf: "center" }}>
          {total} contacts
        </span>
      </div>

      {/* Contact table */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Email</th>
              <th style={headerCellStyle}>Business</th>
              <th style={headerCellStyle}>City</th>
              <th style={headerCellStyle}>Category</th>
              <th style={headerCellStyle}>Status</th>
              <th style={headerCellStyle}>Lists</th>
              <th style={headerCellStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ ...cellStyle, textAlign: "center", color: "#8e8ea0", padding: "2rem" }}>Loading...</td></tr>
            )}
            {!loading && contacts.length === 0 && (
              <tr><td colSpan={7} style={{ ...cellStyle, textAlign: "center", color: "#8e8ea0", padding: "2rem" }}>No contacts</td></tr>
            )}
            {!loading && contacts.map((c) => (
              <tr key={c.id}>
                <td style={cellStyle}>{c.email}</td>
                <td style={{ ...cellStyle, fontWeight: 500 }}>{c.businessName}</td>
                <td style={{ ...cellStyle, color: "#6e6e80" }}>{c.city || "—"}</td>
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{c.category || "—"}</td>
                <td style={cellStyle}>{statusBadge(c.status)}</td>
                <td style={{ ...cellStyle, fontSize: "0.7rem", color: "#6e6e80" }}>
                  {c.listMemberships.map((m) => m.list.name).join(", ") || "—"}
                </td>
                <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>
                  {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1rem" }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: "4px 12px", fontSize: "0.8rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>Prev</button>
          <span style={{ fontSize: "0.8rem", color: "#6e6e80", alignSelf: "center" }}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: "4px 12px", fontSize: "0.8rem", borderRadius: 6, border: "1px solid #e5e5e5", background: "#ffffff", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>Next</button>
        </div>
      )}
    </div>
  );
}
