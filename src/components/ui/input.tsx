"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: error ? "#dc2626" : "rgba(255,255,255,0.6)",
              marginBottom: "0.3rem",
            }}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          style={{
            width: "100%",
            background: "#1a1b21",
            border: `1px solid ${error ? "#dc2626" : isFocused ? "rgba(255,255,255,0.3)" : "#22232a"}`,
            borderRadius: "8px",
            padding: "0.7rem 0.9rem",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "0.875rem",
            color: "#ffffff",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          className={cn("placeholder:text-[rgba(255,255,255,0.25)]", className)}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {(error || helperText) && (
          <p
            style={{
              fontSize: "0.72rem",
              color: error ? "#dc2626" : "rgba(255,255,255,0.4)",
              marginTop: "0.3rem",
            }}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
