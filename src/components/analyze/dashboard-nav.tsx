"use client";

import { motion } from "framer-motion";

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
        padding: "0 0 0",
        borderBottom: "none",
        backgroundImage: "repeating-radial-gradient(circle, rgba(0,0,0,0.12) 0 1px, transparent 1px 6px)",
        backgroundSize: "6px 2px",
        backgroundRepeat: "repeat-x",
        backgroundPosition: "bottom center",
        paddingBottom: 2,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const activeColor = tab.color || "#171717";
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              position: "relative",
              zIndex: 1,
              padding: "8px 16px 10px",
              borderRadius: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "#171717" : "#6e6e80",
              transition: "color 0.2s ease, background 0.2s ease",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
            onMouseOver={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "#171717";
                e.currentTarget.style.background = "#f7f7f8";
              }
            }}
            onMouseOut={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "#6e6e80";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {/* Animated bottom border indicator */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: activeColor,
                  borderRadius: "1px 1px 0 0",
                  zIndex: 2,
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
                    ? "#f0f0f0"
                    : "#f7f7f8",
                  color: isActive
                    ? "#171717"
                    : "#8e8ea0",
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
