"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingStepProps {
  businessName: string;
  onComplete: () => void;
  /** Real-time job statuses from API polling. Keys: chatgpt, claude, gemini, perplexity */
  jobStatuses?: Record<string, string>;
}

const LLM_BADGES = [
  { id: "chatgpt", name: "ChatGPT", color: "#10a37f" },
  { id: "claude", name: "Claude", color: "#c084fc" },
  { id: "gemini", name: "Gemini", color: "#4285f4" },
];

const MESSAGES = [
  "Querying AI engines",
  "Analyzing citations",
  "Evaluating sentiment",
  "Comparing competitors",
  "Generating report",
];

export function LoadingStep({ businessName, onComplete, jobStatuses }: LoadingStepProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Compute real progress from job statuses
  const completedCount = jobStatuses
    ? LLM_BADGES.filter((b) => jobStatuses[b.id] === "complete" || jobStatuses[b.id] === "failed").length
    : 0;
  const totalJobs = LLM_BADGES.length;
  const progress = jobStatuses ? (completedCount / totalJobs) * 100 : 0;

  // If no real statuses (mock mode), check if parent will call onComplete
  // Otherwise auto-complete when all jobs done
  useEffect(() => {
    if (jobStatuses && completedCount >= totalJobs) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [jobStatuses, completedCount, totalJobs, onComplete]);

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
        background: "linear-gradient(180deg, #f0eeea 0%, #e8e4f0 50%, #ddd6ee 100%)",
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
          <p style={{ fontSize: "0.8rem", color: "#9a9793", margin: "0 0 4px 0" }}>Analyzing</p>
          <h2
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#0c0c0b",
              margin: 0,
            }}
          >
            {businessName}
          </h2>
        </div>

        {/* LLM badges */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {LLM_BADGES.map((badge) => {
            const status = jobStatuses?.[badge.id];
            const isDone = status === "complete" || status === "failed";
            const isRunning = status === "running";

            return (
              <div
                key={badge.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: isDone ? "#ffffff" : isRunning ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${isDone ? "#dddbd7" : "transparent"}`,
                  boxShadow: isRunning ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.3s ease",
                  transform: isRunning ? "scale(1.05)" : "scale(1)",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: badge.color,
                    opacity: isDone ? 1 : isRunning ? 0.8 : 0.3,
                    transition: "opacity 0.3s",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: isDone ? "#0c0c0b" : isRunning ? "#3a3936" : "#9a9793",
                    transition: "color 0.3s",
                  }}
                >
                  {badge.name}
                </span>
                {isDone && (
                  <span style={{ fontSize: "0.65rem", color: "#16a34a" }}>✓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: 3,
            borderRadius: 2,
            background: "#dddbd7",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              background: "#0c0c0b",
              transition: "width 0.5s ease-out",
              width: `${Math.max(progress, 5)}%`,
            }}
          />
        </div>

        {/* Current message */}
        <div style={{ height: 24, position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{
                fontSize: "0.85rem",
                color: "#9a9793",
                margin: 0,
              }}
            >
              {MESSAGES[messageIndex]}...
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
