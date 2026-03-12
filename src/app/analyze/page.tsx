"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { type GEOAnalysis, type ActionPlan as ActionPlanType } from "@/lib/mock-data";
import { AnalyzeThemeProvider } from "@/contexts/analyze-theme";
import { SearchStep } from "@/components/analyze/search-step";
import { LoadingStep } from "@/components/analyze/loading-step";
import { PartialReport } from "@/components/analyze/partial-report";
import { EmailGate } from "@/components/analyze/email-gate";
import { FullReport } from "@/components/analyze/full-report";
import { LandingNav } from "@/components/ui/landing-nav";

type Step = "search" | "loading" | "partial" | "email-gate" | "full";

export default function AnalyzePage() {
  const [step, setStep] = useState<Step>("search");
  const [businessName, setBusinessName] = useState("");
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<GEOAnalysis | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlanType | null>(null);
  const [actionPlanStatus, setActionPlanStatus] = useState<string>("pending");
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({});
  const [queryProgress, setQueryProgress] = useState<{
    completed: number;
    total: number;
    currentQueryText: string | null;
  }>({ completed: 0, total: 5, currentQueryText: null });
  const [tier, setTier] = useState<"fast" | "comprehensive">("fast");
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (id: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/analysis/${id}`);
        if (!res.ok) return;
        const data = await res.json();

        setJobStatuses(data.jobStatuses || {});
        if (data.queryProgress) setQueryProgress(data.queryProgress);

        if (data.status === "complete" && data.result) {
          stopPolling();
          setAnalysis(data.result);
          if (data.actionPlan) setActionPlan(data.actionPlan);
          if (data.actionPlanStatus) setActionPlanStatus(data.actionPlanStatus);
          // Don't transition here — LoadingStep will call onComplete
        } else if (data.status === "failed") {
          stopPolling();
          setError(data.errorMessage || "Analysis failed");
          setStep("search");
        }
      } catch {
        // Silently retry on next poll
      }
    }, 2000);
  };

  const handleSearch = async (name: string, location: string, category: string) => {
    setBusinessName(name);
    setTier("fast");
    setError(null);
    setJobStatuses({});
    setQueryProgress({ completed: 0, total: 5, currentQueryText: null });
    setAnalysis(null);
    setActionPlan(null);
    setActionPlanStatus("pending");
    setStep("loading");

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: name, location, category, tier: "fast" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start analysis");
        setStep("search");
        return;
      }

      setAnalysisId(data.id);

      if (data.status === "complete" && data.result) {
        // Cached result — skip loading
        setAnalysis(data.result);
        setStep("partial");
      } else {
        // Start polling
        startPolling(data.id);
      }
    } catch {
      setError("Failed to connect. Please try again.");
      setStep("search");
    }
  };

  const handleLoadingComplete = useCallback(() => {
    if (analysis) {
      setStep(tier === "comprehensive" ? "full" : "partial");
    }
  }, [analysis, tier]);

  const handleEmailSubmit = (comprehensiveAnalysisId: string) => {
    setTier("comprehensive");
    setAnalysisId(comprehensiveAnalysisId);
    setAnalysis(null);
    setQueryProgress({ completed: 0, total: 100, currentQueryText: null });
    setStep("loading");
    startPolling(comprehensiveAnalysisId);
  };

  return (
    <AnalyzeThemeProvider theme="light">
      <div data-theme="light" style={{ minHeight: "100vh", background: "#ffffff" }}>
        <LandingNav cta={{ label: "Join waitlist", href: "/signup" }} />
        <div style={{ paddingTop: 72 }}>
          {error && step === "search" && (
            <div
              style={{
                maxWidth: 560,
                margin: "1rem auto",
                padding: "0.75rem 1rem",
                borderRadius: 8,
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "#dc2626",
                fontSize: "0.8rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <SearchStep onSubmit={handleSearch} />
              </motion.div>
            )}
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <LoadingStep
                  businessName={businessName}
                  onComplete={handleLoadingComplete}
                  jobStatuses={jobStatuses}
                  queryProgress={queryProgress}
                  tier={tier}
                />
              </motion.div>
            )}
            {step === "partial" && analysis && (
              <motion.div
                key="partial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <PartialReport
                  analysis={analysis}
                  onUnlock={() => setStep("email-gate")}
                />
              </motion.div>
            )}
            {step === "full" && analysis && (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <FullReport
                  analysis={analysis}
                  analysisId={analysisId ?? undefined}
                  actionPlan={actionPlan}
                  actionPlanStatus={actionPlanStatus}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email gate rendered as overlay */}
          <AnimatePresence>
            {step === "email-gate" && analysisId && (
              <EmailGate
                key="email-gate"
                analysisId={analysisId}
                onSubmit={handleEmailSubmit}
                onClose={() => setStep("partial")}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnalyzeThemeProvider>
  );
}
