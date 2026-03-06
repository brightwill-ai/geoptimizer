"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Navigation Component
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
        background: "rgba(240,238,234,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #dddbd7",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 700,
          fontSize: "1.05rem",
          letterSpacing: "-0.02em",
          color: "#0c0c0b",
          textDecoration: "none",
        }}
      >
        Visibly
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
        <li>
          <a href="#features" className="nav-link">
            Features
          </a>
        </li>
        <li>
          <a href="#how" className="nav-link">
            How it works
          </a>
        </li>
        <li>
          <a href="#pricing" className="nav-link">
            Pricing
          </a>
        </li>
      </ul>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Link href="/signup" className="btn-pill">
          Join waitlist
        </Link>
      </div>
    </nav>
  );
}

// Globe Card Component
function GlobeCard() {
  return (
    <div
      className="globe-card"
      style={{
        background: "linear-gradient(145deg, #dce8f5 0%, #ede8f8 50%, #f5e8e8 100%)",
        borderRadius: "28px",
        padding: "3rem 2rem",
        aspectRatio: "1 / 1.05",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 2px 40px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="globe-wrap"
        style={{
          position: "relative",
          width: "220px",
          height: "220px",
          marginBottom: "2rem",
        }}
      >
        {/* Globe sphere */}
        <div
          className="globe-sphere"
          style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.9) 0%, rgba(180,210,245,0.6) 40%, rgba(200,185,235,0.4) 70%, rgba(235,185,185,0.3) 100%)",
            position: "absolute",
            top: 0,
            left: 0,
            boxShadow:
              "inset -15px -15px 40px rgba(150,130,200,0.2), 0 8px 40px rgba(150,130,200,0.15)",
          }}
        />

        {/* Globe grid */}
        <div
          className="globe-grid"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `
                repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(100,130,180,0.15) 30px, rgba(100,130,180,0.15) 31px),
                repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(100,130,180,0.15) 30px, rgba(100,130,180,0.15) 31px)
              `,
              borderRadius: "50%",
            }}
          />
        </div>

        {/* AI Labels */}
        <div className="ai-label" style={{ top: "-12px", right: "-20px", animationDelay: "0s" }}>
          <span className="ai-dot" style={{ background: "#10a37f" }} />
          ChatGPT
        </div>
        <div className="ai-label" style={{ bottom: "30px", left: "-30px", animationDelay: "1s" }}>
          <span className="ai-dot" style={{ background: "#c084fc" }} />
          Claude
        </div>
        <div className="ai-label" style={{ bottom: "-14px", right: "0px", animationDelay: "2s" }}>
          <span className="ai-dot" style={{ background: "#4285f4" }} />
          Gemini
        </div>
        <div className="ai-label" style={{ top: "60px", left: "-40px", animationDelay: "1.5s" }}>
          <span className="ai-dot" style={{ background: "#ff6b35" }} />
          Perplexity
        </div>
      </div>

      <p
        className="globe-caption"
        style={{
          fontSize: "0.78rem",
          color: "#9a9793",
          letterSpacing: "0.04em",
          textAlign: "center",
        }}
      >
        Your business, surfaced across every AI platform.
      </p>
    </div>
  );
}

// Hero Section
function Hero() {
  return (
    <section style={{ background: "#f0eeea" }}>
      <div
        className="hero"
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "center",
          padding: "7rem 2.5rem 4rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div className="hero-left" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <span className="eyebrow animate-up" style={{ animationDelay: "0.1s" }}>
            <span
              style={{
                width: "5px",
                height: "5px",
                background: "#0c0c0b",
                borderRadius: "50%",
              }}
            />
            Generative Engine Optimization
          </span>

          <h1 className="animate-up" style={{ animationDelay: "0.2s" }}>
            Get your business
            <br />
            <em>recommended</em>
            <br />
            by AI.
          </h1>

          <p className="hero-sub animate-up" style={{ animationDelay: "0.3s" }}>
            When someone asks ChatGPT or Google AI for the best restaurant near them, make sure
            yours is the answer.
          </p>

          <div className="hero-btns animate-up" style={{ animationDelay: "0.4s" }}>
            <Link href="/signup" className="btn-pill">
              Join waitlist
            </Link>
            <a href="#how" className="btn-pill-outline">
              See How It Works
            </a>
          </div>
        </div>

        <div className="hero-right animate-up" style={{ animationDelay: "0.3s" }}>
          <GlobeCard />
        </div>
      </div>
    </section>
  );
}

