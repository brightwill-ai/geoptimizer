"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingStepProps {
  businessName: string;
  onComplete: () => void;
}

const STAGES = [
  { message: "Searching ChatGPT", icon: "#10a37f" },
  { message: "Querying Claude", icon: "#c084fc" },
  { message: "Checking Gemini", icon: "#4285f4" },
  { message: "Scanning Perplexity", icon: "#ff6b35" },
  { message: "Analyzing citations & sentiment", icon: null },
  { message: "Generating your report", icon: null },
];

const STAGE_DURATION = 1100;
const TOTAL_DURATION = STAGES.length * STAGE_DURATION;

export function LoadingStep({ businessName, onComplete }: LoadingStepProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= STAGES.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, STAGE_DURATION);

    const timeout = setTimeout(onComplete, TOTAL_DURATION + 400);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

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
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {STAGES.slice(0, 4).map((stage, i) => (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 999,
                background: currentStage >= i ? "#ffffff" : "rgba(255,255,255,0.5)",
                border: `1px solid ${currentStage >= i ? "#dddbd7" : "transparent"}`,
                boxShadow: currentStage === i ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.3s ease",
                transform: currentStage === i ? "scale(1.05)" : "scale(1)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: stage.icon!,
                  opacity: currentStage >= i ? 1 : 0.3,
                  transition: "opacity 0.3s",
                }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: currentStage >= i ? "#0c0c0b" : "#9a9793",
                  transition: "color 0.3s",
                }}
              >
                {stage.message.split(" ").pop()}
              </span>
            </div>
          ))}
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
              transition: `width ${STAGE_DURATION}ms linear`,
              width: `${((currentStage + 1) / STAGES.length) * 100}%`,
            }}
          />
        </div>

        {/* Current stage message */}
        <div style={{ height: 24, position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStage}
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
              {STAGES[currentStage].message}...
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
