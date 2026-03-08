"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SearchStepProps {
  onSubmit: (businessName: string, location: string) => void;
}

export function SearchStep({ onSubmit }: SearchStepProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);

  // Auto-detect location from IP
  useEffect(() => {
    fetch("/api/location")
      .then((r) => r.json())
      .then((data) => {
        if (data.display) setLocation(data.display);
      })
      .catch(() => {})
      .finally(() => setLocationLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && location.trim()) onSubmit(name.trim(), location.trim());
  };

  const isValid = name.trim() && location.trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(180deg, #f0eeea 0%, #e8e4f0 50%, #ddd6ee 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.72rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#9a9793",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#16a34a",
            }}
          />
          Free GEO Analysis
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#0c0c0b",
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          See how AI{" "}
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            recommends
          </span>{" "}
          your business
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontSize: "1rem",
            color: "#9a9793",
            lineHeight: 1.5,
            maxWidth: 420,
            margin: 0,
          }}
        >
          Enter your restaurant or business name and we&apos;ll analyze how AI
          engines see, rank, and recommend you.
        </motion.p>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginTop: "0.5rem",
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hana Sushi Miami"
            style={{
              width: "100%",
              padding: "0.875rem 1.25rem",
              fontSize: "1rem",
              fontFamily: "'Instrument Sans', sans-serif",
              borderRadius: 12,
              border: "1px solid #dddbd7",
              background: "#ffffff",
              color: "#0c0c0b",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0c0c0b")}
            onBlur={(e) => (e.target.style.borderColor = "#dddbd7")}
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={locationLoading ? "Detecting your location..." : "e.g. Miami, FL"}
            style={{
              width: "100%",
              padding: "0.875rem 1.25rem",
              fontSize: "1rem",
              fontFamily: "'Instrument Sans', sans-serif",
              borderRadius: 12,
              border: "1px solid #dddbd7",
              background: "#ffffff",
              color: "#0c0c0b",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0c0c0b")}
            onBlur={(e) => (e.target.style.borderColor = "#dddbd7")}
          />
          <button
            type="submit"
            disabled={!isValid}
            style={{
              width: "100%",
              padding: "0.875rem 2rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              fontFamily: "'Instrument Sans', sans-serif",
              borderRadius: 12,
              border: "none",
              background: isValid ? "#0c0c0b" : "#9a9793",
              color: "#ffffff",
              cursor: isValid ? "pointer" : "not-allowed",
              transition: "all 0.15s",
              opacity: isValid ? 1 : 0.6,
            }}
          >
            Analyze my business
          </button>
        </motion.form>

        {/* AI logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: "1rem",
          }}
        >
          <span style={{ fontSize: "0.72rem", color: "#9a9793" }}>Analyzed across</span>
          {[
            { name: "ChatGPT", color: "#10a37f" },
            { name: "Claude", color: "#c084fc" },
            { name: "Gemini", color: "#4285f4" },
          ].map((llm) => (
            <span
              key={llm.name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#3a3936",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: llm.color,
                }}
              />
              {llm.name}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
