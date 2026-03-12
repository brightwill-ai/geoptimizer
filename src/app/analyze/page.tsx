"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { type GEOAnalysis, type ActionPlan as ActionPlanType } from "@/lib/mock-data";
import { SearchStep } from "@/components/analyze/search-step";
import { LoadingStep } from "@/components/analyze/loading-step";
import { PartialReport } from "@/components/analyze/partial-report";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { EmailGate } from "@/components/analyze/email-gate";
import { FullReport } from "@/components/analyze/full-report";

type Step = "search" | "loading" | "partial" | "email-gate" | "full";

function Nav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
        height: "60px",
        background: "transparent",
        backdropFilter: "none",
        borderBottom: "none",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          fontSize: "1.05rem",
          letterSpacing: "-0.02em",
          color: "#171717",
          textDecoration: "none",
        }}
      >
        BrightWill
      </Link>

      <ul
        className="nav-links"
        style={{
          display: "flex",
          gap: "2rem",
          listStyle: "none",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <li>
          <Link href="/#features" className="nav-link">
            Features
          </Link>
        </li>
        <li>
          <Link href="/#how" className="nav-link">
            How it works
          </Link>
        </li>
        <li>
          <Link href="/#pricing" className="nav-link">
            Pricing
          </Link>
        </li>
      </ul>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Link href="/signup" className="btn-pill">
          Join waitlist
        </Link>
      </div>
    </nav>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzePageInner />
    </Suspense>
  );
}

function AnalyzePageInner() {
  const searchParams = useSearchParams();
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
  const stripeHandled = useRef(false);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Handle Stripe redirect-back: complete payment → start comprehensive audit
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const returnedAnalysisId = searchParams.get("analysis_id");
    const emailParam = searchParams.get("email");

    if (!sessionId || !returnedAnalysisId || stripeHandled.current) return;
    stripeHandled.current = true;

    const email =
      emailParam ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("bw_checkout_email") || ""
        : "");
    const name =
      typeof window !== "undefined"
        ? sessionStorage.getItem("bw_checkout_name") || ""
        : "";

    // Claim the analysis with Stripe session verification
    (async () => {
      try {
        setTier("comprehensive");
        setStep("loading");
        setQueryProgress({ completed: 0, total: 100, currentQueryText: null });

        const res = await fetch(`/api/analysis/${returnedAnalysisId}/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: name || undefined,
            stripeSessionId: sessionId === "dev_bypass" ? undefined : sessionId,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to start analysis");
        }

        setAnalysisId(data.comprehensiveAnalysisId);
        startPolling(data.comprehensiveAnalysisId);

        // Clean up sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("bw_checkout_email");
          sessionStorage.removeItem("bw_checkout_name");
        }

        // Clean up URL params
        window.history.replaceState({}, "", "/analyze");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Payment verification failed"
        );
        setStep("search");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    <div style={{ minHeight: "100vh", background: "#f3efe8" }}>
      <MeshGradient mode="fixed" height={520} />

      <Nav />
      <div style={{ paddingTop: 60, position: "relative", zIndex: 1 }}>
        {error && step === "search" && (
          <div
            style={{
              maxWidth: 560,
              margin: "1rem auto",
              padding: "0.75rem 1rem",
              borderRadius: 8,
              background: "rgba(220,38,38,0.08)",
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
            <SearchStep key="search" onSubmit={handleSearch} />
          )}
          {step === "loading" && (
            <LoadingStep
              key="loading"
              businessName={businessName}
              onComplete={handleLoadingComplete}
              jobStatuses={jobStatuses}
              queryProgress={queryProgress}
              tier={tier}
            />
          )}
          {step === "partial" && analysis && (
            <PartialReport
              key="partial"
              analysis={analysis}
              onUnlock={() => setStep("email-gate")}
            />
          )}
          {step === "full" && analysis && (
            <FullReport
              key="full"
              analysis={analysis}
              analysisId={analysisId ?? undefined}
              actionPlan={actionPlan}
              actionPlanStatus={actionPlanStatus}
            />
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
  );
}
