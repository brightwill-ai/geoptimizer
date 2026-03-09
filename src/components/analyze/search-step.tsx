"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BUSINESS_CATEGORIES } from "@/lib/agents/prompts";
import { ProviderLogo } from "@/components/ui/provider-logo";

interface SearchStepProps {
  onSubmit: (businessName: string, location: string, category: string) => void;
}

export function SearchStep({ onSubmit }: SearchStepProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);
  const [category, setCategory] = useState("restaurant");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustom, setShowCustom] = useState(false);

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
    } else {
      setShowCustom(false);
      setCustomCategory("");
      setCategory(value);
    }
  };

  const isValid = name.trim() && location.trim() && (showCustom ? customCategory.trim() : category);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.875rem 1.25rem",
    fontSize: "1rem",
    fontFamily: "'Instrument Sans', sans-serif",
    borderRadius: 8,
    border: "1px solid #22232a",
    background: "#1a1b21",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
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
        padding: "2rem",
        background: "#0c0d10",
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
            color: "#ffffff",
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          See how AI recommends your business
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontSize: "1rem",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.5,
            maxWidth: 420,
            margin: 0,
          }}
        >
          We run 5 real queries through ChatGPT and show you exactly
          how likely it is to recommend your business.
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
            placeholder="e.g. Hana Sushi, Peak Fitness, BrightSmile Dental"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
            onBlur={(e) => (e.target.style.borderColor = "#22232a")}
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={locationLoading ? "Detecting your location..." : "e.g. Miami, FL"}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
            onBlur={(e) => (e.target.style.borderColor = "#22232a")}
          />

          {/* Category selector */}
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
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
              onBlur={(e) => (e.target.style.borderColor = "#22232a")}
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
                onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
                onBlur={(e) => (e.target.style.borderColor = "#22232a")}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            style={{
              width: "100%",
              padding: "0.875rem 2rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              fontFamily: "'Instrument Sans', sans-serif",
              borderRadius: 8,
              border: "none",
              background: isValid ? "#ffffff" : "rgba(255,255,255,0.2)",
              color: isValid ? "#0c0d10" : "rgba(255,255,255,0.4)",
              cursor: isValid ? "pointer" : "not-allowed",
              transition: "all 0.15s",
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
            gap: 8,
            marginTop: "1rem",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <ProviderLogo provider="chatgpt" size={14} />
            Powered by ChatGPT
          </span>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
            · Free · 30 seconds
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
