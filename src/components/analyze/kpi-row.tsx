"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useAnalyzeTheme } from "@/contexts/analyze-theme";
import { ScoreRing } from "./score-ring";

export interface KPIItem {
  label: string;
  value: string | number;
  sublabel?: string;
  detail?: string;
  accentColor?: string;
  icon?: ReactNode;
  ring?: { score: number; size?: number };
}

interface KPIRowProps {
  items: KPIItem[];
}

export function KPIRow({ items }: KPIRowProps) {
  const theme = useAnalyzeTheme();
  const isLight = theme === "light";
  const defaultBg = isLight ? "#ffffff" : "rgba(20, 21, 26, 0.8)";
  const borderColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
  const boxShadow = isLight ? "0 2px 16px rgba(0,0,0,0.06)" : "0 2px 16px rgba(0,0,0,0.25)";
  const labelColor = isLight ? "#71717a" : "rgba(255,255,255,0.4)";
  const valueColor = isLight ? "#18181b" : "#ffffff";
  const sublabelColor = isLight ? "#71717a" : "rgba(255,255,255,0.35)";
  const detailColor = isLight ? "#52525b" : "rgba(255,255,255,0.58)";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: item.accentColor
              ? `linear-gradient(135deg, ${item.accentColor}08, transparent 60%)`
              : defaultBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            position: "relative",
            overflow: "hidden",
            boxShadow,
            ...(item.accentColor
              ? {
                  borderLeft: `3px solid ${item.accentColor}`,
                }
              : {}),
          }}
        >
          {/* Corner glow */}
          {item.accentColor && (
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                background: `radial-gradient(circle at top right, ${item.accentColor}15, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
          )}

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Label row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                {item.icon}
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: labelColor,
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </span>
              </div>

              {/* Value */}
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: valueColor,
                  lineHeight: 1.1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {item.value}
              </div>

              {/* Sublabel */}
              {item.sublabel && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: sublabelColor,
                    marginTop: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {item.sublabel}
                </div>
              )}
              {item.detail && (
                <div
                  style={{
                    fontSize: "0.74rem",
                    color: detailColor,
                    marginTop: 8,
                    lineHeight: 1.3,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.detail}
                </div>
              )}
            </div>

            {/* Optional mini ring */}
            {item.ring && (
              <div style={{ flexShrink: 0, marginLeft: 12 }}>
                <ScoreRing
                  score={item.ring.score}
                  size={item.ring.size || 48}
                  strokeWidth={5}
                  animated
                />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
