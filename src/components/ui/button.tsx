"use client";

import { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = {
      fontFamily: "'Instrument Sans', sans-serif",
      fontWeight: 500,
      borderRadius: "8px",
      cursor: disabled || isLoading ? "not-allowed" : "pointer",
      opacity: disabled || isLoading ? 0.5 : 1,
      transition: "all 0.15s",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      border: "none",
    };

    const variantStyles = {
      primary: {
        background: "#ffffff",
        color: "#0c0d10",
      },
      secondary: {
        background: "transparent",
        color: "#ffffff",
        border: "1px solid #22232a",
      },
      outline: {
        background: "transparent",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.2)",
      },
    };

    const sizeStyles = {
      sm: {
        padding: "0.45rem 1rem",
        fontSize: "0.875rem",
      },
      md: {
        padding: "0.55rem 1.25rem",
        fontSize: "0.875rem",
      },
      lg: {
        padding: "0.75rem 2rem",
        fontSize: "0.95rem",
        fontWeight: 600,
      },
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        if (variant === "primary") {
          e.currentTarget.style.opacity = "0.85";
          e.currentTarget.style.transform = "translateY(-1px)";
        } else {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        }
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateY(0)";
        if (variant !== "primary") {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor =
            variant === "outline" ? "rgba(255,255,255,0.2)" : "#22232a";
        }
      }
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          ...sizeStyles[size],
        }}
        className={className}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
