"use client";

export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
  maxValue?: number;
}

interface BarChartProps {
  items: BarChartItem[];
  maxValue?: number;
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  barHeight?: number;
}

export function BarChart({
  items,
  maxValue: propMax,
  showValues = true,
  valueFormatter = (v) => `${v}`,
  barHeight = 8,
}: BarChartProps) {
  const maxValue = propMax ?? Math.max(...items.map((i) => i.maxValue ?? i.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, i) => {
        const pct = Math.min((item.value / maxValue) * 100, 100);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: "0.8rem",
                color: "#6e6e80",
                width: 120,
                flexShrink: 0,
                textAlign: "right",
              }}
            >
              {item.label}
            </span>
            <div
              style={{
                flex: 1,
                height: barHeight,
                borderRadius: barHeight / 2,
                background: "#f0f0f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: barHeight / 2,
                  background: item.color ?? "#171717",
                  opacity: 0.8,
                  transition: "width 0.8s ease-out",
                }}
              />
            </div>
            {showValues && (
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#171717",
                  width: 48,
                  flexShrink: 0,
                  textAlign: "right",
                }}
              >
                {valueFormatter(item.value)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
