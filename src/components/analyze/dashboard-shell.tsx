"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { KPIRow } from "./kpi-row";
import type { KPIItem } from "./kpi-row";
import { DashboardNav } from "./dashboard-nav";

interface DashboardShellProps {
  businessName: string;
  subtitle?: string;
  headerMeta?: ReactNode;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  kpiItems?: KPIItem[];
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
  stickyFooter?: ReactNode;
  navLayoutId?: string;
  stickyMode?: "regular" | "compact";
}

export function DashboardShell({
  businessName,
  subtitle,
  headerMeta,
  headerLeft,
  headerRight,
  kpiItems,
  tabs,
  activeTab,
  onTabChange,
  children,
  stickyFooter,
  navLayoutId,
  stickyMode = "regular",
}: DashboardShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dashboard-shell"
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 2rem",
        background: "#0c0d10",
        minHeight: "calc(100vh - 60px)",
      }}
      >
      {/* Header */}
      <div
        className="dashboard-shell-header"
        style={{
          padding: "2.5rem 0 1.5rem",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div
          className="dashboard-shell-header-main"
          style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0 }}
        >
          {headerLeft}
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(1.5rem, 2vw, 2rem)",
                fontWeight: 600,
                color: "#ffffff",
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
              }}
            >
              {businessName}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.4)",
                  margin: "4px 0 0",
                }}
              >
                {subtitle}
              </p>
            )}
            {headerMeta && (
              <div style={{ marginTop: 12 }}>
                {headerMeta}
              </div>
            )}
          </div>
        </div>
        {headerRight && (
          <div className="dashboard-shell-header-side">
            {headerRight}
          </div>
        )}
      </div>

      {/* Sticky section: KPI + Nav */}
      <div
        className={`dashboard-shell-sticky ${stickyMode === "compact" ? "dashboard-shell-sticky-compact" : ""}`}
        style={{
          position: "sticky",
          top: 60,
          zIndex: 40,
          background: "rgba(12, 13, 16, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "1rem",
          paddingBottom: "1rem",
          marginLeft: "-2rem",
          marginRight: "-2rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        {kpiItems && kpiItems.length > 0 && (
          <div style={{ marginBottom: 16 }} className="dashboard-shell-kpis">
            <KPIRow items={kpiItems} />
          </div>
        )}
        <DashboardNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          layoutId={navLayoutId}
        />
      </div>

      {/* Tab content with cross-fade transition */}
      <div style={{ padding: "1.5rem 0 3rem" }} className="dashboard-shell-content">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky footer slot */}
      {stickyFooter}
    </motion.div>
  );
}
