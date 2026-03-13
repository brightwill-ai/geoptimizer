"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { WordFadeIn } from "@/components/ui/word-fade-in";

// ── Shared scroll-reveal hook ──
function useReveal(ref: React.RefObject<HTMLElement | null>, threshold = 0.15, { once = false } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold }
    );
    const targets = el.querySelectorAll(
      ".reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-blur"
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [ref, threshold, once]);
}

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

  return {
    lineIndex,
    typedText: lines[lineIndex]?.slice(0, charIndex) ?? "",
    charIndex,
    lineLength: lines[lineIndex]?.length ?? 0,
  };
}

// ── Animated Counter ──
function AnimatedCounter({
  end,
  suffix = "",
  duration = 1800,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ── Probability Ring ──
function ProbabilityRing({
  value,
  size = 72,
}: {
  value: number;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 60 ? "#16a34a" : value >= 30 ? "#d97706" : "#dc2626";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.22,
          fontWeight: 500,
          color: "#171717",
        }}
      >
        {value}%
      </div>
    </div>
  );
}

// ── Navigation ──
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
        background: "transparent",
        backdropFilter: "none",
        borderBottom: "none",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          fontSize: "1.05rem",
          letterSpacing: "-0.02em",
          color: "#171717",
          textDecoration: "none",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ borderRadius: 6 }}
        >
          <rect width="28" height="28" rx="6" fill="url(#bw-gradient)" />
          {/* Overlapping subtle diamond shapes for the icon */}
          <path d="M14 6L21 13L14 20L7 13L14 6Z" fill="white" fillOpacity="0.9" />
          <path d="M14 11.5L20.5 18L14 24.5L7.5 18L14 11.5Z" fill="white" fillOpacity="0.45" />
          <defs>
            <linearGradient id="bw-gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fb923c" />
              <stop offset="1" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>
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
        <li><a href="#features" className="nav-link" style={{ color: "#6e6e80", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.15s" }}>Features</a></li>
        <li><a href="#how" className="nav-link" style={{ color: "#6e6e80", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.15s" }}>How it works</a></li>
        <li><a href="#pricing" className="nav-link" style={{ color: "#6e6e80", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.15s" }}>Pricing</a></li>
      </ul>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Link
          href="/analyze"
          style={{
            background: "#171717",
            color: "#ffffff",
            padding: "0.5rem 1.25rem",
            borderRadius: 8,
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            fontWeight: 500,
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
        >
          Get free audit
        </Link>
      </div>
    </nav>
  );
}

// ── Hero Report Mockup ──
function HeroReportMockup() {
  const queries = [
    { text: "Best sushi in Miami", mentioned: true },
    { text: "Where to get omakase near downtown Miami", mentioned: true },
    { text: "Top Japanese restaurants Brickell", mentioned: false },
    { text: "Romantic dinner spots Miami Beach", mentioned: true },
  ];
  const { lineIndex, typedText } = useTypewriter(queries.map((query) => query.text));
  const activeQuery = queries[lineIndex % queries.length] ?? queries[0];

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e5e5e5",
        padding: "1.75rem",
        maxWidth: 480,
        width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
        <ProviderLogo provider="chatgpt" size={16} />
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#8e8ea0",
          }}
        >
          ChatGPT Audit &mdash; Hana Sushi Miami
        </span>
      </div>

      {/* Probability */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <ProbabilityRing value={60} size={72} />
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 500, color: "#171717" }}>
            60% probability
          </div>
          <div style={{ fontSize: "0.78rem", color: "#8e8ea0" }}>
            Recommended in 3 of 5 queries
          </div>
        </div>
      </div>

      {/* Query evidence */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "7px 10px",
            borderRadius: 8,
            background: "#f7f7f8",
            minHeight: 34,
          }}
        >
          <span style={{ fontSize: "0.78rem", color: "#171717" }} aria-live="polite">
            &ldquo;{typedText}&rdquo;
            <span className="bw-typing-caret" aria-hidden>
              |
            </span>
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: activeQuery.mentioned ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
              color: activeQuery.mentioned ? "#16a34a" : "#dc2626",
              fontSize: "0.65rem",
              fontWeight: 500,
              flexShrink: 0,
              marginLeft: 10,
            }}
          >
            {activeQuery.mentioned ? "Recommended" : "Not mentioned"}
          </span>
        </div>

        {queries.slice(1).map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              borderRadius: 8,
              background: i % 2 === 0 ? "#f7f7f8" : "transparent",
            }}
          >
            <span style={{ fontSize: "0.78rem", color: "#6e6e80" }}>
              &ldquo;{item.text}&rdquo;
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                background: item.mentioned ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
                color: item.mentioned ? "#16a34a" : "#dc2626",
                fontSize: "0.65rem",
                fontWeight: 500,
                flexShrink: 0,
                marginLeft: 10,
              }}
            >
              {item.mentioned ? "Recommended" : "Not mentioned"}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "1rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid #e5e5e5",
          fontSize: "0.7rem",
          color: "#8e8ea0",
        }}
      >
        Based on 5 real ChatGPT queries
      </div>
    </div>
  );
}

