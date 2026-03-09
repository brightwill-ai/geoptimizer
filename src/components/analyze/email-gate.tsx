"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface EmailGateProps {
  analysisId: string;
  onSubmit: (comprehensiveAnalysisId: string) => void;
  onClose: () => void;
}

export function EmailGate({ analysisId, onSubmit, onClose }: EmailGateProps) {
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
      const res = await fetch(`/api/analysis/${analysisId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      onSubmit(data.comprehensiveAnalysisId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
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
    border: "1px solid #22232a",
    background: "#1a1b21",
    color: "#ffffff",
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
        background: "rgba(0, 0, 0, 0.6)",
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
          background: "#14151a",
          borderRadius: 12,
          border: "1px solid #22232a",
          padding: "2.5rem",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
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
            color: "rgba(255,255,255,0.4)",
            transition: "color 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          ✕
        </button>

        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.5rem",
            fontWeight: 500,
            color: "#ffffff",
            margin: "0 0 0.5rem 0",
            lineHeight: 1.2,
          }}
        >
          Unlock your complete GEO report
        </h2>

        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>
          We&apos;ll run 40+ queries across all 3 AI platforms and email you when ready (typically 5-15 minutes).
        </p>

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
            "Actionable optimization playbook",
          ].map((item) => (
            <li
              key={item}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <span style={{ color: "#16a34a", fontWeight: 500, flexShrink: 0, marginTop: 1 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>

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
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
            onBlur={(e) => (e.target.style.borderColor = "#22232a")}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
            onBlur={(e) => (e.target.style.borderColor = "#22232a")}
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
              background: isValid && !loading ? "#ffffff" : "rgba(255,255,255,0.2)",
              color: isValid && !loading ? "#0c0d10" : "rgba(255,255,255,0.4)",
              cursor: isValid && !loading ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Submitting..." : "Send me the full report"}
          </button>
        </form>

        <p
          style={{
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
            margin: "1rem 0 0 0",
          }}
        >
          No spam, ever. We respect your privacy.
        </p>
      </motion.div>
    </motion.div>
  );
}
