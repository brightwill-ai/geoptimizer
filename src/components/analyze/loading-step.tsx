"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LLM_PROVIDERS } from "@/lib/mock-data";
import { ProviderLogo } from "@/components/ui/provider-logo";

interface LoadingStepProps {
  businessName: string;
  onComplete: () => void;
  /** Real-time job statuses from API polling. Keys: chatgpt, claude, gemini */
  jobStatuses?: Record<string, string>;
  /** Query execution progress from API polling */
  queryProgress?: {
    completed: number;
    total: number;
    currentQueryText: string | null;
  };
  /** "fast" shows ChatGPT only, "comprehensive" shows all 3 providers */
  tier?: "fast" | "comprehensive";
}

function TypewriterQuery({ text }: { text: string }) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    if (!text) return;

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <>
      <span>{visible}</span>
      <span className="bw-typing-caret" aria-hidden>
        |
      </span>
    </>
  );
}

export function LoadingStep({ businessName, onComplete, jobStatuses, queryProgress, tier = "fast" }: LoadingStepProps) {
  const [dots, setDots] = useState("");

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Compute real progress from query executions
  const qCompleted = queryProgress?.completed ?? 0;
  const qTotal = queryProgress?.total ?? 5;
  const progress = qTotal > 0 ? (qCompleted / qTotal) * 100 : 0;

  const isComprehensive = tier === "comprehensive";
  const providers = isComprehensive ? LLM_PROVIDERS : LLM_PROVIDERS.filter((p) => p.id === "chatgpt");

  // Determine if all relevant jobs are done
  const allDone = providers.every((p) => {
    const status = jobStatuses?.[p.id];
    return status === "complete" || status === "failed";
  });
  const completedCount = providers.filter((p) => {
    const status = jobStatuses?.[p.id];
    return status === "complete" || status === "failed";
  }).length;

  // Auto-complete when all jobs finish
  useEffect(() => {
    if (allDone) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [allDone, onComplete]);

  const fillGradient = isComprehensive
    ? "linear-gradient(90deg, #10a37f, #4285f4)"
    : "#171717";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "transparent",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1.75rem",
          padding: "2.25rem",
          borderRadius: 12,
          border: "1px solid #e5e5e5",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          position: "relative",
        }}
      >
        {/* Business name */}
        <div>
          <p style={{ fontSize: "0.72rem", color: "#8e8ea0", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {isComprehensive ? "Running comprehensive analysis" : "Analyzing"}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 500,
              color: "#171717",
              margin: "0.5rem 0 0",
              letterSpacing: "-0.03em",
            }}
          >
            {businessName}
          </h2>
          {isComprehensive && (
            <p style={{ fontSize: "0.76rem", color: "#8e8ea0", margin: "8px 0 0", lineHeight: 1.5 }}>
              100+ queries across 3 AI platforms — this may take a few minutes
            </p>
          )}
        </div>

        {/* Provider badges */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {providers.map((p, index) => {
            const status = jobStatuses?.[p.id];
            const done = status === "complete" || status === "failed";
            const running = status === "running";

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + index * 0.04, duration: 0.25 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "#ffffff",
                  border: `1px solid #e5e5e5`,
                  borderLeft: running || done ? `3px solid ${p.color}` : `1px solid #e5e5e5`,
                  transition: "all 0.3s ease",
                }}
              >
                <ProviderLogo
                  provider={p.id}
                  size={15}
                  style={{
                    opacity: done || running ? 1 : 0.4,
                    transition: "opacity 0.3s",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: done || running ? "#171717" : "#8e8ea0",
                    transition: "color 0.3s",
                  }}
                >
                  {p.name}
                </span>
                {done && (
                  <span style={{ fontSize: "0.7rem", color: status === "complete" ? "#16a34a" : "#dc2626" }}>
                    {status === "complete" ? "\u2713" : "\u2715"}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Query progress + Progress bar */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "#171717",
              }}
            >
              {isComprehensive
                ? `${completedCount} of ${providers.length} platforms complete — query ${Math.min(qCompleted + 1, qTotal)} of ${qTotal}${dots}`
                : `Running query ${Math.min(qCompleted + 1, qTotal)} of ${qTotal}${dots}`}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#8e8ea0",
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.02em",
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: 8,
              borderRadius: 999,
              background: "#e5e5e5",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: fillGradient,
                transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                width: `${Math.max(progress, 3)}%`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Shimmer overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  animation: "progress-shine 1.8s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        </div>

        {/* Current query text */}
        <div
          style={{
            borderRadius: 10,
            border: "1px solid #e5e5e5",
            background: "#f7f7f8",
            padding: "1rem 1.25rem",
            minHeight: 80,
          }}
        >
          <p
            style={{
              fontSize: "0.66rem",
              color: "#6e6e80",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Current Prompt
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              color: "#171717",
              margin: "0.65rem 0 0",
              fontStyle: "italic",
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {queryProgress?.currentQueryText ? (
              <TypewriterQuery key={queryProgress.currentQueryText} text={`"${queryProgress.currentQueryText}"`} />
            ) : (
              <>
                Preparing query queue
                <span className="bw-typing-caret" aria-hidden>
                  |
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
