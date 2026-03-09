"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ProviderLogo } from "@/components/ui/provider-logo";

// ── Shared scroll-reveal hook ──
function useReveal(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold }
    );
    const targets = el.querySelectorAll(
      ".reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-blur"
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [ref, threshold]);
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
          stroke="rgba(255,255,255,0.08)"
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
          fontWeight: 700,
          color: "#ffffff",
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
        background: "rgba(12,13,16,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #22232a",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 700,
          fontSize: "1.05rem",
          letterSpacing: "-0.02em",
          color: "#ffffff",
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
        <li><a href="#features" className="nav-link">Features</a></li>
        <li><a href="#how" className="nav-link">How it works</a></li>
        <li><a href="#pricing" className="nav-link">Pricing</a></li>
      </ul>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Link href="/analyze" className="btn-pill">
          Get free audit
        </Link>
      </div>
    </nav>
  );
}

// ── Hero Report Mockup (replaces GlobeCard) ──
function HeroReportMockup() {
  const queries = [
    { text: "Best sushi in Miami", mentioned: true },
    { text: "Where to get omakase near downtown Miami", mentioned: true },
    { text: "Top Japanese restaurants Brickell", mentioned: false },
    { text: "Romantic dinner spots Miami Beach", mentioned: true },
  ];

  return (
    <div
      style={{
        background: "#14151a",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "1.75rem",
        maxWidth: 440,
        width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
        <ProviderLogo provider="chatgpt" size={16} />
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          ChatGPT Audit &mdash; Hana Sushi Miami
        </span>
      </div>

      {/* Probability */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <ProbabilityRing value={60} size={72} />
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
            60% probability
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
            Recommended in 3 of 5 queries
          </div>
        </div>
      </div>

      {/* Query evidence */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {queries.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              borderRadius: 8,
              background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
            }}
          >
            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>
              &ldquo;{item.text}&rdquo;
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                background: item.mentioned ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)",
                color: item.mentioned ? "#4ade80" : "#f87171",
                fontSize: "0.65rem",
                fontWeight: 600,
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
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: "0.7rem",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        Based on 5 real ChatGPT queries
      </div>
    </div>
  );
}

// ── Hero Section (DARK) ──
function Hero() {
  return (
    <section style={{ background: "#0c0d10" }}>
      <div
        className="hero"
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "center",
          padding: "8rem 2.5rem 5rem",
          maxWidth: "1140px",
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
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ width: 5, height: 5, background: "#ffffff", borderRadius: "50%" }} />
            AI Visibility Audit
          </span>

          <h1
            className="animate-up"
            style={{
              animationDelay: "0.2s",
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.8rem, 4.5vw, 4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: "1.25rem",
              color: "#ffffff",
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
              color: "rgba(255,255,255,0.5)",
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
            <Link href="/analyze" className="btn-outline-light" style={{ gap: "0.4rem" }}>
              Run free audit <span style={{ marginLeft: 2 }}>&rarr;</span>
            </Link>
            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
              No signup. Real AI responses.
            </span>
          </div>
        </div>

        <div className="hero-right animate-up" style={{ animationDelay: "0.3s", display: "flex", justifyContent: "flex-end" }}>
          <HeroReportMockup />
        </div>
      </div>
    </section>
  );
}

// ── Platform Bar (replaces LogosStrip) ──
function PlatformBar() {
  const platforms = [
    { name: "ChatGPT", color: "#10a37f" },
    { name: "Claude", color: "#c084fc" },
    { name: "Gemini", color: "#4285f4" },
  ];

  return (
    <div
      style={{
        borderBottom: "1px solid #22232a",
        background: "#0c0d10",
        padding: "1.1rem 2.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            fontWeight: 500,
          }}
        >
          Analyzes responses from
        </span>
        {platforms.map((p) => (
          <div
            key={p.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ProviderLogo provider={p.name.toLowerCase()} size={18} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
              {p.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stats Section ──
function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  const stats = [
    { value: 100, suffix: "M+", label: "Daily AI searches your customers are making" },
    { value: 40, suffix: "+", label: "Real queries per comprehensive audit" },
    { value: 3, suffix: "", label: "AI platforms tested simultaneously" },
  ];

  return (
    <div
      ref={ref}
      style={{
        background: "#0c0d10",
      }}
    >
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "5rem 2.5rem",
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
                borderRight: i < 2 ? "1px solid #22232a" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  color: "#ffffff",
                  marginBottom: "0.5rem",
                }}
              >
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── How We Measure Section ──
function HowWeMeasure() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <div
      ref={ref}
      style={{
        background: "#0c0d10",
      }}
    >
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "6rem 2.5rem",
        }}
      >
        <div
          className="measure-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          {/* Left */}
          <div className="reveal-left">
            <p
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "0.75rem",
                fontWeight: 600,
              }}
            >
              Our methodology
            </p>
            <h2
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                marginBottom: "1.5rem",
                color: "#ffffff",
              }}
            >
              Recommendation probability, not rank.
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.65,
                marginBottom: "1.5rem",
              }}
            >
              AI responses change with every query. A single test tells you nothing.
              We run dozens of real queries and measure the actual probability that each
              AI engine recommends your business.
            </p>
            <Link href="/analyze" className="btn-pill-dark" style={{ display: "inline-flex", gap: "0.4rem" }}>
              Try it free <span>&rarr;</span>
            </Link>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "0.75rem" }}>
              Transparent methodology. Every query visible.
            </p>
          </div>

          {/* Right */}
          <div className="reveal-right">
            <div
              style={{
                background: "#14151a",
                borderRadius: 12,
                border: "1px solid #22232a",
                padding: "1.75rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: "1rem",
                }}
              >
                Example: Hana Sushi, Miami FL
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <ProbabilityRing value={60} size={72} />
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
                    60% probability
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                    ChatGPT recommends in 3 of 5 queries
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { query: "Best sushi in Miami", mentioned: true },
                  { query: "Where to get omakase near downtown Miami", mentioned: true },
                  { query: "Top Japanese restaurants Brickell", mentioned: false },
                  { query: "Romantic dinner spots Miami Beach", mentioned: true },
                  { query: "Best lunch spots near me Miami", mentioned: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      borderRadius: 8,
                      background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
                    }}
                  >
                    <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
                      &ldquo;{item.query}&rdquo;
                    </span>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 999,
                        background: item.mentioned ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)",
                        color: item.mentioned ? "#4ade80" : "#f87171",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        flexShrink: 0,
                        marginLeft: 10,
                      }}
                    >
                      {item.mentioned ? "Recommended" : "Not mentioned"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Report Showcase (DARK, wider, 2-column) ──
function ReportShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <div
      ref={ref}
      style={{
        background: "linear-gradient(180deg, #0c0d10 0%, #14151a 100%)",
        padding: "6rem 2.5rem",
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        <div className="reveal-scale" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "0.75rem",
              fontWeight: 600,
            }}
          >
            Free audit output
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#ffffff",
            }}
          >
            Your report, in 30 seconds.
          </h2>
        </div>

        {/* 2-column report mockup */}
        <div
          className="reveal-scale stagger-2 report-showcase-grid"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "1.25rem",
          }}
        >
          {/* Left: Probability + Evidence */}
          <div
            style={{
              background: "#14151a",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "2rem",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem" }}>
              <ProviderLogo provider="chatgpt" size={16} />
              <span style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)" }}>
                ChatGPT Audit &mdash; Hana Sushi Miami
              </span>
            </div>

            {/* Probability */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
              <ProbabilityRing value={60} size={88} />
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                  Recommendation probability
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>
                  60%
                </div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                  Mentioned in 3 of 5 queries
                </div>
              </div>
            </div>

            {/* Query evidence */}
            <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem" }}>
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
                  background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
                  &ldquo;{item.q}&rdquo;
                </span>
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: item.mentioned ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)",
                    color: item.mentioned ? "#4ade80" : "#f87171",
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
                background: "#14151a",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "1.5rem",
                flex: 1,
              }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
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
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: c.self ? "#ffffff" : "rgba(255,255,255,0.6)",
                      fontWeight: c.self ? 600 : 400,
                    }}
                  >
                    {c.name}
                    {c.self && (
                      <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>
                        (you)
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                    {c.mentions}/5 queries
                  </span>
                </div>
              ))}
            </div>

            {/* Sentiment */}
            <div
              style={{
                background: "#14151a",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "1.5rem",
              }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
                Sentiment when mentioned
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#4ade80" }}>78%</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>positive</span>
              </div>
              <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
                <div style={{ width: "78%", background: "#16a34a", borderRadius: "3px 0 0 3px" }} />
                <div style={{ width: "15%", background: "#d97706" }} />
                <div style={{ width: "7%", background: "#dc2626", borderRadius: "0 3px 3px 0" }} />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>
                <span>78% positive</span>
                <span>15% neutral</span>
                <span>7% negative</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="reveal-scale stagger-3" style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link
            href="/analyze"
            className="btn-pill-white"
            style={{
              background: "#ffffff",
              color: "#0c0d10",
              border: "none",
              padding: "0.7rem 2rem",
              borderRadius: 8,
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 600,
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
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", marginTop: "0.75rem" }}>
            Results in 30 seconds. No signup.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Features Section ──
function Features() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  const features = [
    {
      title: "AI Recommendation Tracking",
      body: "Track exactly how often your business appears in AI-generated recommendations across ChatGPT, Claude, and Gemini. See your recommendation probability backed by real data.",
      visual: "probability",
    },
    {
      title: "Query Evidence",
      body: "See exactly what AI says about your business. Every query, every response, every mention \u2014 with full transparency into what drives AI recommendations.",
      visual: "evidence",
    },
    {
      title: "Source Influence Analysis",
      body: "AI models cite authoritative sources. Understand which directories, review sites, and content platforms influence your AI visibility the most.",
      visual: "citations",
    },
    {
      title: "Competitive Intelligence",
      body: "See which competitors are being recommended over you, and exactly what signals drive their rankings. Identify gaps and opportunities.",
      visual: "competitors",
    },
  ];

  return (
    <div
      id="features"
      ref={ref}
      style={{
        background: "#0c0d10",
      }}
    >
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "6rem 2.5rem",
        }}
      >
        <div className="reveal-scale" style={{ marginBottom: "3.5rem", maxWidth: 600 }}>
          <p
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "0.75rem",
              fontWeight: 600,
            }}
          >
            Platform
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#ffffff",
            }}
          >
            What your audit reveals.
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {features.map((feature, i) => (
            <div
              key={i}
              className={`reveal-scale feature-card-new stagger-${(i % 5) + 1}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2.5rem",
                alignItems: "center",
                background: "#14151a",
                borderRadius: 12,
                border: "1px solid #22232a",
                padding: "2.5rem",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: "1rem",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    marginBottom: "0.75rem",
                    color: "#ffffff",
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
                  {feature.body}
                </p>
              </div>
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                <FeatureVisual type={feature.visual} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Feature Card Visuals ──
function FeatureVisual({ type }: { type: string }) {
  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    padding: "1.5rem",
    minHeight: 200,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  switch (type) {
    case "probability":
      return (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
            <ProbabilityRing value={72} size={64} />
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff" }}>72% probability</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>ChatGPT recommendation rate</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Claude", pct: 58, color: "#c084fc" },
              { label: "Gemini", pct: 65, color: "#4285f4" },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 8,
                  padding: "0.6rem 0.75rem",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <ProviderLogo provider={p.label.toLowerCase()} size={12} />
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)" }}>{p.label}</span>
                </div>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "evidence":
      return (
        <div style={cardStyle}>
          {[
            { q: "Best sushi in Miami", status: "Recommended", color: "#4ade80", bg: "rgba(22,163,74,0.15)" },
            { q: "Top restaurants Brickell", status: "Mentioned", color: "#fbbf24", bg: "rgba(217,119,6,0.15)" },
            { q: "Where to eat near me", status: "Not mentioned", color: "#f87171", bg: "rgba(220,38,38,0.15)" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.6rem 0.75rem",
                borderRadius: 6,
                background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>&ldquo;{item.q}&rdquo;</span>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: item.bg,
                  color: item.color,
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      );

    case "citations":
      return (
        <div style={cardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem" }}>
            Source influence
          </div>
          {[
            { name: "Google Business Profile", score: 92 },
            { name: "Yelp", score: 78 },
            { name: "TripAdvisor", score: 61 },
            { name: "Local blogs", score: 34 },
          ].map((src) => (
            <div key={src.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", width: 120, flexShrink: 0 }}>{src.name}</span>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${src.score}%`, height: "100%", background: "#ffffff", borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", width: 28, textAlign: "right" }}>{src.score}</span>
            </div>
          ))}
        </div>
      );

    case "competitors":
      return (
        <div style={cardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem" }}>
            Competitive landscape
          </div>
          {[
            { name: "Your business", pct: 72, highlight: true },
            { name: "Competitor A", pct: 65, highlight: false },
            { name: "Competitor B", pct: 48, highlight: false },
            { name: "Competitor C", pct: 31, highlight: false },
          ].map((c) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: "0.72rem", color: c.highlight ? "#ffffff" : "rgba(255,255,255,0.4)", fontWeight: c.highlight ? 600 : 400, width: 100, flexShrink: 0 }}>
                {c.name}
              </span>
              <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${c.pct}%`,
                    height: "100%",
                    background: c.highlight ? "#ffffff" : "rgba(255,255,255,0.2)",
                    borderRadius: 3,
                  }}
                />
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: c.highlight ? "#ffffff" : "rgba(255,255,255,0.4)", width: 32, textAlign: "right" }}>
                {c.pct}%
              </span>
            </div>
          ))}
        </div>
      );

    default:
      return <div style={cardStyle} />;
  }
}

// ── How It Works Section ──
function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  const steps = [
    {
      num: "01",
      title: "Enter your business name.",
      desc: "Tell us your business name and location. We query ChatGPT with 5 real customer questions and show you exactly what it says.",
    },
    {
      num: "02",
      title: "See your probability score.",
      desc: "Your recommendation probability \u2014 the percentage of queries where AI mentions your business. With full evidence: every query, every response.",
    },
    {
      num: "03",
      title: "Get the comprehensive audit.",
      desc: "40+ queries across ChatGPT, Claude, and Gemini. Source influence mapping. Competitor analysis. Shareable report.",
    },
  ];

  return (
    <div
      id="how"
      ref={ref}
      style={{
        background: "#0c0d10",
      }}
    >
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "6rem 2.5rem",
        }}
      >
        <div className="reveal-scale" style={{ marginBottom: "3.5rem" }}>
          <p
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "0.75rem",
              fontWeight: 600,
            }}
          >
            The process
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#ffffff",
            }}
          >
            See how AI sees you.
            <br />
            In 30 seconds.
          </h2>
        </div>

        <div
          className="steps-row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className={`step-col reveal-scale stagger-${i + 1}`}
              style={{
                padding:
                  i === 0 ? "2rem 2rem 2rem 0" : i === 1 ? "2rem 2rem" : "2rem 0 2rem 2rem",
                borderRight: i < 2 ? "1px solid #22232a" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: "5rem",
                  lineHeight: 1,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.08)",
                  marginBottom: "1rem",
                  display: "block",
                }}
              >
                {step.num}
              </span>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  letterSpacing: "-0.02em",
                  marginBottom: "0.5rem",
                  color: "#ffffff",
                }}
              >
                {step.title}
              </div>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
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
      name: "Free Audit",
      price: "0",
      href: "/analyze",
      features: [
        "5 real ChatGPT queries",
        "Recommendation probability score",
        "Query evidence with responses",
        "Competitor snapshot",
        "Sentiment analysis",
      ],
    },
    {
      name: "Full Audit",
      price: "399",
      featured: true,
      href: "/analyze",
      features: [
        "40+ queries across 3 AI engines",
        "ChatGPT, Claude & Gemini analysis",
        "Source influence map",
        "Verification prompts",
        "Actionable optimization playbook",
        "Shareable report link",
      ],
    },
    {
      name: "Management",
      price: "299",
      href: "/signup",
      features: [
        "Monthly comprehensive audits",
        "Citation building & submissions",
        "AI-optimized content creation",
        "Structured data management",
        "Review velocity strategy",
        "Dedicated account manager",
      ],
    },
  ];

  return (
    <div
      id="pricing"
      ref={ref}
      style={{
        background: "#0c0d10",
      }}
    >
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "6rem 2.5rem",
        }}
      >
        <div className="reveal-scale" style={{ marginBottom: "3rem" }}>
          <h2
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "0.5rem",
              color: "#ffffff",
            }}
          >
            Simple pricing.
            <br />
            No surprises.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>
            No contracts. Cancel any time. Results typically visible in 30-60 days.
          </p>
        </div>

        <div
          className="plans"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
        >
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`plan reveal-scale stagger-${i + 1}`}
              style={{
                background: "#14151a",
                border: plan.featured ? "1px solid rgba(255,255,255,0.15)" : "1px solid #22232a",
                borderRadius: 12,
                padding: "2rem",
                position: "relative",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              {plan.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: "-11px",
                    left: "1.5rem",
                    background: "#ffffff",
                    color: "#0c0d10",
                    fontSize: "0.7rem",
                    fontWeight: 600,
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
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "1rem",
                }}
              >
                {plan.name}
              </div>

              <div
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: "2.4rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: "0.2rem",
                  color: "#ffffff",
                }}
              >
                <sup style={{ fontSize: "1rem", verticalAlign: "super" }}>$</sup>
                {plan.price}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: "1.5rem",
                }}
              >
                {plan.price === "0" ? "forever" : plan.name === "Full Audit" ? "one-time" : "per month"}
              </div>

              <div
                style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.1)",
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
                      color: "rgba(255,255,255,0.7)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.55rem",
                    }}
                  >
                    <span
                      style={{
                        color: "#ffffff",
                        fontWeight: 700,
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
                className={plan.featured ? "plan-btn-featured" : "plan-btn"}
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: 8,
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: plan.featured ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.15)",
                  background: plan.featured ? "#ffffff" : "transparent",
                  color: plan.featured ? "#0c0d10" : "#ffffff",
                  transition: "all 0.15s",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                {plan.price === "0" ? "Try free audit" : plan.name === "Management" ? "Contact us" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CTA Section (DARK, no globe) ──
function CTA() {
  return (
    <div
      style={{
        background: "#0c0d10",
        padding: "6rem 2.5rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "0.75rem",
            fontWeight: 600,
          }}
        >
          Free audit
        </p>
        <h2
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "#ffffff",
            marginBottom: "1.25rem",
          }}
        >
          See how AI sees your business.
        </h2>
        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", marginBottom: "2rem" }}>
          Real queries. Real responses. No signup required.
        </p>
        <Link
          href="/analyze"
          className="btn-pill-white"
          style={{
            background: "#ffffff",
            color: "#0c0d10",
            border: "none",
            padding: "0.75rem 2rem",
            borderRadius: 8,
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "0.95rem",
            fontWeight: 600,
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
        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "0.75rem" }}>
          Results in 30 seconds
        </p>
      </div>
    </div>
  );
}

// ── Footer (DARK) ──
function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #22232a",
        padding: "1.5rem 2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        background: "#0c0d10",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.02em", color: "#ffffff" }}>
        BrightWill
      </span>
      <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
        &copy; 2025 BrightWill. Generative Engine Optimization for local businesses.
      </p>
      <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>hello@brightwill.ai</p>
    </footer>
  );
}

// ── Section Divider ──
function SectionDivider() {
  return (
    <div
      style={{
        height: "1px",
        background: "#22232a",
        maxWidth: "1140px",
        margin: "0 auto",
      }}
    />
  );
}

// ── Main Page ──
export default function Home() {
  return (
    <div style={{ background: "#0c0d10" }}>
      <Nav />
      <Hero />
      <PlatformBar />
      <Stats />
      <SectionDivider />
      <HowWeMeasure />
      <ReportShowcase />
      <Features />
      <SectionDivider />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
