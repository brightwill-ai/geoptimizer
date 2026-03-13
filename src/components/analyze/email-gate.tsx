"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/ui/section-divider";

interface EmailGateProps {
  analysisId: string;
  onSubmit?: (comprehensiveAnalysisId: string) => void;
  onClose: () => void;
}

type PriceTier = "full_audit" | "audit_strategy";

const TIERS = [
  {
    id: "full_audit" as PriceTier,
    name: "Full Audit",
    price: "$99",
    label: "Most popular",
    labelColor: "#10a37f",
    features: [
      "Full analysis across ChatGPT, Claude & Gemini",
      "100+ real queries with response evidence",
      "Source influence map — what drives AI recommendations",
      "Verification prompts you can test yourself",
      "80-step actionable optimization playbook",
    ],
  },
  {
    id: "audit_strategy" as PriceTier,
    name: "Audit + Strategy",
    price: "$199",
    label: "Best value",
    labelColor: "#7c3aed",
    features: [
      "Everything in Full Audit, plus:",
      "Custom execution roadmap for your business",
      "Monthly re-audit to track progress",
      "3 competitor monitoring dashboards",
      "30-min strategy call with a GEO specialist",
      "Priority email support",
    ],
  },
];

export function EmailGate({ analysisId, onClose }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedTier, setSelectedTier] = useState<PriceTier>("full_audit");
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
        body: JSON.stringify({
          analysisId,
          email: email.trim(),
          priceTier: selectedTier,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || "Failed to create checkout");
      }

      // Store in sessionStorage for the redirect-back flow
      sessionStorage.setItem("bw_checkout_email", email.trim());
      sessionStorage.setItem("bw_checkout_name", name.trim());
      sessionStorage.setItem("bw_checkout_priceTier", selectedTier);

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
    border: "1px solid #e5e5e5",
    background: "#f7f7f8",
    color: "#171717",
    outline: "none",
    boxSizing: "border-box",
  };

  const selectedPrice = TIERS.find((t) => t.id === selectedTier)?.price || "$99";

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
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e5e5e5",
          padding: "2.5rem",
          maxWidth: 640,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
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
            color: "#8e8ea0",
            transition: "color 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#171717")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#8e8ea0")}
        >
          ✕
        </button>

        <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8e8ea0", marginBottom: 12 }}>Unlock Your Full Report</div>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.4rem",
            fontWeight: 500,
            color: "#171717",
            margin: "0 0 0.4rem 0",
            lineHeight: 1.2,
          }}
        >
          Choose your plan
        </h2>

        <p style={{ fontSize: "0.85rem", color: "#6e6e80", margin: "0 0 1.25rem 0", lineHeight: 1.5 }}>
          Comprehensive GEO analysis across all 3 AI platforms. We&apos;ll email you when your report is ready.
        </p>

        {/* Tier Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
          {TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                style={{
                  background: isSelected ? "#fafafa" : "#ffffff",
                  border: isSelected ? "2px solid #171717" : "1px solid #e5e5e5",
                  borderRadius: 12,
                  padding: "1rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  position: "relative",
                }}
              >
                {/* Label badge */}
                <span style={{
                  position: "absolute",
                  top: -8,
                  right: 12,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  background: tier.labelColor,
                  padding: "2px 8px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>
                  {tier.label}
                </span>

                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#171717", marginBottom: 4 }}>
                  {tier.name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
                  <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "#171717" }}>{tier.price}</span>
                  <span style={{ fontSize: "0.7rem", color: "#8e8ea0" }}>one-time</span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                  {tier.features.map((feature, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: "0.72rem", color: "#6e6e80", lineHeight: 1.4 }}>
                      <span style={{ color: tier.labelColor, fontSize: "0.65rem", marginTop: 2, flexShrink: 0 }}>
                        {feature.startsWith("Everything") ? "★" : "✓"}
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Selection indicator */}
                {isSelected && (
                  <div style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#171717",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} />
                  </div>
                )}
                {!isSelected && (
                  <div style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "1.5px solid #d5d5d5",
                  }} />
                )}
              </button>
            );
          })}
        </div>

        <SectionDivider spacing={1} />

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
            onFocus={(e) => (e.target.style.borderColor = "#171717")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#171717")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
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
              background: isValid && !loading ? "#171717" : "#e5e5e5",
              color: isValid && !loading ? "#ffffff" : "#8e8ea0",
              cursor: isValid && !loading ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {loading
              ? "Redirecting to payment..."
              : `Pay & unlock full report — ${selectedPrice}`}
          </button>
        </form>

        <p
          style={{
            fontSize: "0.7rem",
            color: "#8e8ea0",
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
