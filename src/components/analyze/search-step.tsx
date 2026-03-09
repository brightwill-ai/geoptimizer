"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BUSINESS_CATEGORIES } from "@/lib/agents/prompts";
import { ProviderLogo } from "@/components/ui/provider-logo";

interface SearchStepProps {
  onSubmit: (businessName: string, location: string, category: string) => void;
}

const DEMO_PROMPTS = [
  "best sushi restaurant in miami for date night",
  "most trusted family dentist in brooklyn with transparent pricing",
  "top emergency plumber near austin open now",
  "best pilates studio in seattle for beginners",
];

function useTypewriter(lines: string[]) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (lines.length === 0) return;

    const line = lines[lineIndex] ?? "";
    const doneTyping = charIndex === line.length;
    const doneDeleting = charIndex === 0;

    let delay = deleting ? 18 : 30;
    if (!deleting && doneTyping) delay = 1000;
    if (deleting && doneDeleting) delay = 220;

    const timer = setTimeout(() => {
      if (!deleting) {
        if (doneTyping) {
          setDeleting(true);
        } else {
          setCharIndex((prev) => prev + 1);
        }
        return;
      }

      if (doneDeleting) {
        setDeleting(false);
        setLineIndex((prev) => (prev + 1) % lines.length);
      } else {
        setCharIndex((prev) => Math.max(prev - 1, 0));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [lines, lineIndex, charIndex, deleting]);

  return lines[lineIndex]?.slice(0, charIndex) ?? "";
}

export function SearchStep({ onSubmit }: SearchStepProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);
  const [category, setCategory] = useState("restaurant");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const typedPrompt = useTypewriter(DEMO_PROMPTS);

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
    const finalCategory = showCustom ? customCategory.trim() : category;
    if (name.trim() && location.trim() && finalCategory) {
      onSubmit(name.trim(), location.trim(), finalCategory);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "__other") {
      setShowCustom(true);
      setCategory("");
      return;
    }

    setShowCustom(false);
    setCustomCategory("");
    setCategory(value);
  };

  const isValid = name.trim() && location.trim() && (showCustom ? customCategory.trim() : category);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.84rem 1rem",
    fontSize: "0.88rem",
    fontFamily: "var(--font-sans)",
    borderRadius: 10,
    border: "1px solid #22232a",
    background: "#1a1b21",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, background 0.15s",
  };

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
        padding: "2rem 1.5rem",
        background: "#0c0d10",
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
        className="analyze-grid"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          style={{
            borderRadius: 12,
            border: "1px solid #22232a",
            background: "#14151a",
            padding: "1.2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 430,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.72rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.4)",
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
              Instant AI Audit
            </div>

            <h1
              style={{
                marginTop: "0.7rem",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.9rem, 3vw, 2.7rem)",
                fontWeight: 300,
                lineHeight: 1.02,
                color: "#ffffff",
                letterSpacing: "-0.04em",
              }}
            >
              See how AI recommends your business
            </h1>

            <p
              style={{
                marginTop: "0.8rem",
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.5,
                maxWidth: 450,
              }}
            >
              We run 5 live ChatGPT queries, score recommendation probability, then let you unlock the full
              cross-platform report.
            </p>
          </div>

          <div
            style={{
              marginTop: "1rem",
              padding: "0.9rem",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <p
              style={{
                fontSize: "0.66rem",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Live query example
            </p>
            <div
              aria-live="polite"
              style={{
                marginTop: "0.5rem",
                minHeight: 38,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "0.62rem 0.72rem",
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.86)",
                lineHeight: 1.4,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <span>{typedPrompt}</span>
              <span className="bw-typing-caret" aria-hidden>
                |
              </span>
            </div>

            <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <ProviderLogo provider="chatgpt" size={14} />
              <ProviderLogo provider="claude" size={14} style={{ opacity: 0.5 }} />
              <ProviderLogo provider="gemini" size={14} style={{ opacity: 0.5 }} />
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Fast mode now, full mode after unlock</span>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          onSubmit={handleSubmit}
          style={{
            borderRadius: 12,
            border: "1px solid #22232a",
            background: "#14151a",
            padding: "1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Business Inputs
          </p>

          <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
            Business Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hana Sushi, Peak Fitness, BrightSmile Dental"
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.3)";
              e.target.style.background = "rgba(255,255,255,0.05)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#22232a";
              e.target.style.background = "#1a1b21";
            }}
          />

          <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={locationLoading ? "Detecting your location..." : "e.g. Miami, FL"}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.3)";
              e.target.style.background = "rgba(255,255,255,0.05)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#22232a";
              e.target.style.background = "#1a1b21";
            }}
          />

          <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
            Category
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select
              value={showCustom ? "__other" : category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{
                ...inputStyle,
                flex: showCustom ? "0 0 auto" : "1",
                width: showCustom ? "auto" : "100%",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                paddingRight: "2.5rem",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.3)";
                e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#22232a";
                e.target.style.backgroundColor = "#1a1b21";
              }}
            >
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
              <option value="__other">Other...</option>
            </select>

            {showCustom && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Pet Grooming, Tutoring"
                autoFocus
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.3)";
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#22232a";
                  e.target.style.background = "#1a1b21";
                }}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            style={{
              width: "100%",
              marginTop: "0.25rem",
              padding: "0.84rem 1rem",
              fontSize: "0.9rem",
              fontWeight: 500,
              fontFamily: "var(--font-sans)",
              borderRadius: 10,
              border: "none",
              background: isValid ? "#ffffff" : "rgba(255,255,255,0.2)",
              color: isValid ? "#0c0d10" : "rgba(255,255,255,0.4)",
              cursor: isValid ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            Analyze my business
          </button>

          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.32)", marginTop: "0.25rem" }}>
            Free fast audit now. Full 3-platform report unlocks after preview.
          </p>
        </motion.form>
      </div>
    </motion.div>
  );
}
