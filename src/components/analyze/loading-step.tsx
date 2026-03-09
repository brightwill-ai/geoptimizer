"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Business name */}
        <div>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: "0 0 4px 0" }}>
            {isComprehensive ? "Running comprehensive analysis" : "Analyzing"}
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
            }}
          >
            {businessName}
          </h2>
          {isComprehensive && (
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", margin: "6px 0 0" }}>
              40+ queries across 3 AI platforms — this may take a few minutes
            </p>
          )}
        </div>

        {/* Provider badges */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {providers.map((p) => {
            const status = jobStatuses?.[p.id];
            const done = status === "complete" || status === "failed";
            const running = status === "running";

            return (
              <div
                key={p.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: done ? "#14151a" : running ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${done ? "#22232a" : running ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: running ? "0 2px 12px rgba(0,0,0,0.3)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <ProviderLogo
                  provider={p.id}
                  size={16}
                  style={{
                    opacity: done || running ? 1 : 0.4,
                    transition: "opacity 0.3s",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
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
              </div>
            );
          })}
        </div>

        {/* Query progress counter */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#ffffff",
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
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 2,
                background: "#ffffff",
                transition: "width 0.5s ease-out",
                width: `${Math.max(progress, 5)}%`,
              }}
            />
          </div>
        </div>

        {/* Current query text */}
        <div style={{ height: 40, position: "relative", width: "100%" }}>
          <AnimatePresence mode="wait">
            {queryProgress?.currentQueryText && (
              <motion.p
                key={queryProgress.currentQueryText}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.4)",
                  margin: 0,
                  fontStyle: "italic",
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                &ldquo;{queryProgress.currentQueryText}&rdquo;
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
