"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/ui/section-divider";

interface EmailGateProps {
  analysisId: string;
  onSubmit?: (comprehensiveAnalysisId: string) => void;
  onClose: () => void;
}

export function EmailGate({ analysisId, onClose }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Request Stripe Checkout session (dev mode bypasses to direct redirect)
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, email: email.trim() }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || "Failed to create checkout");
      }

      // Store email in sessionStorage for the redirect-back flow
      sessionStorage.setItem("bw_checkout_email", email.trim());
      sessionStorage.setItem("bw_checkout_name", name.trim());

      // Redirect to Stripe Checkout (or dev bypass URL)
      window.location.href = checkoutData.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const isValid = email.includes("@") && email.includes(".");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 1rem",
    fontSize: "0.85rem",
    fontFamily: "var(--font-sans)",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#ffffff",
    color: "#18181b",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        style={{
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.08)",
          padding: "3rem",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            color: "#71717a",
            transition: "color 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#18181b")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#71717a")}
        >
          ✕
        </button>

        <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a", marginBottom: 12 }}>Full GEO Audit</div>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.5rem",
            fontWeight: 500,
            color: "#18181b",
            margin: "0 0 0.5rem 0",
            lineHeight: 1.2,
          }}
        >
          Unlock your complete GEO report
        </h2>

        <p style={{ fontSize: "0.85rem", color: "#52525b", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>
          40+ queries across all 3 AI platforms. We&apos;ll email you when your report is ready (typically 5-15 minutes).
        </p>

        {/* Price */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0.75rem 1rem",
          borderRadius: 8,
          background: "rgba(0,0,0,0.03)",
          border: "1px solid rgba(0,0,0,0.06)",
          marginBottom: "1.5rem",
        }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#18181b" }}>$99</span>
          <span style={{ fontSize: "0.8rem", color: "#71717a" }}>one-time</span>
          <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#16a34a", background: "rgba(22,163,74,0.12)", padding: "3px 8px", borderRadius: 999, fontWeight: 500 }}>Best value</span>
        </div>

        {/* Benefits */}
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 1.5rem 0",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[
            "Full analysis across ChatGPT, Claude & Gemini",
            "40+ real queries with response evidence",
            "Source influence map — what drives AI recommendations",
            "Verification prompts you can test yourself",
            "80-step actionable optimization playbook",
          ].map((item, i) => (
            <li
              key={item}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: "0.8rem",
                color: "#52525b",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "#a1a1aa", fontWeight: 500, flexShrink: 0, marginTop: 2 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {item}
            </li>
          ))}
        </ul>

        <SectionDivider spacing={1} theme="light" />

        {error && (
          <p style={{ fontSize: "0.75rem", color: "#dc2626", margin: "0 0 0.75rem 0" }}>
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)")}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.2)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.08)")}
          />
          <button
            type="submit"
            disabled={!isValid || loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "0.85rem",
              fontWeight: 500,
              fontFamily: "var(--font-sans)",
              borderRadius: 8,
              border: "none",
              background: isValid && !loading ? "#18181b" : "rgba(0,0,0,0.12)",
              color: isValid && !loading ? "#ffffff" : "#a1a1aa",
              cursor: isValid && !loading ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Redirecting to payment..." : "Pay & unlock full report — $99"}
          </button>
        </form>

        <p
          style={{
            fontSize: "0.7rem",
            color: "#71717a",
            textAlign: "center",
            margin: "1rem 0 0 0",
          }}
        >
          Secure payment via Stripe. No spam, ever.
        </p>
      </motion.div>
    </motion.div>
  );
}
