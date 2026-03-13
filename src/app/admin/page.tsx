"use client";

import { useState, useEffect, useRef } from "react";

interface KPIs {
  totalAnalyses: number;
  paidCount: number;
  fullAuditCount: number;
  strategyCount: number;
  revenue: number;
  signupsThisWeek: number;
  conversionRate: string;
}

interface PaidAnalysis {
  id: string;
  businessName: string;
  location: string;
  priceTier: string;
  status: string;
  shareToken: string | null;
  stripeSessionId: string | null;
  actionPlanStatus: string;
  recommendationProbability: number | null;
  createdAt: string;
  paidAt: string | null;
  userName: string | null;
  userEmail: string | null;
}

interface FreeAnalysis {
  id: string;
  businessName: string;
  location: string;
  status: string;
  recommendationProbability: number | null;
  createdAt: string;
}

interface SignupEntry {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  website: string | null;
  createdAt: string;
}

type Tab = "paid" | "free" | "signups";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [recentPaid, setRecentPaid] = useState<PaidAnalysis[]>([]);
  const [recentFree, setRecentFree] = useState<FreeAnalysis[]>([]);
  const [recentSignups, setRecentSignups] = useState<SignupEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("paid");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const controller = new AbortController();
    fetch("/api/admin/stats", { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 401) {
          setAuthed(false);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setKpis(data.kpis);
        setRecentPaid(data.recentPaid);
        setRecentFree(data.recentFree);
        setRecentSignups(data.recentSignups);
        setAuthed(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setKpis(data.kpis);
      setRecentPaid(data.recentPaid);
      setRecentFree(data.recentFree);
      setRecentSignups(data.recentSignups);
      setAuthed(true);
    } catch { /* ignore */ }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError("Invalid password");
        return;
      }
      setAuthed(true);
      fetchData();
    } catch {
      setLoginError("Something went wrong");
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tierLabel = (tier: string) => {
    if (tier === "audit_strategy") return "$199 Strategy";
    if (tier === "full_audit") return "$99 Audit";
    return tier;
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      complete: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
      running: { bg: "rgba(217,119,6,0.1)", color: "#d97706" },
      pending: { bg: "rgba(142,142,160,0.1)", color: "#8e8ea0" },
      failed: { bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
    };
    const c = colors[status] || colors.pending;
    return (
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 500,
          padding: "2px 8px",
          borderRadius: 999,
          background: c.bg,
          color: c.color,
        }}
      >
        {status}
      </span>
    );
  };

  // ─── Login screen ────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f3efe8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: "2.5rem",
            width: 360,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h1 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#171717", margin: "0 0 0.5rem 0" }}>
            BrightWill Admin
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#8e8ea0", margin: "0 0 1.5rem 0" }}>
            Enter your admin password to continue.
          </p>
          {loginError && (
            <p style={{ fontSize: "0.75rem", color: "#dc2626", margin: "0 0 0.75rem 0" }}>
              {loginError}
            </p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: "100%",
              padding: "0.7rem 1rem",
              fontSize: "0.85rem",
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              background: "#f7f7f8",
              color: "#171717",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 12,
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.7rem",
              fontSize: "0.85rem",
              fontWeight: 500,
              borderRadius: 8,
              border: "none",
              background: "#171717",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Log in
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f3efe8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8e8ea0" }}>Loading...</p>
      </div>
    );
  }

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "paid", label: "Paid Customers", count: recentPaid.length },
    { id: "free", label: "Free Analyses", count: recentFree.length },
    { id: "signups", label: "Signups", count: recentSignups.length },
  ];

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3efe8",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#171717", margin: "0 0 4px 0" }}>
            BrightWill Admin
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#8e8ea0", margin: 0 }}>
            Business overview and client tracking
          </p>
        </div>

        {/* KPI Row */}
        {kpis && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: "2rem" }}>
            {[
              { label: "Total Analyses", value: kpis.totalAnalyses, accent: undefined },
              { label: "Paid Customers", value: kpis.paidCount, accent: "#10a37f" },
              { label: "Revenue", value: `$${kpis.revenue.toLocaleString()}`, accent: "#16a34a" },
              { label: "Signups (7d)", value: kpis.signupsThisWeek, accent: "#4285f4" },
              { label: "Conversion Rate", value: `${kpis.conversionRate}%`, accent: "#d97706" },
            ].map((kpi) => (
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
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#171717" }}>
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e5e5", marginBottom: "1rem" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px",
                fontSize: "0.8rem",
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? "#171717" : "#8e8ea0",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #171717" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tables */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
          {activeTab === "paid" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Customer</th>
                  <th style={headerCellStyle}>Business</th>
                  <th style={headerCellStyle}>Location</th>
                  <th style={headerCellStyle}>Tier</th>
                  <th style={headerCellStyle}>Status</th>
                  <th style={headerCellStyle}>Prob.</th>
                  <th style={headerCellStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPaid.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ ...cellStyle, textAlign: "center", color: "#8e8ea0", padding: "2rem" }}>
                      No paid customers yet
                    </td>
                  </tr>
                )}
                {recentPaid.map((a) => (
                  <>
                    <tr
                      key={a.id}
                      onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                      style={{ cursor: "pointer", background: expandedId === a.id ? "#fafafa" : undefined }}
                    >
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 500 }}>{a.userName || "—"}</div>
                        <div style={{ fontSize: "0.7rem", color: "#8e8ea0" }}>{a.userEmail || "—"}</div>
                      </td>
                      <td style={cellStyle}>{a.businessName}</td>
                      <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{a.location}</td>
                      <td style={cellStyle}>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: a.priceTier === "audit_strategy" ? "rgba(124,58,237,0.1)" : "rgba(16,163,127,0.1)",
                          color: a.priceTier === "audit_strategy" ? "#7c3aed" : "#10a37f",
                        }}>
                          {tierLabel(a.priceTier)}
                        </span>
                      </td>
                      <td style={cellStyle}>{statusBadge(a.status)}</td>
                      <td style={cellStyle}>
                        {a.recommendationProbability != null
                          ? `${Math.round(a.recommendationProbability * 100)}%`
                          : "—"}
                      </td>
                      <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>
                        {formatDate(a.createdAt)}
                      </td>
                    </tr>
                    {expandedId === a.id && (
                      <tr key={`${a.id}-detail`}>
                        <td colSpan={7} style={{ padding: "12px 14px", background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                          <div style={{ display: "flex", gap: 24, fontSize: "0.75rem", color: "#6e6e80", flexWrap: "wrap" }}>
                            <div><strong style={{ color: "#171717" }}>Stripe:</strong> {a.stripeSessionId || "dev bypass"}</div>
                            <div><strong style={{ color: "#171717" }}>Action Plan:</strong> {a.actionPlanStatus}</div>
                            {a.shareToken && (
                              <div>
                                <strong style={{ color: "#171717" }}>Report:</strong>{" "}
                                <a href={`${appUrl}/report/${a.shareToken}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4285f4" }}>
                                  /report/{a.shareToken}
                                </a>
                              </div>
                            )}
                            {a.paidAt && <div><strong style={{ color: "#171717" }}>Paid:</strong> {formatDate(a.paidAt)}</div>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "free" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Business</th>
                  <th style={headerCellStyle}>Location</th>
                  <th style={headerCellStyle}>Status</th>
                  <th style={headerCellStyle}>Probability</th>
                  <th style={headerCellStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentFree.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ ...cellStyle, textAlign: "center", color: "#8e8ea0", padding: "2rem" }}>
                      No free analyses yet
                    </td>
                  </tr>
                )}
                {recentFree.map((a) => (
                  <tr key={a.id}>
                    <td style={{ ...cellStyle, fontWeight: 500 }}>{a.businessName}</td>
                    <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>{a.location}</td>
                    <td style={cellStyle}>{statusBadge(a.status)}</td>
                    <td style={cellStyle}>
                      {a.recommendationProbability != null
                        ? `${Math.round(a.recommendationProbability * 100)}%`
                        : "—"}
                    </td>
                    <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>
                      {formatDate(a.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "signups" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Name</th>
                  <th style={headerCellStyle}>Email</th>
                  <th style={headerCellStyle}>Business</th>
                  <th style={headerCellStyle}>Website</th>
                  <th style={headerCellStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSignups.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ ...cellStyle, textAlign: "center", color: "#8e8ea0", padding: "2rem" }}>
                      No signups yet
                    </td>
                  </tr>
                )}
                {recentSignups.map((s) => (
                  <tr key={s.id}>
                    <td style={{ ...cellStyle, fontWeight: 500 }}>{s.name}</td>
                    <td style={{ ...cellStyle, color: "#6e6e80" }}>{s.email}</td>
                    <td style={cellStyle}>{s.businessName || "—"}</td>
                    <td style={cellStyle}>
                      {s.website ? (
                        <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: "#4285f4", fontSize: "0.75rem" }}>
                          {s.website}
                        </a>
                      ) : "—"}
                    </td>
                    <td style={{ ...cellStyle, fontSize: "0.75rem", color: "#6e6e80" }}>
                      {formatDate(s.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
