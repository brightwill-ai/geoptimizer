"use client";

interface MetricCardProps {
  label: string;
  value?: string | number;
  sublabel?: string;
  trend?: number; // positive = up, negative = down
  children?: React.ReactNode;
}

export function MetricCard({ label, value, sublabel, trend, children }: MetricCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #dddbd7",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#9a9793",
          }}
        >
          {label}
        </span>
        {trend !== undefined && (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: trend >= 0 ? "#16a34a" : "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "#0c0c0b",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      {sublabel && (
        <span style={{ fontSize: "0.75rem", color: "#9a9793" }}>{sublabel}</span>
      )}
      {children}
    </div>
  );
}
