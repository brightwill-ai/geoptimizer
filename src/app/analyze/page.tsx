"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { generateMockAnalysis, type GEOAnalysis } from "@/lib/mock-data";
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
  const [analysis, setAnalysis] = useState<GEOAnalysis | null>(null);

  const handleSearch = (name: string) => {
    setBusinessName(name);
    setStep("loading");
  };

  const handleLoadingComplete = useCallback(() => {
    setAnalysis(generateMockAnalysis(businessName));
    setStep("partial");
  }, [businessName]);

  const handleEmailSubmit = (email: string) => {
    localStorage.setItem("brightwill_email", email);
    localStorage.setItem("brightwill_name", email);
    setStep("full");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0eeea" }}>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <AnimatePresence mode="wait">
          {step === "search" && <SearchStep key="search" onSubmit={handleSearch} />}
          {step === "loading" && (
            <LoadingStep
              key="loading"
              businessName={businessName}
              onComplete={handleLoadingComplete}
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

        {/* Email gate rendered as overlay, outside AnimatePresence for partial */}
        <AnimatePresence>
          {step === "email-gate" && (
            <EmailGate
              key="email-gate"
              onSubmit={handleEmailSubmit}
              onClose={() => setStep("partial")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
