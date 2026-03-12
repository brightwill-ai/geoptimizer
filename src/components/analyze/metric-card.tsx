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
        borderRadius: 12,
        border: "1px solid #e5e5e5",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#8e8ea0",
          }}
        >
          {label}
        </span>
        {trend !== undefined && (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 500,
              color: trend >= 0 ? "#16a34a" : "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {trend >= 0 ? "\u2191" : "\u2193"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: "2rem",
          fontWeight: 500,
          color: "#171717",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      {sublabel && (
        <span style={{ fontSize: "0.75rem", color: "#8e8ea0" }}>{sublabel}</span>
      )}
      {children}
    </div>
  );
}
