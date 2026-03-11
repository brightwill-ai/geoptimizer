"use client";

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
  const circumference = 2 * Math.PI * radius;
  const dashOffset = 100 - clampedScore;

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
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            pathLength={100}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={dashOffset}
            style={animated ? {
              animation: "score-fill 1s ease-out forwards",
              strokeDashoffset: 100,
              animationDelay: "0.3s",
            } : { strokeDashoffset: dashOffset }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans, var(--font-sans))",
            fontSize: size * 0.28,
            fontWeight: 500,
            color: "#ffffff",
          }}
        >
          {clampedScore}
        </div>
      </div>
      {label && (
        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#ffffff" }}>{label}</span>
      )}
      {sublabel && (
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{sublabel}</span>
      )}
      <style jsx>{`
        @keyframes score-fill {
          to {
            stroke-dashoffset: ${dashOffset};
          }
        }
      `}</style>
    </div>
  );
}
