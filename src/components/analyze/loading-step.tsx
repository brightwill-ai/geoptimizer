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
        background: "#0c0d10",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1.2rem",
          borderRadius: 12,
          border: "1px solid #22232a",
          background: "#14151a",
        }}
      >
        {/* Business name */}
        <div>
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {isComprehensive ? "Running comprehensive analysis" : "Analyzing"}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 500,
              color: "#ffffff",
              margin: "0.5rem 0 0",
              letterSpacing: "-0.03em",
            }}
          >
            {businessName}
          </h2>
          {isComprehensive && (
            <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.42)", margin: "6px 0 0" }}>
              40+ queries across 3 AI platforms — this may take a few minutes
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
                  padding: "7px 14px",
                  borderRadius: 999,
                  background: done ? "#14151a" : running ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${done ? "#22232a" : running ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: running ? "0 2px 12px rgba(0,0,0,0.3)" : "none",
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
                    color: done || running ? "#ffffff" : "rgba(255,255,255,0.4)",
                    transition: "color 0.3s",
                  }}
                >
                  {p.name}
                </span>
                {done && (
                  <span style={{ fontSize: "0.7rem", color: status === "complete" ? "#16a34a" : "#dc2626" }}>
                    {status === "complete" ? "✓" : "✕"}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Query progress counter */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {isComprehensive
              ? `${completedCount} of ${providers.length} platforms complete — query ${Math.min(qCompleted + 1, qTotal)} of ${qTotal}${dots}`
              : `Running query ${Math.min(qCompleted + 1, qTotal)} of ${qTotal}${dots}`}
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: 6,
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: "#ffffff",
                transition: "width 0.45s ease-out",
                width: `${Math.max(progress, 4)}%`,
              }}
            />
          </div>
        </div>

        {/* Current query text */}
        <div
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            padding: "0.78rem 0.9rem",
            minHeight: 74,
          }}
        >
          <p
            style={{
              fontSize: "0.66rem",
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Current Prompt
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.72)",
              margin: "0.55rem 0 0",
              fontStyle: "italic",
              lineHeight: 1.45,
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
