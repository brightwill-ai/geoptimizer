"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BUSINESS_CATEGORIES } from "@/lib/agents/prompts";
import { ProviderLogo } from "@/components/ui/provider-logo";

interface SearchStepProps {
  onSubmit: (businessName: string, location: string, category: string) => void;
}

const DEMO_SCENARIOS = [
  {
    query: "best sushi restaurant in miami for date night",
    format: "chatgpt" as const,
    response: "Here are the top sushi restaurants in Miami for date night:",
    competitors: [
      { name: "Sakura Kitchen", desc: "Known for fresh omakase and intimate ambiance" },
      { name: "Blue Wave Sushi", desc: "Great happy hour specials and waterfront views" },
      { name: "Nobu Downtown", desc: "Upscale atmosphere with signature dishes" },
    ],
  },
  {
    query: "most trusted family dentist in brooklyn",
    format: "overview" as const,
    response: "Based on patient reviews and ratings, here are highly-rated family dentists in Brooklyn:",
    competitors: [
      { name: "Park Slope Dental", desc: "Transparent pricing and gentle approach for families" },
      { name: "BrightSmile Family", desc: "Highly rated for pediatric care and modern facilities" },
      { name: "Brooklyn Heights Dentistry", desc: "Trusted community practice with 20+ years experience" },
    ],
  },
  {
    query: "top emergency plumber near austin open now",
    format: "chatgpt" as const,
    response: "Here are the top emergency plumbers near Austin:",
    competitors: [
      { name: "Capital City Plumbing", desc: "24/7 emergency service with fast response times" },
      { name: "Austin Pro Plumbers", desc: "Licensed and insured, same-day appointments" },
      { name: "Lone Star Pipes", desc: "Affordable rates and excellent Google reviews" },
    ],
  },
  {
    query: "best pilates studio in seattle for beginners",
    format: "overview" as const,
    response: "Here are some of the best pilates studios in Seattle for beginners:",
    competitors: [
      { name: "CoreBalance Studio", desc: "Small class sizes with certified instructors" },
      { name: "Emerald City Pilates", desc: "Beginner-friendly programs and flexible scheduling" },
      { name: "Zenith Movement", desc: "Top-rated reformer classes in Capitol Hill" },
    ],
  },
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

    let delay = deleting ? 22 : 40;
    if (!deleting && doneTyping) delay = 5000;
    if (deleting && doneDeleting) delay = 350;

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

  return { text: lines[lineIndex]?.slice(0, charIndex) ?? "", lineIndex };
}

interface LocationSuggestion {
  display_name: string;
  short: string;
}

function useLocationAutocomplete(query: string, enabled: boolean) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&dedupe=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: LocationSuggestion[] = data.map((item: any) => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || "";
          const state = addr.state || "";
          const country = addr.country_code?.toUpperCase() || "";
          const short = [city, state, country === "US" ? "" : addr.country]
            .filter(Boolean)
            .join(", ");
          return {
            display_name: item.display_name,
            short: short || item.display_name.split(",").slice(0, 2).join(",").trim(),
          };
        });
        // Deduplicate by short name
        const seen = new Set<string>();
        const unique = mapped.filter((s) => {
          if (seen.has(s.short)) return false;
          seen.add(s.short);
          return true;
        });
        setSuggestions(unique);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, enabled]);

  return { suggestions, loading, clear: () => setSuggestions([]) };
}

