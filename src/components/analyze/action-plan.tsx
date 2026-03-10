"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { ActionPlan as ActionPlanType } from "@/lib/mock-data";
import { ActionPlanCategorySection } from "./action-plan-category";

interface ActionPlanProps {
  analysisId: string;
  /** Pre-loaded action plan from the analysis response (avoids extra fetch) */
  initialActionPlan?: ActionPlanType | null;
  actionPlanStatus?: string;
}

export function ActionPlan({ analysisId, initialActionPlan, actionPlanStatus }: ActionPlanProps) {
  const [plan, setPlan] = useState<ActionPlanType | null>(initialActionPlan ?? null);
  const [status, setStatus] = useState(actionPlanStatus ?? "pending");
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");

  // Fetch live data if we don't have initial plan
  useEffect(() => {
    if (plan) return;
    if (status === "complete") {
      fetch(`/api/analysis/${analysisId}/action-plan`)
        .then((r) => r.json())
        .then((data) => {
          if (data.actionPlan) {
            setPlan(data.actionPlan);
            setStatus("complete");
          }
        })
        .catch(() => {});
    }
  }, [analysisId, plan, status]);

  // Handle item toggle (optimistic update)
  const handleItemToggle = useCallback((itemId: string, completed: boolean) => {
    setPlan((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      let totalCompleted = 0;
      updated.categories = updated.categories.map((cat) => {
        const updatedCat = { ...cat };
        let catCompleted = 0;
        updatedCat.items = cat.items.map((item) => {
          const updatedItem = item.id === itemId ? { ...item, completed } : item;
          if (updatedItem.completed) catCompleted++;
          return updatedItem;
        });
        updatedCat.completedCount = catCompleted;
        totalCompleted += catCompleted;
        return updatedCat;
      });
      updated.completedItems = totalCompleted;
      return updated;
    });
  }, []);

  // Generate/retry action plan
  const handleGenerate = async () => {
    setGenerating(true);
    setStatus("generating");
    try {
      const res = await fetch(`/api/analysis/${analysisId}/action-plan`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.actionPlan) {
        setPlan(data.actionPlan);
        setStatus("complete");
      } else {
        setStatus("failed");
      }
    } catch {
      setStatus("failed");
    } finally {
      setGenerating(false);
    }
  };

  // Filter categories
  const filteredCategories = plan?.categories.filter((cat) => {
    if (filter === "all") return true;
    return cat.items.some((item) => item.priority === filter);
  }) ?? [];

  // Loading / generating state
  if (status === "generating") {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "rgba(255,255,255,0.5)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
          Generating your personalized action plan...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Failed or pending — show generate button
  if (status === "failed" || (status === "pending" && !plan)) {
    return (
      <div
        style={{
          background: "#14151a",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", margin: "0 0 16px" }}>
          {status === "failed"
            ? "Action plan generation failed. Click below to retry."
            : "Generate a comprehensive GEO optimization action plan based on your analysis."}
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: "#ffffff",
            color: "#0c0d10",
            border: "none",
            fontSize: "0.84rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {status === "failed" ? "Retry Generation" : "Generate Action Plan"}
        </button>
      </div>
    );
  }

  if (!plan) return null;

  const completionPct = plan.totalItems > 0
    ? Math.round((plan.completedItems / plan.totalItems) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Section header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h3
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "rgba(255,255,255,0.4)",
            margin: "0 0 12px 0",
          }}
        >
          GEO Action Plan
        </h3>
      </div>

      {/* Progress dashboard */}
      <div
        style={{
          background: "#14151a",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "24px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          {/* Completion ring */}
          <div style={{ position: "relative", width: 72, height: 72 }}>
            <svg width={72} height={72} viewBox="0 0 72 72">
              <circle
                cx={36}
                cy={36}
                r={30}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={5}
              />
              <circle
                cx={36}
                cy={36}
                r={30}
                fill="none"
                stroke={completionPct === 100 ? "#16a34a" : "#ffffff"}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={`${(completionPct / 100) * 188.5} 188.5`}
                transform="rotate(-90 36 36)"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {completionPct}%
            </div>
          </div>

          {/* Stats */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  {plan.completedItems}/{plan.totalItems}
                </p>
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  Items Completed
                </p>
              </div>
              <div>
                <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  {plan.categories.length}
                </p>
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  Categories
                </p>
              </div>
              <div>
                <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  {plan.estimatedTotalEffort}
                </p>
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  Est. Total Effort
                </p>
              </div>
            </div>

            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.4 }}>
              Personalized action plan based on your GEO analysis findings across all AI engines.
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {(["all", "critical", "high", "medium", "low"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              border: filter === f
                ? "1px solid rgba(255,255,255,0.2)"
                : "1px solid rgba(255,255,255,0.06)",
              background: filter === f ? "rgba(255,255,255,0.08)" : "transparent",
              color: filter === f ? "#ffffff" : "rgba(255,255,255,0.4)",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Category list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredCategories.map((cat, idx) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <ActionPlanCategorySection
              category={
                filter === "all"
                  ? cat
                  : {
                      ...cat,
                      items: cat.items.filter((item) => item.priority === filter),
                    }
              }
              analysisId={analysisId}
              defaultOpen={idx === 0}
              onItemToggle={handleItemToggle}
            />
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "28px 24px",
          textAlign: "center",
          marginTop: 24,
        }}
      >
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 8px",
          }}
        >
          Need help implementing this plan?
        </p>
        <p
          style={{
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.5)",
            margin: "0 0 16px",
            lineHeight: 1.45,
          }}
        >
          BrightWill can execute every item in this action plan for you — from technical SEO to content creation and authority building.
        </p>
        <a
          href="/signup"
          style={{
            display: "inline-block",
            padding: "10px 28px",
            borderRadius: 8,
            background: "#ffffff",
            color: "#0c0d10",
            fontSize: "0.84rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Get Started
        </a>
      </div>
    </motion.div>
  );
}
