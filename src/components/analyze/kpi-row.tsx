"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
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
          transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
          style={{
            background: "rgba(20, 21, 26, 0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            position: "relative",
            overflow: "hidden",
            ...(item.accentColor
              ? {
                  borderTopWidth: 2,
                  borderTopStyle: "solid" as const,
                  borderTopColor: item.accentColor,
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
                background: `radial-gradient(circle at top right, ${item.accentColor}0a, transparent 70%)`,
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
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </span>
              </div>

              {/* Value */}
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  color: "#ffffff",
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
                    color: "rgba(255,255,255,0.35)",
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
                    color: "rgba(255,255,255,0.58)",
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
