"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface EmailGateProps {
  analysisId: string;
  onSubmit: (email: string, name?: string) => void;
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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      onSubmit(email.trim(), name.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isValid = email.includes("@") && email.includes(".");

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
        background: "rgba(12, 12, 11, 0.4)",
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
          background: "#faf9f7",
          borderRadius: 24,
          border: "1px solid #dddbd7",
          padding: "2.5rem",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
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
            color: "#9a9793",
            transition: "color 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#0c0c0b")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#9a9793")}
        >
          ✕
        </button>

        <h2
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#0c0c0b",
            margin: "0 0 0.5rem 0",
            lineHeight: 1.2,
          }}
        >
          Unlock your complete{" "}
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            GEO report
          </span>
        </h2>

        <p style={{ fontSize: "0.85rem", color: "#9a9793", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>
          Get the full analysis across all AI engines — free.
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
            "Analysis across ChatGPT, Claude, Gemini & Perplexity",
            "Detailed competitor comparison",
            "Information accuracy audit",
            "Actionable optimization insights",
          ].map((item) => (
            <li
              key={item}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: "0.8rem",
                color: "#3a3936",
              }}
            >
              <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
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
            style={{
              width: "100%",
              padding: "0.7rem 1rem",
              fontSize: "0.85rem",
              fontFamily: "'Instrument Sans', sans-serif",
              borderRadius: 10,
              border: "1px solid #dddbd7",
              background: "#ffffff",
              color: "#0c0c0b",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0c0c0b")}
            onBlur={(e) => (e.target.style.borderColor = "#dddbd7")}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{
              width: "100%",
              padding: "0.7rem 1rem",
              fontSize: "0.85rem",
              fontFamily: "'Instrument Sans', sans-serif",
              borderRadius: 10,
              border: "1px solid #dddbd7",
              background: "#ffffff",
              color: "#0c0c0b",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0c0c0b")}
            onBlur={(e) => (e.target.style.borderColor = "#dddbd7")}
          />
          <button
            type="submit"
            disabled={!isValid || loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              fontFamily: "'Instrument Sans', sans-serif",
              borderRadius: 10,
              border: "none",
              background: isValid && !loading ? "#0c0c0b" : "#9a9793",
              color: "#ffffff",
              cursor: isValid && !loading ? "pointer" : "not-allowed",
              opacity: isValid && !loading ? 1 : 0.6,
              transition: "all 0.15s",
            }}
          >
            {loading ? "Submitting..." : "Send me the full report"}
          </button>
        </form>

        <p
          style={{
            fontSize: "0.7rem",
            color: "#9a9793",
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
