"use client";

interface SectionDividerProps {
  spacing?: number;
  style?: React.CSSProperties;
}

export function SectionDivider({ spacing = 2.5, style }: SectionDividerProps) {
  return (
    <div
      style={{
        maxWidth: 1140,
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: `${spacing}rem`,
        marginBottom: `${spacing}rem`,
        borderTop: "1px dashed rgba(255,255,255,.15)",
        ...style,
      }}
    />
  );
}
