"use client";

import { motion } from "framer-motion";
import type { AnalyzeTheme } from "@/contexts/analyze-theme";

interface DashboardNavTab {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

interface DashboardNavProps {
  tabs: DashboardNavTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  layoutId?: string;
  theme?: AnalyzeTheme;
}

export function DashboardNav({
  tabs,
  activeTab,
  onTabChange,
  layoutId = "dashboard-tab",
  theme = "dark",
}: DashboardNavProps) {
  const isLight = theme === "light";
  const bg = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
  const border = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
  const activeColor = isLight ? "#18181b" : "#ffffff";
  const inactiveColor = isLight ? "#71717a" : "rgba(255,255,255,0.4)";
  const inactiveHover = isLight ? "#52525b" : "rgba(255,255,255,0.6)";
  const pillBg = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: 4,
        background: bg,
        borderRadius: 10,
        border: `1px solid ${border}`,
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
              color: isActive ? activeColor : inactiveColor,
              transition: "color 0.2s ease",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseOver={(e) => {
              if (!isActive)
                e.currentTarget.style.color = inactiveHover;
            }}
            onMouseOut={(e) => {
              if (!isActive)
                e.currentTarget.style.color = inactiveColor;
            }}
          >
            {/* Animated sliding pill background */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: tab.color ? `${tab.color}20` : pillBg,
                  borderRadius: 8,
                  zIndex: -1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 28,
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
