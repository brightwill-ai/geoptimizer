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
  const bgColor = pct >= 60 ? "rgba(22,163,74,0.15)" : pct >= 30 ? "rgba(217,119,6,0.15)" : "rgba(220,38,38,0.15)";
  const label = pct >= 60 ? "Strong" : pct >= 30 ? "Moderate" : "Low";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        background: "#14151a",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "2.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
        textAlign: "center",
      }}
    >
      {/* Eyebrow */}
      <div style={{ fontSize: "1.4rem", fontWeight: 500, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.4)" }}>Recommendation Probability</div>

      {/* Score ring */}
      <div style={{ position: "relative", width: size, height: size, filter: `drop-shadow(0 0 20px ${color}40)` }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
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
              color: "#ffffff",
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
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.5,
          margin: 0,
          maxWidth: 360,
        }}
      >
        {providerName} recommended{" "}
        <strong style={{ color: "#ffffff" }}>{businessName}</strong> in{" "}
        <strong style={{ color: "#ffffff" }}>{mentionCount} of {totalQueries}</strong>{" "}
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
