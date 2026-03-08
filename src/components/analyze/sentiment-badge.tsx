"use client";

interface SentimentBadgeProps {
  sentiment: "positive" | "neutral" | "negative";
  size?: "sm" | "md";
}

const colors = {
  positive: { bg: "#dcfce7", text: "#16a34a" },
  neutral: { bg: "#fef3c7", text: "#d97706" },
  negative: { bg: "#fee2e2", text: "#dc2626" },
};

const labels = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

export function SentimentBadge({ sentiment, size = "sm" }: SentimentBadgeProps) {
  const c = colors[sentiment];
  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: isSmall ? "2px 8px" : "4px 12px",
        borderRadius: 999,
        background: c.bg,
        color: c.text,
        fontSize: isSmall ? "0.7rem" : "0.8rem",
        fontWeight: 600,
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.text,
        }}
      />
      {labels[sentiment]}
    </span>
  );
}