// ── Hero Section (LIGHT) ──
function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", background: "#fdf8f5" }}>
      <MeshGradient mode="hero" scrollFade />

      <div
        className="hero"
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "90vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
          padding: "10rem 60px 5rem",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <span
            className="animate-up"
            style={{
              animationDelay: "0.1s",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.72rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8e8ea0",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ width: 5, height: 5, background: "#171717", borderRadius: "50%" }} />
            AI Visibility Audit
          </span>

          <h1
            className="animate-up"
            style={{
              animationDelay: "0.2s",
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(2.8rem, 4.5vw, 4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: "1.25rem",
              color: "#171717",
            }}
          >
            Get your business
            <br />
            recommended
            <br />
            by AI.
          </h1>

          <p
            className="animate-up"
            style={{
              animationDelay: "0.3s",
              fontSize: "1rem",
              fontWeight: 450,
              color: "#6e6e80",
              lineHeight: 1.65,
              maxWidth: "40ch",
              marginBottom: "2rem",
            }}
          >
            We query ChatGPT, Claude, and Gemini with real customer questions
            and measure how often they recommend your business. See your results
            in 30 seconds.
          </p>

          <div className="animate-up" style={{ animationDelay: "0.4s", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/analyze"
              style={{
                background: "#171717",
                color: "#ffffff",
                padding: "0.65rem 1.5rem",
                borderRadius: 8,
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                transition: "opacity 0.15s",
              }}
            >
              Run free audit <span style={{ marginLeft: 2 }}>&rarr;</span>
            </Link>
            <span style={{ fontSize: "0.78rem", color: "#8e8ea0" }}>
              No signup. Real AI responses.
            </span>
          </div>
        </div>

        <div className="hero-right animate-up" style={{ animationDelay: "0.3s", display: "flex", justifyContent: "flex-end" }}>
          <HeroReportMockup />
        </div>
      </div>

      {/* Platform bar — inside hero so mesh extends behind it */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "3.5rem 2.5rem 4rem",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2.5rem",
          }}
          className="platform-bar"
        >
          <span
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8e8ea0",
              fontWeight: 500,
            }}
          >
            Analyzes responses from
          </span>
          {[
            { name: "ChatGPT", color: "#10a37f" },
            { name: "Claude", color: "#c084fc" },
            { name: "Gemini", color: "#4285f4" },
          ].map((p) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 3, height: 20, borderRadius: 2, background: p.color, flexShrink: 0 }} />
              <ProviderLogo provider={p.name.toLowerCase()} size={18} />
              <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#6e6e80" }}>
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient — smooth fade from mesh to white */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "35%",
          zIndex: 1,
          pointerEvents: "none",
          background: "linear-gradient(to bottom, transparent 0%, rgba(243,239,232,0.5) 40%, #f3efe8 100%)",
        }}
      />
    </section>
  );
}

// ── PlatformBar removed — now inline in Hero ──