export function SearchStep({ onSubmit }: SearchStepProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationFocused, setLocationFocused] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [category, setCategory] = useState("restaurant");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const { text: typedPrompt, lineIndex: scenarioIndex } = useTypewriter(
    DEMO_SCENARIOS.map((s) => s.query)
  );
  const currentScenario = DEMO_SCENARIOS[scenarioIndex];

  const { suggestions, loading: suggestionsLoading } =
    useLocationAutocomplete(location, userTyping && locationFocused);

  const showDropdown = locationFocused && userTyping && (suggestions.length > 0 || suggestionsLoading);


  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-detect location from IP
  useEffect(() => {
    fetch("/api/location")
      .then((r) => r.json())
      .then((data) => {
        if (data.display) {
          setLocation(data.display);
          setAutoDetected(true);
        }
      })
      .catch(() => {})
      .finally(() => setLocationLoading(false));
  }, []);

  const selectSuggestion = (s: LocationSuggestion) => {
    setLocation(s.short);
    setUserTyping(false);
    setAutoDetected(false);
    setLocationFocused(false);
    setHighlightedIdx(-1);
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIdx]);
    } else if (e.key === "Escape") {
      setLocationFocused(false);
    }
  };

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
    border: "1px solid rgba(255,255,255,0.06)",
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
            border: "1px solid rgba(255,255,255,0.06)",
            background: "#14151a",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 430,
          }}
        >
          {/* Header */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>Instant AI Audit</div>

            <h1
              style={{
                marginTop: "0.7rem",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)",
                fontWeight: 300,
                lineHeight: 1.08,
                color: "#ffffff",
                letterSpacing: "-0.04em",
              }}
            >
              Your competitors are showing up in AI.{" "}
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Are you?</span>
            </h1>
          </div>

          {/* Rotating mockup: ChatGPT ↔ AI Overview */}
          <div style={{ marginTop: "0.8rem", position: "relative", minHeight: 260 }}>
            <AnimatePresence mode="wait">
              {currentScenario.format === "chatgpt" ? (
                <motion.div
                  key={`chatgpt-${scenarioIndex}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "#1a1b21", overflow: "hidden" }}
                >
                  {/* ChatGPT header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.55rem 0.85rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <ProviderLogo provider="chatgpt" size={14} />
                    <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>ChatGPT</span>
                  </div>

                  <div style={{ padding: "0.75rem 0.85rem" }}>
                    {/* User query */}
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div aria-live="polite" style={{ borderRadius: 8, background: "rgba(255,255,255,0.05)", padding: "0.5rem 0.7rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.4, minHeight: 20 }}>
                        <span>{typedPrompt}</span>
                        <span className="bw-typing-caret" aria-hidden>|</span>
                      </div>
                    </div>

                    {/* AI response */}
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(16,163,127,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <ProviderLogo provider="chatgpt" size={12} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginBottom: "0.5rem", lineHeight: 1.4 }}>
                          {currentScenario.response}
                        </p>
                        {currentScenario.competitors.map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.38rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.8)" }}>{i + 1}. {c.name}</span>
                            <span style={{ fontSize: "0.62rem", fontWeight: 500, color: "#16a34a", background: "rgba(22,163,74,0.12)", padding: "2px 8px", borderRadius: 999 }}>Recommended</span>
                          </div>
                        ))}
                        {/* Your business — not mentioned */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0 0.2rem", marginTop: "0.25rem", borderTop: "1px dashed rgba(255,255,255,0.08)" }}>
                          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Your business?</span>
                          <span className="bw-not-mentioned-pulse" style={{ fontSize: "0.62rem", fontWeight: 500, color: "#dc2626", background: "rgba(220,38,38,0.12)", padding: "2px 8px", borderRadius: 999 }}>Not mentioned</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`overview-${scenarioIndex}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "#1a1b21", overflow: "hidden" }}
                >
                  {/* Search bar */}
                  <div style={{ padding: "0.6rem 0.85rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", flex: 1, minHeight: 18 }}>
                      <span>{typedPrompt}</span>
                      <span className="bw-typing-caret" aria-hidden>|</span>
                    </div>
                  </div>

                  {/* AI Overview panel */}
                  <div style={{ padding: "0.75rem 0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.55rem" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#4285f4" opacity="0.8" />
                      </svg>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#4285f4", letterSpacing: "0.02em" }}>AI Overview</span>
                    </div>
                    <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: "0.6rem" }}>
                      {currentScenario.response}
                    </p>
                    {currentScenario.competitors.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "0.4rem 0", borderBottom: i < currentScenario.competitors.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", marginTop: 2, flexShrink: 0 }}>{i + 1}.</span>
                        <div>
                          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{c.name}</span>
                          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>— {c.desc}</span>
                        </div>
                      </div>
                    ))}
                    {/* Sources */}
                    <div style={{ marginTop: "0.55rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.3)" }}>Sources:</span>
                      {["Yelp", "TripAdvisor", "Google Maps"].map((src) => (
                        <span key={src} style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)", padding: "1px 6px", borderRadius: 4 }}>{src}</span>
                      ))}
                    </div>
                  </div>

                  {/* Warning callout */}
                  <div style={{ margin: "0 0.85rem 0.75rem", display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0.65rem", borderRadius: 8, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="bw-not-mentioned-pulse" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                      Your business <span style={{ color: "#dc2626", fontWeight: 500 }}>isn&apos;t showing up</span> in AI results.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Social proof */}
          <p
            style={{
              marginTop: "0.7rem",
              fontSize: "0.74rem",
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.5,
            }}
          >
            73% of consumers now use AI to find local businesses.{" "}
            <span style={{ color: "rgba(255,255,255,0.55)" }}>Are you visible?</span>
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          onSubmit={handleSubmit}
          style={{
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "#14151a",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>Business Details</div>

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
              e.target.style.borderColor = "rgba(255,255,255,0.06)";
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
                e.target.style.borderColor = "rgba(255,255,255,0.06)";
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
                  e.target.style.borderColor = "rgba(255,255,255,0.06)";
                  e.target.style.background = "#1a1b21";
                }}
              />
            )}
          </div>

          <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
            Location
            {autoDetected && !userTyping && (
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  color: "#16a34a",
                  background: "rgba(22,163,74,0.12)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  letterSpacing: "0.02em",
                }}
              >
                Auto-detected
              </span>
            )}
          </label>
          <div ref={locationRef} style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
              {/* Map pin icon */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  transition: "stroke 0.15s",
                  ...(locationFocused ? { stroke: "rgba(255,255,255,0.5)" } : {}),
                }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                ref={locationInputRef}
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setUserTyping(true);
                  setAutoDetected(false);
                  setHighlightedIdx(-1);
                }}
                onKeyDown={handleLocationKeyDown}
                placeholder={locationLoading ? "Detecting your location..." : "Search city, state, or zip..."}
                style={{
                  ...inputStyle,
                  paddingLeft: "2.5rem",
                  borderColor: locationFocused ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)",
                  background: locationFocused ? "rgba(255,255,255,0.05)" : "#1a1b21",
                }}
                onFocus={() => setLocationFocused(true)}
                onBlur={() => {
                  setTimeout(() => setLocationFocused(false), 180);
                }}
                autoComplete="off"
                role="combobox"
                aria-expanded={showDropdown}
                aria-autocomplete="list"
                aria-activedescendant={highlightedIdx >= 0 ? `loc-option-${highlightedIdx}` : undefined}
              />
              {/* Loading spinner */}
              {suggestionsLoading && locationFocused && (
                <div
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.1)",
                    borderTopColor: "rgba(255,255,255,0.4)",
                    borderRadius: "50%",
                    animation: "loc-spin 0.6s linear infinite",
                  }}
                />
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "#1a1b21",
                  overflow: "hidden",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
                  backdropFilter: "blur(12px)",
                }}
                role="listbox"
              >
                {suggestionsLoading && suggestions.length === 0 && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.35)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        border: "2px solid rgba(255,255,255,0.1)",
                        borderTopColor: "rgba(255,255,255,0.3)",
                        borderRadius: "50%",
                        animation: "loc-spin 0.6s linear infinite",
                      }}
                    />
                    Searching locations...
                  </div>
                )}
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    id={`loc-option-${i}`}
                    type="button"
                    role="option"
                    aria-selected={highlightedIdx === i}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(s);
                    }}
                    onMouseEnter={() => setHighlightedIdx(i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      padding: "0.65rem 1rem",
                      fontSize: "0.84rem",
                      fontFamily: "var(--font-sans)",
                      color: "#ffffff",
                      background: highlightedIdx === i ? "rgba(255,255,255,0.06)" : "transparent",
                      border: "none",
                      borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={highlightedIdx === i ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0, transition: "stroke 0.1s" }}
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 500 }}>{s.short}</span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.68rem",
                          color: "rgba(255,255,255,0.3)",
                          marginTop: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.display_name}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
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
            Check my visibility
          </button>

          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.32)", marginTop: "0.25rem" }}>
            Free — results in 30 seconds. No signup required.
          </p>
        </motion.form>
      </div>
    </motion.div>
  );
}
