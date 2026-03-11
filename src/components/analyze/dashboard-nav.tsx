"use client";

import { motion } from "framer-motion";

interface DashboardNavTab {
  id: string;
  label: string;
  count?: number;
}

interface DashboardNavProps {
  tabs: DashboardNavTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  layoutId?: string;
}

export function DashboardNav({
  tabs,
  activeTab,
  onTabChange,
  layoutId = "dashboard-tab",
}: DashboardNavProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: 4,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.06)",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              position: "relative",
              zIndex: 1,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
              transition: "color 0.2s ease",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseOver={(e) => {
              if (!isActive)
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
            onMouseOut={(e) => {
              if (!isActive)
                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
            }}
          >
            {/* Animated sliding pill background */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  zIndex: -1,
                }}
                transition={{
                  type: "spring",
                  bounce: 0.15,
                  duration: 0.4,
                }}
              />
            )}
            <span style={{ position: "relative" }}>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: isActive
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.06)",
                  color: isActive
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(255,255,255,0.3)",
                  lineHeight: 1.4,
                  transition: "all 0.2s ease",
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
