"use client";

interface SectionDividerProps {
  spacing?: number;
  style?: React.CSSProperties;
  theme?: "dark" | "light";
}

export function SectionDivider({ spacing = 2.5, style, theme = "dark" }: SectionDividerProps) {
  return (
    <div
      style={{
        maxWidth: 1140,
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: `${spacing}rem`,
        marginBottom: `${spacing}rem`,
        borderTop:
          theme === "light"
            ? "1px dashed rgba(0,0,0,0.12)"
            : "1px dashed rgba(255,255,255,.15)",
        ...style,
      }}
    />
  );
}
