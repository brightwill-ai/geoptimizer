"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { useAnalyzeTheme } from "@/contexts/analyze-theme";
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
  const theme = useAnalyzeTheme();
  const isLight = theme === "light";
  const bg = isLight ? "#ffffff" : "#0c0d10";
  const textPrimary = isLight ? "#18181b" : "#ffffff";
  const textMuted = isLight ? "#71717a" : "rgba(255,255,255,0.4)";
  const stickyBg = isLight ? "rgba(255,255,255,0.92)" : "rgba(12, 13, 16, 0.92)";
  const borderSubtl = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

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
        background: bg,
        minHeight: "calc(100vh - 72px)",
      }}
      >
      {/* Window chrome: red / yellow / green dots top-left */}
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingLeft: 0,
          marginBottom: 8,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", flexShrink: 0 }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24", flexShrink: 0 }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
      </div>
      {/* Header */}
      <div
        className="dashboard-shell-header"
        style={{
          padding: "0 0 1.5rem",
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
                color: textPrimary,
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
                  color: textMuted,
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
          top: 72,
          zIndex: 40,
          background: stickyBg,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${borderSubtl}`,
          paddingTop: "1rem",
          paddingBottom: "1rem",
          marginLeft: "-2rem",
          marginRight: "-2rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        {/* Pseudo-glow overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: isLight ? "radial-gradient(ellipse at center top, rgba(0,0,0,0.02), transparent 60%)" : "radial-gradient(ellipse at center top, rgba(255,255,255,0.02), transparent 60%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
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
          theme={theme}
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
