"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActionPlanCategory as ActionPlanCategoryType } from "@/lib/mock-data";
import { ActionPlanItem } from "./action-plan-item";

const PRIORITY_COLOR = {
  critical: "#dc2626",
  high: "#d97706",
  medium: "rgba(255,255,255,0.5)",
  low: "#16a34a",
} as const;

interface ActionPlanCategoryProps {
  category: ActionPlanCategoryType;
  analysisId: string;
  defaultOpen?: boolean;
  onItemToggle: (itemId: string, completed: boolean) => void;
}

export function ActionPlanCategorySection({
  category,
  analysisId,
  defaultOpen = false,
  onItemToggle,
}: ActionPlanCategoryProps) {
  const [open, setOpen] = useState(defaultOpen);
  const completionPct = category.items.length > 0
    ? Math.round((category.completedCount / category.items.length) * 100)
    : 0;

  return (
    <div
      style={{
        background: "#14151a",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Chevron */}
        <motion.svg
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          width={16}
          height={16}
          viewBox="0 0 16 16"
          fill="none"
          style={{ minWidth: 16 }}
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>

        {/* Label + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              {category.label}
            </span>
            <span
              style={{
                display: "inline-flex",
                padding: "1px 8px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {category.items.length} items
            </span>
            <span
              style={{
                display: "inline-flex",
                padding: "1px 8px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              {category.estimatedEffort}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${completionPct}%`,
                  height: "100%",
                  borderRadius: 2,
                  background: completionPct === 100 ? "#16a34a" : PRIORITY_COLOR[category.priority],
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.4)",
                minWidth: 36,
                textAlign: "right",
              }}
            >
              {completionPct}%
            </span>
          </div>
        </div>
      </button>

      {/* Items */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.04)",
                padding: "8px 8px 12px",
              }}
            >
              {/* Category description */}
              <p
                style={{
                  fontSize: "0.76rem",
                  color: "rgba(255,255,255,0.4)",
                  margin: "4px 16px 12px",
                  lineHeight: 1.45,
                }}
              >
                {category.description}
              </p>

              {/* Item list */}
              {category.items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                >
                  <ActionPlanItem
                    item={item}
                    analysisId={analysisId}
                    onToggle={onItemToggle}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
