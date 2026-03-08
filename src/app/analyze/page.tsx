"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { type GEOAnalysis } from "@/lib/mock-data";
import { SearchStep } from "@/components/analyze/search-step";
import { LoadingStep } from "@/components/analyze/loading-step";
import { PartialReport } from "@/components/analyze/partial-report";
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
        background: "rgba(240,238,234,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #dddbd7",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 700,
          fontSize: "1.05rem",
          letterSpacing: "-0.02em",
          color: "#0c0c0b",
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
  const [step, setStep] = useState<Step>("search");
  const [businessName, setBusinessName] = useState("");
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<GEOAnalysis | null>(null);
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({});
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

        if (data.status === "complete" && data.result) {
          stopPolling();
          setAnalysis(data.result);
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
    setError(null);
    setJobStatuses({});
    setAnalysis(null);
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
      setStep("partial");
    }
  }, [analysis]);

  const handleEmailSubmit = () => {
    setStep("full");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0eeea" }}>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        {error && step === "search" && (
          <div
            style={{
              maxWidth: 560,
              margin: "1rem auto",
              padding: "0.75rem 1rem",
              borderRadius: 10,
              background: "#fee2e2",
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
            />
          )}
          {step === "partial" && analysis && (
            <PartialReport
              key="partial"
              analysis={analysis}
              onUnlock={() => setStep("email-gate")}
            />
          )}
          {step === "full" && analysis && <FullReport key="full" analysis={analysis} />}
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