// Logos Strip
function LogosStrip() {
  const logos = [
    "ChatGPT",
    "Claude",
    "Gemini",
    "Perplexity",
    "Copilot",
    "Meta AI",
    "Grok",
    "You.com",
  ];

  return (
    <div
      className="logos-strip"
      style={{
        borderTop: "1px solid #dddbd7",
        borderBottom: "1px solid #dddbd7",
        background: "#faf9f7",
        padding: "1.4rem 2.5rem",
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        overflow: "hidden",
      }}
    >
      <span
        className="logos-label"
        style={{
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9a9793",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Optimized for
      </span>
      <div className="logos-scroll" style={{ overflow: "hidden", flex: 1 }}>
        <div
          className="logos-track"
          style={{
            display: "flex",
            gap: "3.5rem",
            alignItems: "center",
            animation: "ticker 22s linear infinite",
          }}
        >
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              style={{
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#b8b5b0",
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em",
              }}
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard Mockup for Features
function DashboardMockup() {
  return (
    <div
      className="dash-card"
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "1.25rem 1.5rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        maxWidth: "320px",
        margin: "0 auto",
      }}
    >
      <div
        className="dash-header"
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#9a9793",
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>GEO Score</span>
        <span style={{ color: "#2d6a4f", fontSize: "0.7rem" }}>↑ 12 pts this month</span>
      </div>

      <div
        className="dash-score-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          className="dash-score-circle"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "conic-gradient(#0c0c0b 0% 78%, #e8e5e0 78% 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#0c0c0b",
              background: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            78
          </div>
        </div>
        <div className="dash-score-info" style={{ fontSize: "0.78rem" }}>
          <div className="dash-score-label" style={{ fontWeight: 600, color: "#0c0c0b" }}>
            Hana Sushi Miami
          </div>
          <div className="dash-score-sub" style={{ color: "#9a9793" }}>
            GEO visibility score
          </div>
        </div>
      </div>

      <div className="dash-bars" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {[
          { label: "ChatGPT", pct: 84 },
          { label: "Claude", pct: 71 },
          { label: "Gemini", pct: 68 },
          { label: "Perplexity", pct: 55 },
        ].map((item) => (
          <div
            key={item.label}
            className="dash-bar-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.72rem",
            }}
          >
            <span
              className="dash-bar-label"
              style={{ color: "#9a9793", width: "60px", flexShrink: 0 }}
            >
              {item.label}
            </span>
            <div
              className="dash-bar-track"
              style={{
                flex: 1,
                height: "5px",
                background: "#ece9e4",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                className="dash-bar-fill"
                style={{
                  height: "100%",
                  background: "#0c0c0b",
                  borderRadius: "999px",
                  width: `${item.pct}%`,
                  transition: "width 1s ease",
                }}
              />
            </div>
            <span
              className="dash-bar-pct"
              style={{ color: "#3a3936", fontWeight: 500, width: "30px", textAlign: "right" }}
            >
              {item.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Features Section
function Features() {
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      title: "AI-Optimized Profiles",
      body: "We structure your business data in formats that AI models understand best — schema markup, entity relationships, and natural language descriptions that increase your recommendation probability.",
    },
    {
      title: "GEO Visibility Score",
      body: "Track exactly how often your business appears in AI-generated recommendations across ChatGPT, Claude, Gemini, and Perplexity. Watch your score improve month over month.",
    },
    {
      title: "Citation Building",
      body: "AI models cite authoritative sources. We get your business mentioned on the high-trust sites and directories that AI models use as training and retrieval sources.",
    },
    {
      title: "AI-First Content",
      body: "Monthly content written to answer exactly how customers phrase local discovery queries to AI — 'best omakase near downtown', 'most romantic dinner spot in Brickell'.",
    },
    {
      title: "Competitive Intelligence",
      body: "See which competitors are being recommended over you, and exactly what signals are driving their rankings. Then we close the gap.",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="features"
      className="section-wrap"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "6rem 2.5rem",
      }}
      ref={sectionRef}
    >
      <div
        className="features-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          alignItems: "start",
        }}
      >
        <div className="features-left reveal">
          <h2
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "2.5rem",
            }}
          >
            Everything your business needs
            <br />
            to win in AI search.
          </h2>

          <div>
            {features.map((feature, i) => (
              <div
                key={i}
                className={`feature-item ${activeFeature === i ? "active" : ""}`}
                onClick={() => setActiveFeature(i)}
                style={{
                  borderTop: "1px solid #dddbd7",
                  padding: "1.25rem 0",
                  cursor: "pointer",
                  borderBottom: i === features.length - 1 ? "1px solid #dddbd7" : "none",
                }}
              >
                <div
                  className="feature-title"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: activeFeature === i ? "#0c0c0b" : "#9a9793",
                    transition: "color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {feature.title}
                  <span
                    className="feature-arrow"
                    style={{
                      fontSize: "0.7rem",
                      transition: "transform 0.3s",
                      transform: activeFeature === i ? "rotate(90deg)" : "none",
                    }}
                  >
                    ›
                  </span>
                </div>
                <div
                  className="feature-body"
                  style={{
                    fontSize: "0.875rem",
                    color: "#9a9793",
                    lineHeight: 1.65,
                    maxHeight: activeFeature === i ? "100px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.35s ease, padding 0.35s ease",
                    paddingTop: activeFeature === i ? "0.6rem" : "0",
                  }}
                >
                  {feature.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="features-right reveal" style={{ position: "sticky", top: "5rem" }}>
          <div
            className="feature-card"
            style={{
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 2px 30px rgba(0,0,0,0.06)",
              transition: "opacity 0.3s",
            }}
          >
            <div
              className="feature-card-inner"
              style={{
                background: "linear-gradient(150deg, #d8edf8 0%, #e8d8f8 100%)",
                padding: "2rem",
                minHeight: "380px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// How It Works Section
function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      num: "01",
      title: "Create your profile.",
      desc: "Tell us about your business. Our onboarding captures every detail AI models use to evaluate and recommend local businesses.",
    },
    {
      num: "02",
      title: "We optimize for AI.",
      desc: "We build your GEO foundation — schema, citations, content, and structured data — across every major AI platform simultaneously.",
    },
    {
      num: "03",
      title: "Get discovered.",
      desc: "Watch your GEO score rise. Track how often AI recommends you vs. competitors. Get monthly reports with clear next steps.",
    },
  ];

  return (
    <div
      id="how"
      className="section-wrap"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "6rem 2.5rem",
      }}
      ref={sectionRef}
    >
      <div className="hiw-header reveal" style={{ marginBottom: "4rem" }}>
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#9a9793",
            marginBottom: "0.75rem",
            fontWeight: 500,
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
          }}
        >
          Up and running.
          <br />
          In 48 hours.
        </h2>
      </div>

      <div
        className="steps-row reveal"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
        }}
      >
        {steps.map((step, i) => (
          <div
            key={i}
            className="step-col"
            style={{
              padding:
                i === 0
                  ? "2rem 2rem 2rem 0"
                  : i === 1
                    ? "2rem 2rem"
                    : "2rem 0 2rem 2rem",
              borderRight: i < 2 ? "1px solid #dddbd7" : "none",
            }}
          >
            <span
              className="step-num"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "6rem",
                lineHeight: 1,
                color: "#e0ddd8",
                marginBottom: "1rem",
                display: "block",
              }}
            >
              {step.num}
            </span>
            <div
              className="step-title"
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem",
              }}
            >
              {step.title}
            </div>
            <p
              className="step-desc"
              style={{
                fontSize: "0.875rem",
                color: "#9a9793",
                lineHeight: 1.65,
              }}
            >
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pricing Section
function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      name: "Starter",
      price: "299",
      features: [
        "Full GEO audit report",
        "Schema & structured data",
        "5 AI directory submissions",
        "1 AI-optimized content piece/mo",
        "Monthly snapshot report",
      ],
    },
    {
      name: "Growth",
      price: "599",
      featured: true,
      features: [
        "Everything in Starter",
        "Ongoing citation building",
        "4 AI content pieces/mo",
        "Review generation strategy",
        "Competitor gap analysis",
        "Bi-weekly check-in call",
      ],
    },
    {
      name: "Dominate",
      price: "1,199",
      features: [
        "Everything in Growth",
        "Full-service management",
        "8 AI content pieces/mo",
        "Priority AI model monitoring",
        "Dedicated account manager",
        "Weekly reporting dashboard",
      ],
    },
  ];

  return (
    <div
      id="pricing"
      className="section-wrap"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "6rem 2.5rem",
      }}
      ref={sectionRef}
    >
      <div className="pricing-header reveal" style={{ marginBottom: "3rem" }}>
        <h2
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "0.5rem",
          }}
        >
          Simple pricing.
          <br />
          No surprises.
        </h2>
        <p style={{ color: "#9a9793", fontSize: "0.95rem" }}>
          No contracts. Cancel any time. Results typically visible in 30–60 days.
        </p>
      </div>

      <div
        className="plans reveal"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan ${plan.featured ? "featured" : ""}`}
            style={{
              background: plan.featured ? "#ffffff" : "#faf9f7",
              border: plan.featured ? "1px solid #0c0c0b" : "1px solid #dddbd7",
              borderRadius: "20px",
              padding: "2rem",
              position: "relative",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            {plan.featured && (
              <div
                className="plan-badge"
                style={{
                  position: "absolute",
                  top: "-11px",
                  left: "1.5rem",
                  background: "#0c0c0b",
                  color: "white",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "999px",
                }}
              >
                Most Popular
              </div>
            )}

            <div
              className="plan-name"
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#9a9793",
                marginBottom: "1rem",
              }}
            >
              {plan.name}
            </div>

            <div
              className="plan-price"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "2.4rem",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: "0.2rem",
              }}
            >
              <sup style={{ fontSize: "1rem", verticalAlign: "super" }}>$</sup>
              {plan.price}
            </div>
            <div
              className="plan-mo"
              style={{ fontSize: "0.8rem", color: "#9a9793", marginBottom: "1.5rem" }}
            >
              per month
            </div>

            <div
              className="plan-divider"
              style={{ height: "1px", background: "#dddbd7", marginBottom: "1.5rem" }}
            />

            <ul
              className="plan-features"
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                marginBottom: "1.75rem",
                padding: 0,
              }}
            >
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "0.855rem",
                    color: "#3a3936",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.55rem",
                  }}
                >
                  <span
                    style={{
                      color: "#0c0c0b",
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={plan.featured ? "plan-btn-featured" : "plan-btn"}
              style={{
                width: "100%",
                padding: "0.7rem",
                borderRadius: "999px",
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                border: plan.featured ? "1px solid #0c0c0b" : "1px solid #c8c5c0",
                background: plan.featured ? "#0c0c0b" : "transparent",
                color: plan.featured ? "white" : "#0c0c0b",
                transition: "all 0.15s",
              }}
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// CTA Section
function CTA() {
  return (
    <div
      className="cta-block"
      style={{
        background: "#0c0c0b",
        padding: "7rem 2.5rem",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          color: "white",
          marginBottom: "2rem",
        }}
      >
        The window is open.
        <br />
        <em
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          Move first.
        </em>
      </h2>
      <Link
        href="/signup"
        className="btn-pill-white"
        style={{
          background: "white",
          color: "#0c0c0b",
          border: "none",
          padding: "0.75rem 2rem",
          borderRadius: "999px",
          fontFamily: "'Instrument Sans', sans-serif",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          transition: "opacity 0.15s, transform 0.15s",
        }}
      >
        Start Free Trial →
      </Link>
    </div>
  );
}

// Footer
function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #dddbd7",
        padding: "1.5rem 2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        background: "#faf9f7",
      }}
    >
      <span
        className="footer-logo"
        style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.02em" }}
      >
        Visibly
      </span>
      <p style={{ fontSize: "0.78rem", color: "#9a9793" }}>
        © 2025 Visibly. Generative Engine Optimization for local businesses.
      </p>
      <p style={{ fontSize: "0.78rem", color: "#9a9793" }}>hello@visibly.ai</p>
    </footer>
  );
}

// Signup Modal
function SignupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(12,12,11,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="modal"
        style={{
          background: "#faf9f7",
          borderRadius: "24px",
          padding: "2.5rem",
          width: "min(480px, 90vw)",
          border: "1px solid #dddbd7",
          boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          className="modal-close"
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
            color: "#9a9793",
          }}
        >
          ✕
        </button>

        <h3
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 700,
            fontSize: "1.5rem",
            letterSpacing: "-0.03em",
            marginBottom: "0.35rem",
          }}
        >
          Start your free trial.
        </h3>
        <p style={{ fontSize: "0.875rem", color: "#9a9793", marginBottom: "1.5rem" }}>
          We&apos;ll reach out within 24 hours with a free GEO visibility audit.
        </p>

        <form
          className="modal-form"
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div
            className="field-row-2"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#3a3936",
                  display: "block",
                  marginBottom: "0.3rem",
                }}
              >
                First name
              </label>
              <input
                type="text"
                placeholder="Jane"
                style={{
                  width: "100%",
                  background: "white",
                  border: "1px solid #dddbd7",
                  borderRadius: "10px",
                  padding: "0.7rem 0.9rem",
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: "0.875rem",
                  color: "#0c0c0b",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#3a3936",
                  display: "block",
                  marginBottom: "0.3rem",
                }}
              >
                Last name
              </label>
              <input
                type="text"
                placeholder="Smith"
                style={{
                  width: "100%",
                  background: "white",
                  border: "1px solid #dddbd7",
                  borderRadius: "10px",
                  padding: "0.7rem 0.9rem",
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: "0.875rem",
                  color: "#0c0c0b",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#3a3936",
                display: "block",
                marginBottom: "0.3rem",
              }}
            >
              Business email
            </label>
            <input
              type="email"
              placeholder="jane@yourbusiness.com"
              style={{
                width: "100%",
                background: "white",
                border: "1px solid #dddbd7",
                borderRadius: "10px",
                padding: "0.7rem 0.9rem",
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "0.875rem",
                color: "#0c0c0b",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#3a3936",
                display: "block",
                marginBottom: "0.3rem",
              }}
            >
              Business name
            </label>
            <input
              type="text"
              placeholder="Hana Sushi Miami"
              style={{
                width: "100%",
                background: "white",
                border: "1px solid #dddbd7",
                borderRadius: "10px",
                padding: "0.7rem 0.9rem",
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: "0.875rem",
                color: "#0c0c0b",
                outline: "none",
              }}
            />
          </div>

          <div
            className="field-row-2"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#3a3936",
                  display: "block",
                  marginBottom: "0.3rem",
                }}
              >
                Business type
              </label>
              <select
                style={{
                  width: "100%",
                  background: "white",
                  border: "1px solid #dddbd7",
                  borderRadius: "10px",
                  padding: "0.7rem 0.9rem",
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: "0.875rem",
                  color: "#0c0c0b",
                  outline: "none",
                  appearance: "none",
                }}
              >
                <option value="">Select…</option>
                <option>Restaurant</option>
                <option>Café / Coffee Shop</option>
                <option>Bar / Nightlife</option>
                <option>Retail</option>
                <option>Health & Wellness</option>
                <option>Professional Service</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#3a3936",
                  display: "block",
                  marginBottom: "0.3rem",
                }}
              >
                City
              </label>
              <input
                type="text"
                placeholder="Miami, FL"
                style={{
                  width: "100%",
                  background: "white",
                  border: "1px solid #dddbd7",
                  borderRadius: "10px",
                  padding: "0.7rem 0.9rem",
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: "0.875rem",
                  color: "#0c0c0b",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="modal-submit"
            style={{
              width: "100%",
              marginTop: "0.25rem",
              background: submitted ? "#2d6a4f" : "#0c0c0b",
              color: "white",
              border: "none",
              padding: "0.85rem",
              borderRadius: "999px",
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {submitted ? "✓ You're on the list!" : "Get my free audit →"}
          </button>

          <p
            className="modal-fine"
            style={{ fontSize: "0.72rem", color: "#9a9793", textAlign: "center", marginTop: "0.5rem" }}
          >
            No credit card. No commitment.
          </p>
        </form>
      </div>
    </div>
  );
}

// Section Divider
function SectionDivider() {
  return (
    <div
      className="section-divider"
      style={{
        height: "1px",
        background: "#dddbd7",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    />
  );
}

// Main Page
export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <LogosStrip />
      <SectionDivider />
      <Features />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <Pricing />
      <CTA />
      <Footer />
    </>
  );
}
