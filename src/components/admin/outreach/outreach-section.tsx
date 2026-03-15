"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardView } from "./dashboard-view";
import { CampaignsView } from "./campaigns-view";
import { ContactsView } from "./contacts-view";
import { TemplatesView } from "./templates-view";
import { AccountsView } from "./accounts-view";

type SubTab = "dashboard" | "campaigns" | "contacts" | "templates" | "accounts";

interface OutreachStats {
  totalContacts: number;
  totalSent: number;
  sentToday: number;
  sentThisWeek: number;
  activeCampaigns: number;
  totalBounced: number;
  totalUnsubscribed: number;
  accounts: Account[];
  recentSends: RecentSend[];
}

export interface Account {
  id: string;
  label: string;
  status: string;
  warmupPhase: string;
  warmupDay: number;
  dailyLimit: number;
  sentToday: number;
  totalSent: number;
  consecutiveErrors: number;
}

export interface RecentSend {
  id: string;
  contactEmail: string;
  contactBusiness: string;
  templateName: string;
  accountLabel: string;
  status: string;
  sentAt: string | null;
  renderedSubject: string;
  renderedHtml: string | null;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  plainTextBody: string;
  description: string | null;
  variables: string;
  isActive: boolean;
  createdAt: string;
}

export interface OutreachList {
  id: string;
  name: string;
  description: string | null;
  contactCount: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  listId: string;
  list: { id: string; name: string; contactCount: number };
  status: string;
  delayMinutes: number;
  jitterSeconds: number;
  skipWeekends: boolean;
  sendWindowStart: number;
  sendWindowEnd: number;
  timezone: string;
  allowResendDays: number;
  categoryFilter: string | null;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  startedAt: string | null;
  lastSendAt: string | null;
  createdAt: string;
  templates: { templateId: string; weight: number; template: { id: string; name: string; subject: string } }[];
}

export interface AccountFull {
  id: string;
  label: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  fromName: string;
  fromEmail: string;
  replyTo: string | null;
  warmupEnabled: boolean;
  warmupDay: number;
  warmupPhase: string;
  dailyLimit: number;
  sentToday: number;
  status: string;
  lastError: string | null;
  lastErrorAt: string | null;
  consecutiveErrors: number;
  totalSent: number;
  isActive: boolean;
  createdAt: string;
}

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "campaigns", label: "Campaigns" },
  { id: "contacts", label: "Contacts" },
  { id: "templates", label: "Templates" },
  { id: "accounts", label: "Accounts" },
];

export function OutreachSection() {
  const [activeTab, setActiveTab] = useState<SubTab>("dashboard");
  const [stats, setStats] = useState<OutreachStats | null>(null);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [lists, setLists] = useState<OutreachList[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<AccountFull[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, templatesRes, listsRes, campaignsRes, accountsRes] = await Promise.all([
        fetch("/api/admin/outreach/stats"),
        fetch("/api/admin/outreach/templates"),
        fetch("/api/admin/outreach/lists"),
        fetch("/api/admin/outreach/campaigns"),
        fetch("/api/admin/outreach/accounts"),
      ]);
      const [statsData, templatesData, listsData, campaignsData, accountsData] = await Promise.all([
        statsRes.json(),
        templatesRes.json(),
        listsRes.json(),
        campaignsRes.json(),
        accountsRes.json(),
      ]);
      setStats(statsData);
      setTemplates(templatesData);
      setLists(listsData);
      setCampaigns(campaignsData);
      setAccounts(accountsData);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return (
      <div style={{ padding: "3rem 0", textAlign: "center", color: "#8e8ea0", fontSize: "0.85rem" }}>
        Loading outreach data...
      </div>
    );
  }

  return (
    <div>
      {/* Sub-tab nav */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e5e5", marginBottom: "1.5rem" }}>
        {SUB_TABS.map((tab) => (
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
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && stats && (
        <DashboardView stats={stats} onRefresh={fetchAll} />
      )}
      {activeTab === "campaigns" && (
        <CampaignsView campaigns={campaigns} lists={lists} templates={templates} onRefresh={fetchAll} />
      )}
      {activeTab === "contacts" && (
        <ContactsView lists={lists} onRefresh={fetchAll} />
      )}
      {activeTab === "templates" && (
        <TemplatesView templates={templates} accounts={accounts} onRefresh={fetchAll} />
      )}
      {activeTab === "accounts" && (
        <AccountsView accounts={accounts} onRefresh={fetchAll} />
      )}
    </div>
  );
}
