"use client";

import { useState, useEffect, useRef } from "react";

interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  animated?: boolean;
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  animated = true,
}: ScoreRingProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const dashOffset = 100 - clampedScore;
  const hasAnimated = useRef(false);
  const [currentOffset, setCurrentOffset] = useState(animated ? 100 : dashOffset);

  useEffect(() => {
    if (animated && !hasAnimated.current) {
      hasAnimated.current = true;
      const timer = setTimeout(() => setCurrentOffset(dashOffset), 50);
      return () => clearTimeout(timer);
    } else {
      setCurrentOffset(dashOffset);
    }
  }, [animated, dashOffset]);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            pathLength={100}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#171717"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={currentOffset}
            style={{
              transition: animated ? "stroke-dashoffset 1s ease-out" : "none",
            }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans)",
            fontSize: size * 0.28,
            fontWeight: 500,
            color: "#171717",
          }}
        >
          {clampedScore}
        </div>
      </div>
      {label && (
        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#171717" }}>{label}</span>
      )}
      {sublabel && (
        <span style={{ fontSize: "0.75rem", color: "#8e8ea0" }}>{sublabel}</span>
      )}
    </div>
  );
}