// ── Stats Section ──
function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, 0.15, { once: true });

  const stats = [
    { value: 100, suffix: "M+", label: "Daily AI searches your customers are making" },
    { value: 40, suffix: "+", label: "Real queries per comprehensive audit" },
    { value: 3, suffix: "", label: "AI platforms tested simultaneously" },
  ];

  return (
    <div
      ref={ref}
      style={{ background: "#f3efe8" }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "4.5rem 2.5rem",
        }}
      >
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`reveal-scale stagger-${i + 1}`}
              style={{
                textAlign: "center",
                padding: "1.5rem 2rem",
                borderRight: i < 2 ? "none" : "none",
                backgroundImage: i < 2
                  ? "repeating-radial-gradient(circle, rgba(0,0,0,0.10) 0 1px, transparent 1px 6px)"
                  : "none",
                backgroundSize: "2px 6px",
                backgroundRepeat: "repeat-y",
                backgroundPosition: "right center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  color: "#171717",
                  marginBottom: "0.5rem",
                }}
              >
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p style={{ fontSize: "0.82rem", color: "#6e6e80", lineHeight: 1.4 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Report Showcase (LIGHT, wider, 2-column) ──
function ReportShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <div
      ref={ref}
      style={{
        background: "#f3efe8",
        padding: "8rem 2.5rem",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div className="reveal-scale" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8e8ea0" }}>Report Preview</div>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#171717",
            }}
          >
            Your report, in 30 seconds.
          </h2>
        </div>

        {/* Window frame */}
        <div
          className="reveal-scale stagger-2"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            borderRadius: 12,
            border: "1px solid #e5e5e5",
            background: "#ffffff",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.06)",
          }}
        >
          {/* Window chrome top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              borderBottom: "1px solid #e5e5e5",
              background: "#f7f7f8",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          </div>

          {/* Report content area */}
          <div
            className="report-showcase-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "1.25rem",
              padding: "1.5rem",
            }}
          >
          {/* Left: Probability + Evidence */}
          <div
            style={{
              background: "#f7f7f8",
              borderRadius: 10,
              border: "1px solid #e5e5e5",
              padding: "2rem",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem" }}>
              <ProviderLogo provider="chatgpt" size={16} />
              <span style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8e8ea0" }}>
                ChatGPT Audit &mdash; Hana Sushi Miami
              </span>
            </div>

            {/* Probability */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
              <ProbabilityRing value={60} size={88} />
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8e8ea0", marginBottom: 4 }}>
                  Recommendation probability
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 500, color: "#171717", lineHeight: 1.2 }}>
                  60%
                </div>
                <div style={{ fontSize: "0.78rem", color: "#8e8ea0" }}>
                  Mentioned in 3 of 5 queries
                </div>
              </div>
            </div>

            {/* Query evidence */}
            <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8e8ea0", marginBottom: "0.75rem" }}>
              Query evidence
            </div>
            {[
              { q: "Best sushi in Miami", mentioned: true },
              { q: "Where to get omakase near downtown", mentioned: true },
              { q: "Top Japanese restaurants Brickell", mentioned: false },
              { q: "Romantic dinner spots Miami Beach", mentioned: true },
              { q: "Best lunch spots near me Miami", mentioned: false },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 10px",
                  borderRadius: 8,
                  background: i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: "0.78rem", color: "#6e6e80" }}>
                  &ldquo;{item.q}&rdquo;
                </span>
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: item.mentioned ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
                    color: item.mentioned ? "#16a34a" : "#dc2626",
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {item.mentioned ? "Recommended" : "Not mentioned"}
                </span>
              </div>
            ))}
          </div>

          {/* Right: Competitors + Sentiment */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Competitors */}
            <div
              style={{
                background: "#f7f7f8",
                borderRadius: 12,
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
                flex: 1,
              }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8e8ea0", marginBottom: "1rem" }}>
                Who AI recommends instead
              </div>
              {[
                { name: "Sushi Garage", mentions: 4 },
                { name: "Azabu Miami", mentions: 3 },
                { name: "Naoe", mentions: 3 },
                { name: "Hana Sushi", mentions: 3, self: true },
                { name: "Zuma Miami", mentions: 2 },
              ].map((c) => (
                <div
                  key={c.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #ececec",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: c.self ? "#171717" : "#6e6e80",
                      fontWeight: c.self ? 600 : 400,
                    }}
                  >
                    {c.name}
                    {c.self && (
                      <span style={{ fontSize: "0.62rem", color: "#8e8ea0", marginLeft: 6 }}>
                        (you)
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#8e8ea0" }}>
                    {c.mentions}/5 queries
                  </span>
                </div>
              ))}
            </div>

            {/* Sentiment */}
            <div
              style={{
                background: "#f7f7f8",
                borderRadius: 12,
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8e8ea0", marginBottom: "1rem" }}>
                Sentiment when mentioned
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "#16a34a" }}>78%</span>
                <span style={{ fontSize: "0.78rem", color: "#6e6e80" }}>positive</span>
              </div>
              <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "#e5e5e5" }}>
                <div style={{ width: "78%", background: "#16a34a", borderRadius: "3px 0 0 3px" }} />
                <div style={{ width: "15%", background: "#d97706" }} />
                <div style={{ width: "7%", background: "#dc2626", borderRadius: "0 3px 3px 0" }} />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: "0.68rem", color: "#8e8ea0" }}>
                <span>78% positive</span>
                <span>15% neutral</span>
                <span>7% negative</span>
              </div>
            </div>
          </div>
        </div>

          {/* Window chrome bottom bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 14px",
              borderTop: "1px solid #e5e5e5",
              background: "#f7f7f8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Settings icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {/* Help icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {/* Window icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8ea0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
              </svg>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 6,
                background: "#f7f7f8",
                border: "1px solid #e5e5e5",
                fontSize: "0.68rem",
                fontWeight: 500,
                color: "#8e8ea0",
              }}
            >
              Feedback
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="reveal-scale stagger-3" style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link
            href="/analyze"
            style={{
              background: "#171717",
              color: "#ffffff",
              border: "none",
              padding: "0.7rem 2rem",
              borderRadius: 8,
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "opacity 0.15s, transform 0.15s",
              textDecoration: "none",
            }}
          >
            Get your free report &rarr;
          </Link>
          <p style={{ fontSize: "0.78rem", color: "#8e8ea0", marginTop: "0.75rem" }}>
            Results in 30 seconds. No signup.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── SVG Line Chart Background ──
function LineChartBg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
      <polyline points="0,150 40,135 80,140 120,95 160,105 200,68 240,82 280,55 320,70 360,48 400,60" fill="none" stroke="#f0a070" strokeWidth="1.5" />
      <polyline points="0,160 40,148 80,125 120,135 160,115 200,122 240,98 280,108 320,88 360,95 400,82" fill="none" stroke="#f490b0" strokeWidth="1.5" />
      <polyline points="0,172 40,168 80,158 120,162 160,145 200,150 240,138 280,142 320,128 360,132 400,118" fill="none" stroke="#f5c080" strokeWidth="1.5" />
      <polyline points="0,180 40,176 80,172 120,168 160,162 200,165 240,155 280,158 320,148 360,152 400,140" fill="none" stroke="#f0a0b0" strokeWidth="1.5" />
      <polyline points="0,188 40,186 80,183 120,180 160,177 200,178 240,172 280,174 320,168 360,170 400,162" fill="none" stroke="#f5d0a0" strokeWidth="1.5" />
    </svg>
  );
}

// ── Features Section (2-col top, full-width bottom) ──
function Features() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <div
      id="features"
      ref={ref}
      style={{ position: "relative", overflow: "hidden", background: "#f3efe8" }}
    >
      <MeshGradient mode="hero" scrollFade={false} subtle />
      {/* Bottom fade to page bg */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "40%",
          zIndex: 1,
          pointerEvents: "none",
          background: "linear-gradient(to bottom, transparent 0%, rgba(243,239,232,0.6) 50%, #f3efe8 100%)",
        }}
      />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "7rem 2.5rem", position: "relative", zIndex: 2 }}>
        <div className="reveal-scale" style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8e8ea0" }}>Core Features</div>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(2rem, 3.5vw, 2.8rem)", letterSpacing: "-0.04em", lineHeight: 1.1, color: "#171717" }}>
            What your audit reveals.
          </h2>
        </div>

        {/* Top row: 2 feature cards side by side */}
        <div className="features-top-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
          {/* Card 1: Citation Tracking */}
          <div className="reveal-scale stagger-1" style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e5e5e5", overflow: "hidden", position: "relative", minHeight: 380 }}>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <LineChartBg />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.85) 50%, #ffffff 75%)" }} />
            </div>
            <div style={{ position: "relative", zIndex: 1, padding: "2rem", display: "flex", flexDirection: "column", height: "100%" }}>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#171717", marginBottom: "0.35rem" }}>
                AI Recommendation Tracking
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#6e6e80", lineHeight: 1.55, marginBottom: "auto" }}>
                Track how often each AI platform recommends your business across real customer queries.
              </p>
              <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderRadius: 12, border: "1px solid #e5e5e5", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#8e8ea0", marginBottom: 10, padding: "0 4px" }}>
                  <span>Total</span>
                  <span style={{ fontWeight: 500, color: "#6e6e80", fontSize: "0.75rem" }}>1,130</span>
                </div>
                {[
                  { name: "ChatGPT", count: 276, color: "#10a37f" },
                  { name: "Claude", count: 121, color: "#c084fc" },
                  { name: "Gemini", count: 63, color: "#4285f4" },
                ].map((p) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", borderTop: "1px solid #ececec" }}>
                    <span style={{ width: 3, height: 18, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    <ProviderLogo provider={p.name.toLowerCase()} size={16} />
                    <span style={{ fontSize: "0.82rem", color: "#6e6e80", flex: 1 }}>{p.name}</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#171717" }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Sentiment Analysis */}
          <div className="reveal-scale stagger-2" style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e5e5e5", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "2rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#171717", marginBottom: "0.35rem" }}>
                Capture the sentiment of AI responses
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#6e6e80", lineHeight: 1.55, marginBottom: "1.5rem" }}>
                Understand the brand sentiment and track changes in real-time.
              </p>
              <div style={{ borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden", flex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px", padding: "8px 14px", background: "#f7f7f8", fontSize: "0.62rem", color: "#8e8ea0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <span>Theme</span>
                  <span>Sentiment</span>
                  <span style={{ textAlign: "right" }}>Occurrences</span>
                </div>
                {[
                  { theme: "Friendly user interface", sentiment: "Positive", count: 225, change: "+36", sentColor: "#16a34a" },
                  { theme: "Expensive", sentiment: "Negative", count: 148, change: "+1", sentColor: "#dc2626" },
                  { theme: "Seamless integration", sentiment: "Positive", count: 125, change: "+12", sentColor: "#16a34a" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px", padding: "10px 14px", borderTop: "1px solid #ececec", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", color: "#171717", fontWeight: 500 }}>{row.theme}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 500, color: row.sentColor }}>{row.sentiment}</span>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                      <span style={{ fontSize: "0.78rem", color: "#6e6e80" }}>{row.count}</span>
                      <span style={{ fontSize: "0.62rem", color: "#16a34a" }}>{row.change}</span>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "14px", borderTop: "1px solid #e5e5e5", background: "#f7f7f8" }}>
                  <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #e5e5e5", padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.68rem", color: "#8e8ea0", marginBottom: 6 }}>
                      ChatGPT &middot; Response excerpt
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "#6e6e80", lineHeight: 1.55, borderLeft: "2px solid #e5e5e5", paddingLeft: 10 }}>
                      &ldquo;Hana Sushi is a popular Japanese restaurant in Miami known for its fresh omakase and friendly atmosphere. Customers frequently praise the quality of fish and attentive service...&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: 2 smaller feature cards */}
        <div className="features-bottom-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* Source Influence */}
          <div className="reveal-scale stagger-3" style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e5e5e5", padding: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#171717", marginBottom: "0.35rem" }}>
              Source Influence Analysis
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#8e8ea0", lineHeight: 1.5, marginBottom: "1.25rem" }}>
              Which directories and review sites influence your AI visibility most.
            </p>
            {[
              { name: "Google Business Profile", score: 92 },
              { name: "Yelp", score: 78 },
              { name: "TripAdvisor", score: 61 },
              { name: "Local blogs", score: 34 },
            ].map((src) => (
              <div key={src.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "0.72rem", color: "#6e6e80", width: 130, flexShrink: 0 }}>{src.name}</span>
                <div style={{ flex: 1, height: 5, background: "#f0ebe4", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${src.score}%`, height: "100%", background: `rgba(240,160,112,${src.score > 70 ? 0.85 : src.score > 50 ? 0.6 : 0.35})`, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "#6e6e80", width: 28, textAlign: "right" }}>{src.score}</span>
              </div>
            ))}
          </div>

          {/* Competitive Intelligence */}
          <div className="reveal-scale stagger-4" style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e5e5e5", padding: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#171717", marginBottom: "0.35rem" }}>
              Competitive Intelligence
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#8e8ea0", lineHeight: 1.5, marginBottom: "1.25rem" }}>
              See which competitors are being recommended over you.
            </p>
            {[
              { name: "Your business", pct: 72, highlight: true },
              { name: "Sushi Garage", pct: 65, highlight: false },
              { name: "Azabu Miami", pct: 48, highlight: false },
              { name: "Naoe", pct: 31, highlight: false },
            ].map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "0.72rem", color: c.highlight ? "#171717" : "#8e8ea0", fontWeight: c.highlight ? 600 : 400, width: 100, flexShrink: 0 }}>
                  {c.name}
                </span>
                <div style={{ flex: 1, height: 6, background: "#f0ebe4", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${c.pct}%`, height: "100%", background: c.highlight ? "#f0a070" : "rgba(240,160,112,0.25)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 500, color: c.highlight ? "#171717" : "#8e8ea0", width: 32, textAlign: "right" }}>
                  {c.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupWindow({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="how-it-works-window"
      style={{
        width: "min(100%, 20.75rem)",
        height: "clamp(23rem, 27.75vw, 27.5rem)",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(220, 213, 207, 0.95)",
        background: "rgba(255,255,255,0.96)",
        boxShadow: "0 32px 80px rgba(130, 92, 59, 0.16), 0 8px 24px rgba(0,0,0,0.06)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          height: 42,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
          borderBottom: "1px solid #e7dfda",
          background: "rgba(245, 242, 239, 0.92)",
        }}
      >
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#f87171" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#fbbf24" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#4ade80" }} />
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.75rem",
            color: "#9a9086",
            letterSpacing: "-0.01em",
          }}
        >
          {path}
        </span>
      </div>
      <div
        className="how-it-works-shell-body"
        style={{
          height: "calc(100% - 42px)",
          padding: "0.85rem 0.9rem 0.82rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.58rem",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(250,248,246,0.96) 100%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function MockupField({
  label,
  value,
  muted = false,
  trailing,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: "0.78rem",
          color: "#93887d",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
      <div
        style={{
          minHeight: 44,
          borderRadius: 6,
          border: "1px solid #e7dfda",
          background: "#f7f4f1",
          padding: "0.68rem 0.78rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          fontSize: "0.97rem",
          color: muted ? "#81786f" : "#1c1b1a",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
      >
        <span>{value}</span>
        {trailing}
      </div>
    </div>
  );
}

// ── Step Mockup: Search Form ──
function StepMockupSearch() {
  const typedBusiness = useTypewriter(["Hana Sushi Miami"]).typedText;

  return (
    <MockupWindow path="brightwill.ai/analyze">
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
          <div>
            <div
              style={{
                fontSize: "0.76rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#9a9086",
                marginBottom: 6,
              }}
            >
              Step 1
            </div>
            <div
              style={{
                fontSize: "0.98rem",
                letterSpacing: "-0.03em",
                color: "#171717",
              }}
            >
              AI Visibility Audit
            </div>
          </div>
          <div
            style={{
              padding: "0.24rem 0.5rem",
              borderRadius: 999,
              border: "1px solid #eadfd7",
              background: "rgba(255,255,255,0.72)",
              fontSize: "0.64rem",
              color: "#8e8378",
            }}
          >
            Ready to run
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <MockupField
            label="Business name"
            value={
              <>
                {typedBusiness}
                <span className="bw-typing-caret" aria-hidden>
                  |
                </span>
              </>
            }
          />
          <MockupField label="Location" value="Miami, FL" muted />
          <MockupField
            label="Category"
            value="Restaurant"
            muted
            trailing={<span style={{ fontSize: "0.74rem", color: "#93887d" }}>&#9660;</span>}
          />
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
              gap: 7,
            }}
          >
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {["ChatGPT", "Claude", "Gemini"].map((provider) => (
              <span
                key={provider}
                style={{
                  padding: "0.22rem 0.44rem",
                  borderRadius: 999,
                  border: "1px solid #e9dfd8",
                  background: "#fbf8f6",
                  fontSize: "0.62rem",
                  color: "#8b8177",
                }}
              >
                {provider}
              </span>
            ))}
          </div>
          <div
            style={{
              borderRadius: 8,
              background: "#171717",
              color: "#ffffff",
              padding: "0.58rem 0.72rem",
              textAlign: "center",
              fontSize: "0.76rem",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Run free audit &rarr;
          </div>
        </div>
      </div>
    </MockupWindow>
  );
}

// ── Step Mockup: Probability Results ──
function StepMockupResults() {
  const loadingQueries = [
    "best sushi in miami",
    "where to get omakase near downtown miami",
    "romantic dinner spots miami beach",
    "best lunch spots near me miami",
    "top japanese restaurants brickell",
  ];
  const [dots, setDots] = useState("");
  const { typedText, lineIndex, charIndex, lineLength } = useTypewriter(loadingQueries);
  const segment = loadingQueries.length > 0 ? 100 / loadingQueries.length : 100;
  const typedProgress = lineLength > 0 ? Math.min(charIndex / lineLength, 1) : 0;
  const progress = Math.min(100, Math.max(6, Math.round(lineIndex * segment + typedProgress * segment)));

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 460);
    return () => clearInterval(interval);
  }, []);

  return (
    <MockupWindow path="brightwill.ai/live-audit">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProviderLogo provider="chatgpt" size={18} />
          <div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "#9a9086",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 3,
              }}
            >
              ChatGPT loading
            </div>
            <div style={{ fontSize: "0.86rem", color: "#171717", letterSpacing: "-0.02em" }}>
              Audit running live
            </div>
          </div>
        </div>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#16a34a",
            boxShadow: "0 0 0 5px rgba(22,163,74,0.12)",
            animation: "pulse-dot 1.2s ease-in-out infinite",
          }}
        />
      </div>

      <div
        style={{
          borderRadius: 8,
          border: "1px solid #e7dfda",
          background: "rgba(247,244,241,0.92)",
          padding: "0.68rem 0.76rem 0.74rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: "0.83rem", color: "#6e6e80" }}>
            Running query {Math.min(lineIndex + 1, loadingQueries.length)} of {loadingQueries.length}
            {dots}
          </span>
          <span style={{ fontSize: "0.83rem", color: "#171717", fontWeight: 600 }}>{progress}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: "#e7e1dc", overflow: "hidden", marginBottom: 10 }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #171717 0%, #373737 100%)",
              transition: "width 0.25s ease",
            }}
          />
        </div>
        <div
          style={{
            borderRadius: 8,
            border: "1px solid #e7dfda",
            background: "#fffdfc",
            padding: "0.62rem 0.72rem",
          }}
        >
          <div
            style={{
              fontSize: "0.68rem",
              color: "#9a9086",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            Current prompt
          </div>
          <div style={{ fontSize: "0.76rem", color: "#5f5a56", lineHeight: 1.38 }}>
            &ldquo;{typedText}
            <span className="bw-typing-caret" aria-hidden>
              |
            </span>
            &rdquo;
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 5, marginTop: 2 }}>
        {[
          { q: "Business profile fetched", status: "done" as const },
          { q: "Prompt queue prepared", status: "done" as const },
          { q: "Recommendation evidence assembled", status: "done" as const },
          { q: "Parsing model response", status: "running" as const },
        ].map((item) => (
          <div
            key={item.q}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.52rem 0.68rem",
              borderRadius: 8,
              background: item.status === "running" ? "#fbf6ef" : "#f8f5f2",
              border: `1px solid ${item.status === "running" ? "#f1d8bb" : "#ece4de"}`,
            }}
          >
            <span style={{ fontSize: "0.72rem", color: "#5f5a56" }}>{item.q}</span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: item.status === "done" ? "#16a34a" : "#d97706",
                animation: item.status === "running" ? "pulse-dot 1.1s ease-in-out infinite" : undefined,
              }}
            />
          </div>
        ))}
      </div>

    </MockupWindow>
  );
}

