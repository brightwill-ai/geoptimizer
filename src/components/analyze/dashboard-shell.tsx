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
        minHeight: "calc(100vh - 60px)",
      }}
      >
      {/* Transparent header zone — mesh gradient shows through */}
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 2rem",
          position: "relative",
          zIndex: 1,
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
                color: "#171717",
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
                  color: "#8e8ea0",
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

      {/* KPI + Nav section (non-sticky) */}
      <div
        className={`dashboard-shell-sticky ${stickyMode === "compact" ? "dashboard-shell-sticky-compact" : ""}`}
        style={{
          position: "relative",
          zIndex: 2,
          borderBottom: "none",
          backgroundImage: "repeating-radial-gradient(circle, rgba(0,0,0,0.10) 0 1px, transparent 1px 6px)",
          backgroundSize: "6px 2px",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "bottom center",
          paddingTop: "0",
          paddingBottom: 2,
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
      </div>

      {/* Fade from mesh → gray */}
      <div
        style={{
          height: 60,
          background: "linear-gradient(to bottom, transparent 0%, #f3efe8 100%)",
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Beige content zone */}
      <div
        style={{
          background: "#f3efe8",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 2rem",
          }}
        >
          {/* Tab content with cross-fade transition */}
          <div style={{ padding: "0 0 3rem" }} className="dashboard-shell-content">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky footer slot */}
          {stickyFooter}
        </div>
      </div>
    </motion.div>
  );
}
