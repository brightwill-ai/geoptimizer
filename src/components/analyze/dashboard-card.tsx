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
        e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        background: "rgba(20, 21, 26, 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: noPadding ? 0 : "1.25rem",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        ...(span === 2 ? { gridColumn: "1 / -1" } : {}),
        ...(accentColor
          ? { borderTopWidth: 2, borderTopColor: accentColor }
          : {}),
        ...style,
      }}
    >
      {/* Subtle corner glow */}
      {accentColor && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 160,
            height: 160,
            background: `radial-gradient(circle at top right, ${accentColor}15, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

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
                  color: "rgba(255,255,255,0.4)",
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
                    color: "rgba(255,255,255,0.3)",
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
            background: "rgba(12,13,16,0.3)",
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
              background: "#14151a",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {lockIcon}
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "#ffffff",
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
