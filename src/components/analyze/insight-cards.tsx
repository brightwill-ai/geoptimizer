"use client";

import { motion } from "framer-motion";
import { useAnalyzeTheme } from "@/contexts/analyze-theme";

interface InsightItem {
  text: string;
  detail?: string;
}

interface InsightCardsProps {
  strengths: InsightItem[];
  opportunities: InsightItem[];
  gaps: InsightItem[];
}

const SEVERITY_CONFIG = {
  strength: {
    label: "Strengths",
    color: "#16a34a",
    bgColor: "rgba(22,163,74,0.08)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="#16a34a" strokeWidth="1.5" />
        <path
          d="M5 8l2 2 4-4"
          stroke="#16a34a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  opportunity: {
    label: "Opportunities",
    color: "#d97706",
    bgColor: "rgba(217,119,6,0.08)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="#d97706" strokeWidth="1.5" />
        <path
          d="M8 5v4M6 7l2-2 2 2"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  gap: {
    label: "Information Gaps",
    color: "#dc2626",
    bgColor: "rgba(220,38,38,0.08)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5l6.5 11.5H1.5L8 1.5z"
          stroke="#dc2626"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8 6v3"
          stroke="#dc2626"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11" r="0.5" fill="#dc2626" />
      </svg>
    ),
  },
} as const;

type SeverityKey = keyof typeof SEVERITY_CONFIG;

function InsightColumn({
  items,
  severity,
  delay,
}: {
  items: InsightItem[];
  severity: SeverityKey;
  delay: number;
}) {
  const theme = useAnalyzeTheme();
  const isLight = theme === "light";
  const config = SEVERITY_CONFIG[severity];
  const colBg = isLight ? "#fafafa" : "rgba(20, 21, 26, 0.7)";
  const colBorder = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const headerBorder = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)";
  const labelColor = isLight ? "#52525b" : "rgba(255,255,255,0.5)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      style={{
        background: colBg,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${colBorder}`,
        borderRadius: 12,
        borderTopWidth: 3,
        borderTopColor: config.color,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${headerBorder}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: config.color,
            }}
          />
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: labelColor,
            }}
          >
            {config.label}
          </span>
        </div>
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: 999,
            background: config.bgColor,
            color: config.color,
          }}
        >
          {items.length}
        </span>
      </div>

      {/* Items */}
      <div>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: delay + 0.1 + i * 0.06,
              ease: "easeOut",
            }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "0.75rem 1.25rem",
              borderBottom:
                i < items.length - 1
                  ? isLight ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.04)"
                  : "none",
              transition: "background 0.15s ease",
              cursor: "default",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.02)";
              e.currentTarget.style.borderRadius = "6px";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderRadius = "0px";
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>{config.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: isLight ? "#18181b" : "#ffffff",
                  lineHeight: 1.4,
                }}
              >
                {item.text}
              </div>
              {item.detail && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: isLight ? "#71717a" : "rgba(255,255,255,0.35)",
                    marginTop: 3,
                    lineHeight: 1.3,
                  }}
                >
                  {item.detail}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {items.length === 0 && (
          <div
            style={{
              padding: "1.5rem 1.25rem",
              textAlign: "center",
              fontSize: "0.78rem",
              color: isLight ? "#a1a1aa" : "rgba(255,255,255,0.25)",
            }}
          >
            No {config.label.toLowerCase()} identified
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function InsightCards({
  strengths,
  opportunities,
  gaps,
}: InsightCardsProps) {
  return (
    <div
      className="dashboard-grid-insights"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16,
      }}
    >
      <InsightColumn items={strengths} severity="strength" delay={0} />
      <InsightColumn items={opportunities} severity="opportunity" delay={0.08} />
      <InsightColumn items={gaps} severity="gap" delay={0.16} />
    </div>
  );
}
