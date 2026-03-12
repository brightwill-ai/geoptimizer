"use client";

import { motion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  titleRight?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  span?: 1 | 2;
  locked?: boolean;
  lockLabel?: string;
  lockIcon?: ReactNode;
  onUnlock?: () => void;
  noPadding?: boolean;
  accentColor?: string;
  style?: CSSProperties;
}

export function DashboardCard({
  title,
  subtitle,
  titleRight,
  icon,
  children,
  span,
  locked,
  lockLabel,
  lockIcon,
  onUnlock,
  noPadding,
  accentColor,
  style,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="dash-card"
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = "#d5d5d5";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)";
        e.currentTarget.style.borderColor = "#e5e5e5";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        borderRadius: 12,
        padding: noPadding ? 0 : "1.25rem",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease",
        ...(span === 2 ? { gridColumn: "1 / -1" } : {}),
        ...(accentColor
          ? { borderTopWidth: 3, borderTopColor: accentColor }
          : {}),
        ...style,
      }}
    >
      {/* Title bar */}
      {(title || titleRight) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {icon}
            <div>
              <h3
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#8e8ea0",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h3>
              {subtitle && (
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "#8e8ea0",
                    margin: "2px 0 0",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {titleRight}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          ...(locked
            ? {
                filter: "blur(6px)",
                userSelect: "none" as const,
                pointerEvents: "none" as const,
                opacity: 0.5,
              }
            : {}),
        }}
      >
        {children}
      </div>

      {/* Lock overlay */}
      {locked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            borderRadius: 12,
            zIndex: 10,
          }}
        >
          <button
            onClick={onUnlock}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 999,
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#d5d5d5";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#e5e5e5";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {lockIcon}
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "#171717",
              }}
            >
              {lockLabel || "Unlock"}
            </span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
