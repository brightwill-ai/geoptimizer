"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActionPlanItemData } from "@/lib/mock-data";

const PRIORITY_CONFIG = {
  critical: { color: "#dc2626", bg: "rgba(220,38,38,0.2)", label: "Critical" },
  high: { color: "#d97706", bg: "rgba(217,119,6,0.2)", label: "High" },
  medium: { color: "rgba(255,255,255,0.7)", bg: "rgba(255,255,255,0.08)", label: "Medium" },
  low: { color: "#16a34a", bg: "rgba(22,163,74,0.2)", label: "Low" },
} as const;

const EFFORT_CONFIG = {
  quick_win: { label: "Quick Win", icon: "⚡" },
  half_day: { label: "Half Day", icon: "🕐" },
  "1_2_days": { label: "1-2 Days", icon: "📅" },
  "1_week": { label: "~1 Week", icon: "📆" },
  ongoing: { label: "Ongoing", icon: "🔄" },
} as const;

interface ActionPlanItemProps {
  item: ActionPlanItemData;
  analysisId: string;
  onToggle: (id: string, completed: boolean) => void;
}

export function ActionPlanItem({ item, analysisId, onToggle }: ActionPlanItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const priority = PRIORITY_CONFIG[item.priority];
  const effort = EFFORT_CONFIG[item.effort];

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    const newState = !item.completed;
    onToggle(item.id, newState);

    try {
      await fetch(`/api/analysis/${analysisId}/action-plan/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newState }),
      });
    } catch {
      // Revert on failure
      onToggle(item.id, !newState);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "12px 16px",
        borderRadius: 8,
        background: item.completed ? "rgba(255,255,255,0.02)" : "transparent",
        transition: "background 0.2s",
      }}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        style={{
          width: 22,
          height: 22,
          minWidth: 22,
          marginTop: 1,
          borderRadius: 6,
          border: item.completed
            ? "2px solid #16a34a"
            : "2px solid rgba(255,255,255,0.2)",
          background: item.completed ? "rgba(22,163,74,0.2)" : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          padding: 0,
        }}
      >
        {item.completed && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="#16a34a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: "pointer" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                padding: "1px 8px",
                borderRadius: 999,
                background: priority.bg,
                fontSize: "0.65rem",
                fontWeight: 500,
                color: priority.color,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {priority.label}
            </span>
            <span
              style={{
                display: "inline-flex",
                padding: "1px 8px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {effort.icon} {effort.label}
            </span>
          </div>

          <p
            style={{
              fontSize: "0.84rem",
              fontWeight: 500,
              color: item.completed ? "rgba(255,255,255,0.35)" : "#ffffff",
              lineHeight: 1.45,
              margin: 0,
              textDecoration: item.completed ? "line-through" : "none",
              transition: "color 0.2s",
            }}
          >
            {item.title}
          </p>
        </div>

        {/* Expandable details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingTop: 10 }}>
                {/* Description */}
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.55,
                    margin: "0 0 8px 0",
                  }}
                >
                  {item.description}
                </p>

                {/* Reasoning */}
                <p
                  style={{
                    fontSize: "0.76rem",
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: 1.5,
                    margin: "0 0 10px 0",
                    fontStyle: "italic",
                  }}
                >
                  {item.reasoning}
                </p>

                {/* Data points */}
                {item.dataPoints.length > 0 && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      borderLeft: "3px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {item.dataPoints.map((dp, i) => (
                      <p
                        key={i}
                        style={{
                          fontSize: "0.74rem",
                          color: "rgba(255,255,255,0.5)",
                          margin: i < item.dataPoints.length - 1 ? "0 0 4px 0" : 0,
                          lineHeight: 1.4,
                        }}
                      >
                        • {dp}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
