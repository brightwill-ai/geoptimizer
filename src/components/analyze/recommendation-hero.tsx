"use client";

import { motion } from "framer-motion";


interface RecommendationHeroProps {
  probability: number; // 0-1
  totalQueries: number;
  mentionCount: number;
  businessName: string;
  providerName?: string;
}

export function RecommendationHero({
  probability,
  totalQueries,
  mentionCount,
  businessName,
  providerName = "ChatGPT",
}: RecommendationHeroProps) {
  const pct = Math.round(probability * 100);
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (probability) * circumference;

  const color = pct >= 60 ? "#16a34a" : pct >= 30 ? "#d97706" : "#dc2626";
  const bgColor = pct >= 60 ? "rgba(22,163,74,0.1)" : pct >= 30 ? "rgba(217,119,6,0.1)" : "rgba(220,38,38,0.1)";
  const label = pct >= 60 ? "Strong" : pct >= 30 ? "Moderate" : "Low";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e5e5e5",
        padding: "2.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Eyebrow */}
      <div style={{ fontSize: "1.4rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#8e8ea0" }}>AI Visibility Score</div>

      {/* Score ring */}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              animation: "prob-fill 1.2s ease-out forwards",
              strokeDashoffset: circumference,
              animationDelay: "0.3s",
            }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "2.5rem",
              fontWeight: 500,
              color: "#171717",
              lineHeight: 1,
            }}
          >
            {pct}%
          </span>
        </div>
      </div>

      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 14px",
          borderRadius: 999,
          background: bgColor,
          fontSize: "0.75rem",
          fontWeight: 500,
          color,
        }}
      >
        {label} visibility
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "0.9rem",
          color: "#6e6e80",
          lineHeight: 1.5,
          margin: 0,
          maxWidth: 360,
        }}
      >
        {providerName} recommended{" "}
        <strong style={{ color: "#171717" }}>{businessName}</strong> in{" "}
        <strong style={{ color: "#171717" }}>{mentionCount} of {totalQueries}</strong>{" "}
        relevant queries.
      </p>

      <style jsx>{`
        @keyframes prob-fill {
          to {
            stroke-dashoffset: ${offset};
          }
        }
      `}</style>
    </motion.div>
  );
}
