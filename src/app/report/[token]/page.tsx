"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { GEOAnalysis, ActionPlan as ActionPlanType } from "@/lib/mock-data";
import { FullReport } from "@/components/analyze/full-report";
import { LoadingStep } from "@/components/analyze/loading-step";
import { MeshGradient } from "@/components/ui/mesh-gradient";

export default function PublicReportPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "complete" | "error">("loading");
  const [analysis, setAnalysis] = useState<GEOAnalysis | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({});
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlanType | null>(null);
  const [actionPlanStatus, setActionPlanStatus] = useState<string>("pending");
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/report/${token}`);
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Report not found");
        setStatus("error");
        stopPolling();
        return;
      }

      const data = await res.json();
      setBusinessName(data.businessName || "");
      setJobStatuses(data.jobStatuses || {});

      if (data.status === "complete" && data.result) {
        setAnalysis(data.result);
        if (data.id) setAnalysisId(data.id);
        if (data.actionPlan) setActionPlan(data.actionPlan);
        if (data.actionPlanStatus) setActionPlanStatus(data.actionPlanStatus);
        setStatus("complete");
        stopPolling();
      } else if (data.status === "failed") {
        setErrorMsg(data.errorMessage || "Analysis failed");
        setStatus("error");
        stopPolling();
      }
      // else still pending/running — keep polling
    } catch {
      // Retry on next poll
    }
  }, [token, stopPolling]);

  useEffect(() => {
    // Initial fetch + start polling
    const id = setTimeout(fetchReport, 0);
    pollRef.current = setInterval(fetchReport, 3000);
    return () => {
      clearTimeout(id);
      stopPolling();
    };
  }, [fetchReport, stopPolling]);

  const handleLoadingComplete = useCallback(() => {
    // LoadingStep calls this when done — already handled by polling
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f3efe8" }}>
      <MeshGradient mode="fixed" height={520} />

      {/* Minimal nav */}
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
        <Link
          href="/analyze"
          style={{
            padding: "0.5rem 1.25rem",
            fontSize: "0.8rem",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            borderRadius: 8,
            border: "none",
            background: "#171717",
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          Run your own audit
        </Link>
      </nav>

      <div style={{ paddingTop: 60, position: "relative", zIndex: 1 }}>
        {status === "loading" && (
          <LoadingStep
            businessName={businessName || "Your business"}
            onComplete={handleLoadingComplete}
            jobStatuses={jobStatuses}
          />
        )}

        {status === "complete" && analysis && (
          <FullReport
            analysis={analysis}
            analysisId={analysisId ?? undefined}
            actionPlan={actionPlan}
            actionPlanStatus={actionPlanStatus}
          />
        )}

        {status === "error" && (
          <div
            style={{
              minHeight: "calc(100vh - 60px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: 400 }}>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  color: "#171717",
                  margin: "0 0 0.5rem",
                }}
              >
                Report unavailable
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#8e8ea0", margin: "0 0 1.5rem" }}>
                {errorMsg}
              </p>
              <Link
                href="/analyze"
                style={{
                  padding: "0.7rem 2rem",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                  borderRadius: 8,
                  border: "none",
                  background: "#171717",
                  color: "#ffffff",
                  textDecoration: "none",
                }}
              >
                Run a new audit
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
