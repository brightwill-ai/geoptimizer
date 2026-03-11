"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { SectionDivider as DottedDivider } from "@/components/ui/section-divider";
import { FeatureSteps } from "@/components/ui/feature-section";
import { Particles } from "@/components/ui/particles";
import { DottedSurface } from "@/components/ui/dotted-surface";

// ── Shared scroll-reveal hook ──
function useReveal(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
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
  }, [ref, threshold]);
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
          fontWeight: 500,
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
        background: "rgba(9,9,11,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
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
          color: "#ffffff",
          textDecoration: "none",
        }}
      >
        <Image
          src="/logo.png"
          alt="BrightWill"
          width={28}
          height={28}
          style={{ borderRadius: 4 }}
        />
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
  const { lineIndex, typedText } = useTypewriter(queries.map((query) => query.text));
  const activeQuery = queries[lineIndex % queries.length] ?? queries[0];

  return (
    <div
      style={{
        background: "#111113",
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
            fontWeight: 500,
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
          <div style={{ fontSize: "1.1rem", fontWeight: 500, color: "#ffffff" }}>
            60% probability
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
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
            background: "rgba(255,255,255,0.05)",
            minHeight: 34,
          }}
        >
          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.84)" }} aria-live="polite">
            &ldquo;{typedText}&rdquo;
            <span className="bw-typing-caret" aria-hidden>
              |
            </span>
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: activeQuery.mentioned ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)",
              color: activeQuery.mentioned ? "#4ade80" : "#f87171",
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
    <section style={{ position: "relative", overflow: "hidden" }}>
      {/* Dotted surface background */}
      <DottedSurface
        className="absolute inset-0"
        dotColor="rgba(255,255,255,0.08)"
        dotSize={1}
        gap={28}
      />

      {/* Particles — mouse-reactive */}
      <Particles
        className="absolute inset-0"
        quantity={120}
        staticity={40}
        ease={60}
        size={0.5}
        color="#ffffff"
      />

      {/* Radial glow center highlight */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          width: "100%",
          height: "100%",
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.04), transparent 55%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="hero"
        style={{
          position: "relative",
          zIndex: 2,
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
              fontWeight: 500,
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
              fontFamily: "var(--font-display)",
              fontWeight: 300,
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
        padding: "3.5rem 2.5rem",
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
              gap: 8,
            }}
          >
            <span style={{ width: 3, height: 20, borderRadius: 2, background: p.color, flexShrink: 0 }} />
            <ProviderLogo provider={p.name.toLowerCase()} size={18} />
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
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
    >
      <div
        style={{
          maxWidth: "1140px",
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
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
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
// ── Report Showcase (DARK, wider, 2-column) ──
function ReportShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <div
      ref={ref}
      style={{
        background: "linear-gradient(180deg, transparent 0%, #111113 100%)",
        padding: "8rem 2.5rem",
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        <div className="reveal-scale" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>Report Preview</div>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#ffffff",
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
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#0e0e11",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {/* Window chrome top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
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
              background: "#111113",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "2rem",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem" }}>
              <ProviderLogo provider="chatgpt" size={16} />
              <span style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)" }}>
                ChatGPT Audit &mdash; Hana Sushi Miami
              </span>
            </div>

            {/* Probability */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
              <ProbabilityRing value={60} size={88} />
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                  Recommendation probability
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 500, color: "#ffffff", lineHeight: 1.2 }}>
                  60%
                </div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                  Mentioned in 3 of 5 queries
                </div>
              </div>
            </div>

            {/* Query evidence */}
            <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem" }}>
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
                    fontWeight: 500,
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
                background: "#111113",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "1.5rem",
                flex: 1,
              }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
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
                background: "#111113",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "1.5rem",
              }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
                Sentiment when mentioned
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "#4ade80" }}>78%</span>
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

          {/* Window chrome bottom bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Settings icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {/* Help icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {/* Window icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                fontSize: "0.68rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.3)",
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
            className="btn-pill-white"
            style={{
              background: "#ffffff",
              color: "#09090b",
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
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", marginTop: "0.75rem" }}>
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
    <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
      <polyline points="0,150 40,135 80,140 120,95 160,105 200,68 240,82 280,55 320,70 360,48 400,60" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      <polyline points="0,160 40,148 80,125 120,135 160,115 200,122 240,98 280,108 320,88 360,95 400,82" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <polyline points="0,172 40,168 80,158 120,162 160,145 200,150 240,138 280,142 320,128 360,132 400,118" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
      <polyline points="0,180 40,176 80,172 120,168 160,162 200,165 240,155 280,158 320,148 360,152 400,140" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <polyline points="0,188 40,186 80,183 120,180 160,177 200,178 240,172 280,174 320,168 360,170 400,162" fill="none" stroke="#a855f7" strokeWidth="1.5" />
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
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "7rem 2.5rem" }}>
        <div className="reveal-scale" style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>Core Features</div>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(2rem, 3.5vw, 2.8rem)", letterSpacing: "-0.04em", lineHeight: 1.1, color: "#ffffff" }}>
            What your audit reveals.
          </h2>
        </div>

        {/* Top row: 2 feature cards side by side */}
        <div className="features-top-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
          {/* Card 1: Citation Tracking */}
          <div className="reveal-scale stagger-1" style={{ background: "#111113", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative", minHeight: 380 }}>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <LineChartBg />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(17,17,19,0.3) 0%, rgba(17,17,19,0.85) 50%, #111113 75%)" }} />
            </div>
            <div style={{ position: "relative", zIndex: 1, padding: "2rem", display: "flex", flexDirection: "column", height: "100%" }}>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#ffffff", marginBottom: "0.35rem" }}>
                AI Recommendation Tracking
              </h3>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.55, marginBottom: "auto" }}>
                Track how often each AI platform recommends your business across real customer queries.
              </p>
              <div style={{ background: "rgba(9,9,11,0.7)", backdropFilter: "blur(8px)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginBottom: 10, padding: "0 4px" }}>
                  <span>Total</span>
                  <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>1,130</span>
                </div>
                {[
                  { name: "ChatGPT", count: 276, color: "#10a37f" },
                  { name: "Claude", count: 121, color: "#c084fc" },
                  { name: "Gemini", count: 63, color: "#4285f4" },
                ].map((p) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ width: 3, height: 18, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    <ProviderLogo provider={p.name.toLowerCase()} size={16} />
                    <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", flex: 1 }}>{p.name}</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#ffffff" }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Sentiment Analysis */}
          <div className="reveal-scale stagger-2" style={{ background: "#111113", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "2rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#ffffff", marginBottom: "0.35rem" }}>
                Capture the sentiment of AI responses
              </h3>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.55, marginBottom: "1.5rem" }}>
                Understand the brand sentiment and track changes in real-time.
              </p>
              <div style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", flex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px", padding: "8px 14px", background: "rgba(255,255,255,0.03)", fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <span>Theme</span>
                  <span>Sentiment</span>
                  <span style={{ textAlign: "right" }}>Occurrences</span>
                </div>
                {[
                  { theme: "Friendly user interface", sentiment: "Positive", count: 225, change: "+36", sentColor: "#4ade80" },
                  { theme: "Expensive", sentiment: "Negative", count: 148, change: "+1", sentColor: "#f87171" },
                  { theme: "Seamless integration", sentiment: "Positive", count: 125, change: "+12", sentColor: "#4ade80" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px", padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", color: "#ffffff", fontWeight: 500 }}>{row.theme}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 500, color: row.sentColor }}>{row.sentiment}</span>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                      <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>{row.count}</span>
                      <span style={{ fontSize: "0.62rem", color: "#4ade80" }}>{row.change}</span>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "14px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ background: "rgba(9,9,11,0.6)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                      ChatGPT &middot; Response excerpt
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.55, borderLeft: "2px solid rgba(255,255,255,0.08)", paddingLeft: 10 }}>
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
          <div className="reveal-scale stagger-3" style={{ background: "#111113", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#ffffff", marginBottom: "0.35rem" }}>
              Source Influence Analysis
            </h3>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: "1.25rem" }}>
              Which directories and review sites influence your AI visibility most.
            </p>
            {[
              { name: "Google Business Profile", score: 92 },
              { name: "Yelp", score: 78 },
              { name: "TripAdvisor", score: 61 },
              { name: "Local blogs", score: 34 },
            ].map((src) => (
              <div key={src.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", width: 130, flexShrink: 0 }}>{src.name}</span>
                <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${src.score}%`, height: "100%", background: `rgba(255,255,255,${src.score > 70 ? 0.7 : src.score > 50 ? 0.4 : 0.2})`, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", width: 28, textAlign: "right" }}>{src.score}</span>
              </div>
            ))}
          </div>

          {/* Competitive Intelligence */}
          <div className="reveal-scale stagger-4" style={{ background: "#111113", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 500, letterSpacing: "-0.02em", color: "#ffffff", marginBottom: "0.35rem" }}>
              Competitive Intelligence
            </h3>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: "1.25rem" }}>
              See which competitors are being recommended over you.
            </p>
            {[
              { name: "Your business", pct: 72, highlight: true },
              { name: "Sushi Garage", pct: 65, highlight: false },
              { name: "Azabu Miami", pct: 48, highlight: false },
              { name: "Naoe", pct: 31, highlight: false },
            ].map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "0.72rem", color: c.highlight ? "#ffffff" : "rgba(255,255,255,0.4)", fontWeight: c.highlight ? 600 : 400, width: 100, flexShrink: 0 }}>
                  {c.name}
                </span>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${c.pct}%`, height: "100%", background: c.highlight ? "#ffffff" : "rgba(255,255,255,0.15)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 500, color: c.highlight ? "#ffffff" : "rgba(255,255,255,0.4)", width: 32, textAlign: "right" }}>
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

// ── Step Mockup: Search Form ──
function StepMockupSearch() {
  const typedBusiness = useTypewriter(["Hana Sushi Miami"]).typedText;

  return (
    <div className="mockup-frame" style={{ padding: 0 }}>
      <div style={{ height: 32, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", position: "relative", zIndex: 2 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
        <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)" }}>brightwill.ai/analyze</span>
      </div>
      <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
          AI Visibility Audit
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Business name</div>
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "8px 10px", fontSize: "0.78rem", color: "#ffffff" }}>
            {typedBusiness}
            <span className="bw-typing-caret" aria-hidden>
              |
            </span>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Location</div>
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "8px 10px", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>
            Miami, FL
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Category</div>
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "8px 10px", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Restaurant
            <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)" }}>▼</span>
          </div>
        </div>
        <div style={{ background: "#ffffff", color: "#09090b", borderRadius: 6, padding: "8px", textAlign: "center", fontSize: "0.78rem", fontWeight: 500 }}>
          Run free audit →
        </div>
      </div>
    </div>
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
    <div className="mockup-frame" style={{ padding: 0 }}>
      <div style={{ height: 32, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", position: "relative", zIndex: 2 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
      </div>
      <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <ProviderLogo provider="chatgpt" size={14} />
          <span style={{ fontSize: "0.62rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)" }}>
            ChatGPT Loading
          </span>
          <span
            style={{
              marginLeft: 4,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ade80",
              animation: "pulse-dot 1.2s ease-in-out infinite",
            }}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.45)" }}>
              Running query {Math.min(lineIndex + 1, loadingQueries.length)} of {loadingQueries.length}
              {dots}
            </span>
            <span style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{progress}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#ffffff", borderRadius: 3, transition: "width 0.25s ease" }} />
          </div>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "7px 8px", background: "rgba(255,255,255,0.03)", marginBottom: 8 }}>
          <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
            Current prompt
          </div>
          <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.62)" }}>
            &ldquo;{typedText}
            <span className="bw-typing-caret" aria-hidden>
              |
            </span>
            &rdquo;
          </div>
        </div>

        {[
          { q: "Business profile fetched", status: "done" as const },
          { q: "Prompt queue prepared", status: "done" as const },
          { q: "Parsing model response", status: "running" as const },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", borderRadius: 5, background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent", marginBottom: 2 }}>
            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.52)" }}>{item.q}</span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: item.status === "done" ? "#4ade80" : "#fbbf24",
                flexShrink: 0,
                animation: item.status === "running" ? "pulse-dot 1.1s ease-in-out infinite" : undefined,
              }}
            />
          </div>
        ))}
      </div>
    </div>
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
    <div className="mockup-frame" style={{ padding: 0 }}>
      <div style={{ height: 32, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", position: "relative", zIndex: 2 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
      </div>
      <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
          Cross-platform analysis
        </div>
        {providers.map((p, i) => (
          <div key={p.name} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ProviderLogo provider={p.name.toLowerCase()} size={11} />
                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)" }}>{p.name}</span>
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "#ffffff" }}>{p.pct}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  width: animateIn ? `${p.pct}%` : "0%",
                  height: "100%",
                  background: p.color,
                  borderRadius: 2,
                  transition: `width 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>Top sources cited</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Google Business", "Yelp", "TripAdvisor"].map((s, i) => (
              <span
                key={s}
                style={{
                  fontSize: "0.58rem",
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.4)",
                  opacity: animateIn ? 1 : 0,
                  transform: animateIn ? "translateY(0)" : "translateY(4px)",
                  transition: `opacity 0.35s ease ${260 + i * 80}ms, transform 0.35s ease ${260 + i * 80}ms`,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── How It Works Section (FeatureSteps with live mockups) ──
function HowItWorks() {
  const features = [
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
    <div id="how">
      <FeatureSteps
        features={features}
        title="See how AI sees you. In 30 seconds."
        label="Getting Started"
      />
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
    >
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "8rem 2.5rem",
        }}
      >
        <div className="reveal-scale" style={{ marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>Plans</div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
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
                background: plan.featured ? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, #111113 100%)" : "#111113",
                border: plan.featured ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "2rem",
                position: "relative",
                transition: "transform 0.2s, box-shadow 0.2s",
                transform: plan.featured ? "scale(1.02)" : undefined,
              }}
            >
              {plan.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: "-11px",
                    left: "1.5rem",
                    background: "#ffffff",
                    color: "#09090b",
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
                  color: "rgba(255,255,255,0.5)",
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
                {plan.price === "0" ? "forever" : "one-time"}
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
                className={plan.featured ? "plan-btn-featured" : "plan-btn"}
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: 8,
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
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
        <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>FAQ</div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "#ffffff",
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
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
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
              <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#ffffff" }}>{faq.q}</span>
              <span
                style={{
                  fontSize: "1.2rem",
                  color: "rgba(255,255,255,0.3)",
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
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, padding: "0 0 1.25rem", margin: 0 }}>
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CTA Section (DARK, no globe) ──
function CTA() {
  return (
    <div
      style={{
        padding: "8rem 2.5rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>Free Audit</div>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
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
            color: "#09090b",
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
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "1.5rem 2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <span style={{ fontWeight: 500, fontSize: "0.9rem", letterSpacing: "-0.02em", color: "#ffffff" }}>
        BrightWill
      </span>
      <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
        &copy; 2025 BrightWill. Generative Engine Optimization for local businesses.
      </p>
      <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>hello@brightwill.ai</p>
    </footer>
  );
}

// ── Main Page ──
export default function Home() {
  return (
    <div className="grid-bg" style={{ background: "#09090b" }}>
      {/* Structural edge lines */}
      <div className="edge-lines" />
      <Nav />
      <Hero />
      <DottedDivider spacing={0} />
      <PlatformBar />
      <DottedDivider spacing={0} />
      <Stats />
      <DottedDivider spacing={0} />
      <HowItWorks />
      <DottedDivider spacing={0} />
      <Features />
      <DottedDivider spacing={0} />
      <ReportShowcase />
      <DottedDivider spacing={0} />
      <Pricing />
      <DottedDivider spacing={0} />
      <FAQ />
      <DottedDivider spacing={0} />
      <CTA />
      <DottedDivider spacing={0} />
      <Footer />
    </div>
  );
}
