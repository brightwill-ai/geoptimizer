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
              color: error ? "#dc2626" : "#6e6e80",
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
            background: "#f7f7f8",
            border: `1px solid ${error ? "#dc2626" : isFocused ? "#171717" : "#e5e5e5"}`,
            borderRadius: "8px",
            padding: "0.7rem 0.9rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            color: "#171717",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: isFocused ? "0 0 0 3px rgba(23,23,23,0.06)" : "none",
          }}
          className={cn("placeholder:text-[#8e8ea0]", className)}
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
              color: error ? "#dc2626" : "#8e8ea0",
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
