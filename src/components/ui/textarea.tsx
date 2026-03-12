"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
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
        <textarea
          id={textareaId}
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
            resize: "none",
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

Textarea.displayName = "Textarea";

export { Textarea };
