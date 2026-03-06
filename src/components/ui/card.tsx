"use client";

import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ style, variant = "default", children, ...props }, ref) => {
    const baseStyles = {
      background: "#faf9f7",
      borderRadius: "24px",
      border: "1px solid #dddbd7",
      transition: "all 0.3s ease-out",
    };

    const variantStyles = {
      default: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      },
      elevated: {
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
      },
      interactive: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        cursor: "pointer",
      },
    };

    return (
      <div
        ref={ref}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, ...props }, ref) => (
  <div
    ref={ref}
    style={{ padding: "1.5rem 1.5rem 1rem", ...style }}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ style, ...props }, ref) => (
  <h3
    ref={ref}
    style={{
      fontFamily: "'Instrument Serif', serif",
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "#0c0c0b",
      lineHeight: 1.3,
      ...style,
    }}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ style, ...props }, ref) => (
  <p
    ref={ref}
    style={{
      color: "#9a9793",
      marginTop: "0.375rem",
      fontSize: "0.875rem",
      ...style,
    }}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, ...props }, ref) => (
  <div ref={ref} style={{ padding: "0 1.5rem 1.5rem", ...style }} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      padding: "1rem 1.5rem 1.5rem",
      borderTop: "1px solid #dddbd7",
      display: "flex",
      alignItems: "center",
      ...style,
    }}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