// ── Step Mockup: Full Report ──
function StepMockupReport() {
  const [animateIn, setAnimateIn] = useState(true);
  const providers = [
    { name: "ChatGPT", pct: 60, color: "#10a37f" },
    { name: "Claude", pct: 45, color: "#c084fc" },
    { name: "Gemini", pct: 72, color: "#4285f4" },
  ];

  useEffect(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    const interval = setInterval(() => {
      setAnimateIn(false);
      const timeoutId = setTimeout(() => setAnimateIn(true), 120);
      timeoutIds.push(timeoutId);
    }, 2900);
    return () => {
      clearInterval(interval);
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, []);

  return (
    <MockupWindow path="brightwill.ai/report">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "#9a9086",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            Audit summary
          </div>
          <div style={{ fontSize: "1.02rem", color: "#171717", letterSpacing: "-0.03em" }}>
            Cross-platform results
          </div>
        </div>
        <div
          style={{
            padding: "0.28rem 0.58rem",
            borderRadius: 999,
            background: "#f4eee9",
            border: "1px solid #eadfd7",
            fontSize: "0.66rem",
            color: "#8b8177",
          }}
        >
          Shareable report
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          padding: "0.05rem 0",
        }}
      >
        {providers.map((p, i) => (
          <div
            key={p.name}
            style={{
              borderRadius: 8,
              border: "1px solid #ebe2db",
              background: "#faf7f4",
              padding: "0.58rem 0.72rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ProviderLogo provider={p.name.toLowerCase()} size={15} />
                <span style={{ fontSize: "0.76rem", color: "#5f5a56" }}>{p.name}</span>
              </div>
              <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "#171717" }}>{p.pct}%</span>
            </div>
            <div style={{ height: 6, background: "#e7e1dc", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  width: animateIn ? `${p.pct}%` : "0%",
                  height: "100%",
                  borderRadius: 999,
                  background: p.color,
                  transition: `width 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <div
          style={{
            borderRadius: 8,
            border: "1px solid #ebe2db",
            background: "#fffdfb",
            padding: "0.62rem",
          }}
        >
          <div style={{ fontSize: "0.68rem", color: "#9a9086", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Top sources
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Google Business", "Yelp", "TripAdvisor"].map((s, i) => (
              <span
                key={s}
                style={{
                  fontSize: "0.64rem",
                  padding: "0.26rem 0.44rem",
                  borderRadius: 999,
                  background: "#f7f2ee",
                  color: "#796f66",
                  border: "1px solid #ebe2db",
                  opacity: animateIn ? 1 : 0,
                  transform: animateIn ? "translateY(0)" : "translateY(4px)",
                  transition: `opacity 0.35s ease ${240 + i * 80}ms, transform 0.35s ease ${240 + i * 80}ms`,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            borderRadius: 8,
            border: "1px solid #ebe2db",
            background: "#fffdfb",
            padding: "0.62rem",
          }}
        >
          <div style={{ fontSize: "0.68rem", color: "#9a9086", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Competitor gap
          </div>
          {[
            { name: "You", value: 72, highlight: true },
            { name: "Azabu", value: 64, highlight: false },
            { name: "Naoe", value: 49, highlight: false },
          ].map((row) => (
            <div key={row.name} style={{ display: "grid", gridTemplateColumns: "36px 1fr 24px", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <span style={{ fontSize: "0.7rem", color: row.highlight ? "#171717" : "#8a8076", fontWeight: row.highlight ? 600 : 500 }}>
                {row.name}
              </span>
              <div style={{ height: 6, borderRadius: 999, background: "#e7e1dc", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${row.value}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: row.highlight ? "#171717" : "rgba(23,23,23,0.28)",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.62rem", color: "#6e6e80", textAlign: "right" }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          borderRadius: 8,
          background: "#171717",
          color: "#ffffff",
          padding: "0.72rem 0.84rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.84rem", fontWeight: 500, letterSpacing: "-0.01em" }}>Open full report</span>
        <span style={{ fontSize: "0.84rem" }}>&rarr;</span>
      </div>
    </MockupWindow>
  );
}

// ── How It Works: Alternating rows with fixed media stages ──
function HowItWorksRow({
  step,
  title,
  content,
  mockup,
  reverse,
  index,
}: {
  step: string;
  title: string;
  content: string;
  mockup: React.ReactNode;
  reverse: boolean;
  index: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className="how-it-works-row"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
        gap: "clamp(1.75rem, 3vw, 3rem)",
        alignItems: "end",
        minHeight: "clamp(25rem, 38vw, 34rem)",
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 2.5rem",
      }}
    >
      <div
        className="how-it-works-text"
        style={{
          gridColumn: reverse ? "9 / span 4" : "1 / span 4",
          gridRow: "1",
          display: "flex",
          flexDirection: "column",
          alignSelf: "end",
          paddingBottom: "0.9rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(26px)",
          transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.08s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.08s",
        }}
      >
        <>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              border: "1px solid #e7dfda",
              background: "rgba(247,244,241,0.9)",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#91877d",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 22,
              width: "fit-content",
            }}
          >
            {step}
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 2.7vw, 2.55rem)",
              fontWeight: 400,
              letterSpacing: "-0.045em",
              lineHeight: 1.08,
              color: "#171717",
              margin: "0 0 16px",
              maxWidth: 280,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: "0.98rem",
              color: "#6e6e80",
              lineHeight: 1.65,
              maxWidth: 370,
              margin: 0,
            }}
          >
            {content}
          </p>
        </>
      </div>

      <div
        className="how-it-works-media"
        style={{
          gridColumn: reverse ? "1 / span 7" : "6 / span 7",
          gridRow: "1",
          alignSelf: "end",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(34px) scale(0.985)",
          transition: `opacity 0.82s cubic-bezier(0.16,1,0.3,1) ${0.14 + index * 0.05}s, transform 0.82s cubic-bezier(0.16,1,0.3,1) ${0.14 + index * 0.05}s`,
        }}
      >
        <div
          className="how-it-works-stage"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 820,
            marginLeft: reverse ? 0 : "auto",
            marginRight: reverse ? "auto" : 0,
            aspectRatio: "1.34 / 1",
            minHeight: "clamp(25rem, 38vw, 34rem)",
            borderRadius: 6,
            overflow: "hidden",
            border: "1px solid rgba(236, 215, 201, 0.95)",
            background: [
              "radial-gradient(circle at 18% 18%, rgba(244, 185, 143, 0.68), transparent 40%)",
              "radial-gradient(circle at 82% 24%, rgba(248, 193, 203, 0.52), transparent 42%)",
              "radial-gradient(circle at 50% 72%, rgba(255, 247, 240, 0.86), transparent 48%)",
              "linear-gradient(135deg, #f6d3bf 0%, #f4cabf 24%, #f1d5cf 48%, #f3d8d5 70%, #efd6ca 100%)",
            ].join(", "),
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 55%, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.12) 42%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(2.05rem, 4.35vw, 3.35rem)",
            }}
          >
            {mockup}
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      step: "Step 1",
      title: "Enter your business",
      content:
        "Tell us your business name and location. We handle the rest — querying ChatGPT with real customer questions.",
      mockup: <StepMockupSearch />,
    },
    {
      step: "Step 2",
      title: "Watch AI run your audit",
      content:
        "See live loading progress as prompts run, responses parse, and recommendation evidence is assembled in real time.",
      mockup: <StepMockupResults />,
    },
    {
      step: "Step 3",
      title: "Get the full report",
      content:
        "Review cross-platform scores, source influence, competitor comparisons, and a shareable report snapshot.",
      mockup: <StepMockupReport />,
    },
  ];

  return (
    <div id="how" style={{ padding: "6rem 0 7rem" }}>
      {/* Section title — not sticky */}
      <div
        ref={titleRef}
        style={{
          textAlign: "center",
          maxWidth: 900,
          margin: "0 auto 5rem",
          padding: "0 2.5rem",
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#8e8ea0",
            marginBottom: "1rem",
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          Getting Started
        </div>
        <WordFadeIn
          words="See how AI sees you. In 30 seconds."
          className=""
          wordClassName=""
          scrollDriven
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "#171717",
            margin: 0,
          }}
        />
      </div>

      {/* Alternating rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4rem, 8vw, 7rem)" }}>
        {steps.map((s, i) => (
          <HowItWorksRow
            key={i}
            step={s.step}
            title={s.title}
            content={s.content}
            mockup={s.mockup}
            reverse={i % 2 === 1}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

// ── Pricing Section ──
function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  const plans = [
    {
      name: "Free Snapshot",
      price: "0",
      href: "/analyze",
      cta: "Try free audit",
      features: [
        "ChatGPT analysis only",
        "5 real queries with web search",
        "Recommendation probability score",
        "Query evidence with responses",
        "Competitor snapshot",
        "Instant results (~30 seconds)",
      ],
    },
    {
      name: "Full Audit",
      price: "99",
      featured: true,
      href: "/analyze",
      cta: "Get full audit",
      features: [
        "ChatGPT, Claude & Gemini analysis",
        "40+ queries across all 3 AI engines",
        "Source influence map",
        "Cross-platform verification",
        "80-step optimization action plan",
        "Downloadable PDF report",
        "Shareable report link",
      ],
    },
    {
      name: "Audit + Strategy",
      price: "199",
      href: "/analyze",
      cta: "Get started",
      features: [
        "Everything in Full Audit",
        "Dedicated execution roadmap",
        "Monthly re-audit to track progress",
        "3 competitor monitoring dashboards",
        "Custom GEO strategy call (30 min)",
        "Priority email support",
      ],
    },
  ];

  return (
    <div
      id="pricing"
      ref={ref}
      style={{ background: "#f3efe8" }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "8rem 2.5rem",
        }}
      >
        <div className="reveal-scale" style={{ marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8e8ea0" }}>Plans</div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "0.5rem",
              color: "#171717",
            }}
          >
            Simple pricing.
            <br />
            No surprises.
          </h2>
          <p style={{ color: "#6e6e80", fontSize: "0.95rem" }}>
            No subscriptions. Pay once, get your full report. Free snapshot available instantly.
          </p>
        </div>

        <div
          className="plans"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            maxWidth: 1040,
            margin: "0 auto",
            gap: "1rem",
          }}
        >
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`plan reveal-scale stagger-${i + 1}`}
              style={{
                background: "#ffffff",
                border: plan.featured ? "2px solid #171717" : "1px solid #e5e5e5",
                borderRadius: 12,
                padding: "2rem",
                position: "relative",
                transition: "transform 0.2s, box-shadow 0.2s",
                transform: plan.featured ? "scale(1.02)" : undefined,
                boxShadow: plan.featured ? "0 8px 32px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {plan.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: "-11px",
                    left: "1.5rem",
                    background: "#171717",
                    color: "#ffffff",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "0.25rem 0.75rem",
                    borderRadius: 999,
                  }}
                >
                  Recommended
                </div>
              )}

              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#6e6e80",
                  marginBottom: "1rem",
                }}
              >
                {plan.name}
              </div>

              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "2.4rem",
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: "0.2rem",
                  color: "#171717",
                }}
              >
                <sup style={{ fontSize: "1rem", verticalAlign: "super" }}>$</sup>
                {plan.price}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#8e8ea0",
                  marginBottom: "1.5rem",
                }}
              >
                {plan.price === "0" ? "forever" : "one-time"}
              </div>

              <div
                style={{
                  height: 2,
                  backgroundImage: "repeating-radial-gradient(circle, rgba(0,0,0,0.12) 0 1px, transparent 1px 6px)",
                  backgroundSize: "6px 100%",
                  backgroundPosition: "center",
                  marginBottom: "1.5rem",
                }}
              />

              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  marginBottom: "1.75rem",
                  padding: 0,
                }}
              >
                {plan.features.map((feature, fi) => (
                  <li
                    key={fi}
                    style={{
                      fontSize: "0.855rem",
                      color: "#6e6e80",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.55rem",
                    }}
                  >
                    <span
                      style={{
                        color: "#171717",
                        fontWeight: 500,
                        flexShrink: 0,
                        marginTop: "1px",
                      }}
                    >
                      &#10003;
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: 8,
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: plan.featured ? "none" : "1px solid #e5e5e5",
                  background: plan.featured ? "#171717" : "transparent",
                  color: plan.featured ? "#ffffff" : "#171717",
                  transition: "all 0.15s",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FAQ Section ──
function FAQ() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is GEO?",
      a: "GEO (Generative Engine Optimization) is how you ensure AI assistants like ChatGPT, Claude, and Gemini recommend your business when people ask for suggestions. Think of it like SEO, but for AI instead of Google.",
    },
    {
      q: "How is this different from SEO?",
      a: "SEO optimizes your website for Google search rankings. GEO optimizes your online presence so AI assistants recommend you. They use different signals — AI pulls from reviews, directories, structured data, and citations, not just keywords and backlinks.",
    },
    {
      q: "Will this actually help my business?",
      a: "Millions of people now ask AI for local recommendations instead of searching Google. If AI doesn't recommend you, those customers go to your competitors. Our audit shows you exactly where you stand and gives you a step-by-step plan to fix it.",
    },
    {
      q: "How long does the full audit take?",
      a: "The free snapshot takes about 30 seconds. The full audit runs 40+ queries across all 3 AI platforms and takes 5-15 minutes. We'll email you when your report is ready.",
    },
    {
      q: "What do I get with the full audit?",
      a: "A comprehensive report showing how you appear on ChatGPT, Claude, and Gemini, a source influence map showing what drives AI recommendations, cross-platform comparison, and an 80-step action plan customized to your business.",
    },
  ];

  return (
    <div ref={ref} style={{ maxWidth: 740, margin: "0 auto", padding: "6rem 2.5rem" }}>
      <div className="reveal-scale" style={{ marginBottom: "2.5rem" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8e8ea0" }}>FAQ</div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "#171717",
          }}
        >
          Common questions
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`reveal-scale stagger-${Math.min(i + 1, 5)}`}
            style={{
              borderBottom: "none",
              backgroundImage: "repeating-radial-gradient(circle, rgba(0,0,0,0.12) 0 1px, transparent 1px 6px)",
              backgroundSize: "6px 2px",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "bottom center",
              paddingBottom: 2,
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 0",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#171717" }}>{faq.q}</span>
              <span
                style={{
                  fontSize: "1.2rem",
                  color: "#8e8ea0",
                  transition: "transform 0.2s",
                  transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  flexShrink: 0,
                  marginLeft: 16,
                }}
              >
                +
              </span>
            </button>
            <div
              style={{
                maxHeight: open === i ? 200 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <p style={{ fontSize: "0.85rem", color: "#6e6e80", lineHeight: 1.6, padding: "0 0 1.25rem", margin: 0 }}>
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CTA + Footer Section (with mesh gradient) ──
function CTAFooter() {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "#fdf8f5" }}>
      {/* Top gradient fade from white into the mesh */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          zIndex: 1,
          pointerEvents: "none",
          background: "linear-gradient(to bottom, #f3efe8 0%, rgba(243,239,232,0.6) 50%, transparent 100%)",
        }}
      />

      <MeshGradient mode="hero" scrollFade={false} />

      {/* CTA content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "10rem 2.5rem 6rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8e8ea0" }}>Free Audit</div>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#171717",
              marginBottom: "1.25rem",
            }}
          >
            See how AI sees your business.
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#6e6e80", marginBottom: "2rem" }}>
            Real queries. Real responses. No signup required.
          </p>
          <Link
            href="/analyze"
            style={{
              background: "#171717",
              color: "#ffffff",
              border: "none",
              padding: "0.75rem 2rem",
              borderRadius: 8,
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "opacity 0.15s, transform 0.15s",
              textDecoration: "none",
            }}
          >
            Run your free audit &rarr;
          </Link>
          <p style={{ fontSize: "0.72rem", color: "#8e8ea0", marginTop: "0.75rem" }}>
            Results in 30 seconds
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 2,
          padding: "1.5rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          borderTop: "none",
          backgroundImage: "repeating-radial-gradient(circle, rgba(0,0,0,0.08) 0 1px, transparent 1px 6px)",
          backgroundSize: "6px 2px",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "top center",
          paddingTop: "calc(1.5rem + 2px)",
        }}
      >
        <span style={{ fontWeight: 500, fontSize: "0.9rem", letterSpacing: "-0.02em", color: "#171717" }}>
          BrightWill
        </span>
        <p style={{ fontSize: "0.78rem", color: "#8e8ea0" }}>
          &copy; 2025 BrightWill. Generative Engine Optimization for local businesses.
        </p>
        <p style={{ fontSize: "0.78rem", color: "#8e8ea0" }}>hello@brightwill.ai</p>
      </footer>
    </div>
  );
}

// ── Main Page ──
export default function Home() {
  return (
    <div className="grid-bg" style={{ background: "#f3efe8" }}>
      <Nav />
      <Hero />
      <div className="section-divider-dotted" />
      <Stats />
      <div className="section-divider-dotted" />
      <HowItWorks />
      <div className="section-divider-dotted" />
      <Features />
      <div className="section-divider-dotted" />
      <ReportShowcase />
      <div className="section-divider-dotted" />
      <Pricing />
      <div className="section-divider-dotted" />
      <FAQ />
      <CTAFooter />
    </div>
  );
}
