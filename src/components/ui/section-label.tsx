"use client";

interface SectionLabelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        ...style,
      }}
    >
      {/* 3-line menu icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        style={{ opacity: 0.4 }}
      >
        <rect x="2" y="3" width="10" height="1.2" rx="0.6" fill="currentColor" />
        <rect x="2" y="6.4" width="10" height="1.2" rx="0.6" fill="currentColor" />
        <rect x="2" y="9.8" width="10" height="1.2" rx="0.6" fill="currentColor" />
      </svg>
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {children}
      </span>
    </div>
  );
}
