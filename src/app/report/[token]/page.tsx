"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { GEOAnalysis } from "@/lib/mock-data";
import { FullReport } from "@/components/analyze/full-report";
import { LoadingStep } from "@/components/analyze/loading-step";

export default function PublicReportPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "complete" | "error">("loading");
  const [analysis, setAnalysis] = useState<GEOAnalysis | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({});
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
    <div style={{ minHeight: "100vh", background: "#0c0d10" }}>
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
          background: "rgba(12,13,16,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #22232a",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "1.05rem",
            letterSpacing: "-0.02em",
            color: "#ffffff",
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
            background: "#ffffff",
            color: "#0c0d10",
            textDecoration: "none",
          }}
        >
          Run your own audit
        </Link>
      </nav>

      <div style={{ paddingTop: 60 }}>
        {status === "loading" && (
          <LoadingStep
            businessName={businessName || "Your business"}
            onComplete={handleLoadingComplete}
            jobStatuses={jobStatuses}
          />
        )}

        {status === "complete" && analysis && (
          <FullReport analysis={analysis} />
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
                  color: "#ffffff",
                  margin: "0 0 0.5rem",
                }}
              >
                Report unavailable
              </h2>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)", margin: "0 0 1.5rem" }}>
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
                  background: "#ffffff",
                  color: "#0c0d10",
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
