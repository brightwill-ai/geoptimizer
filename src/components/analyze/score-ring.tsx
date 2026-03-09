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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
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
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={animated ? {
              animation: "score-fill 1s ease-out forwards",
              strokeDashoffset: circumference,
              animationDelay: "0.3s",
            } : { strokeDashoffset: offset }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans, 'Instrument Sans', sans-serif)",
            fontSize: size * 0.28,
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          {score}
        </div>
      </div>
      {label && (
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>{label}</span>
      )}
      {sublabel && (
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{sublabel}</span>
      )}
      <style jsx>{`
        @keyframes score-fill {
          to {
            stroke-dashoffset: ${offset};
          }
        }
      `}</style>
    </div>
  );
}
