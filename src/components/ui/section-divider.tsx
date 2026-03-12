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
        height: 2,
        backgroundImage:
          "repeating-radial-gradient(circle, rgba(0,0,0,0.12) 0 1px, transparent 1px 6px)",
        backgroundSize: "6px 100%",
        backgroundPosition: "center",
        ...style,
      }}
    />
  );
}
