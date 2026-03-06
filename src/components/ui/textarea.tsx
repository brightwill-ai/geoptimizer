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
              color: error ? "#dc2626" : "#3a3936",
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
            background: "white",
            border: `1px solid ${error ? "#dc2626" : isFocused ? "#0c0c0b" : "#dddbd7"}`,
            borderRadius: "10px",
            padding: "0.7rem 0.9rem",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "0.875rem",
            color: "#0c0c0b",
            outline: "none",
            transition: "border-color 0.15s",
            resize: "none",
          }}
          className={cn("placeholder:text-[#c0bdb8]", className)}
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
              color: error ? "#dc2626" : "#9a9793",
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
