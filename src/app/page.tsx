"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navigation = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Free Audit", href: "/analyze" },
];

const signalPlatforms = ["ChatGPT", "Claude", "Gemini", "Perplexity", "Copilot", "Meta AI"];

const featureCards = [
  {
    title: "Structured Entity Layer",
    description:
      "We normalize your core business facts into schema and machine-readable blocks so assistants can parse your business correctly.",
    points: [
      "Location, category, and service schema",
      "Hours and attributes synced from source of truth",
      "FAQ and offer blocks written for retrieval",
    ],
  },
  {
    title: "Citation Consistency",
    description:
      "We identify conflicting business details across directories and local listings, then ship an exact fix queue ordered by impact.",
    points: [
      "Duplicate or conflicting profile detection",
      "Address and phone mismatch reporting",
      "Priority-ranked correction checklist",
    ],
  },
  {
    title: "Prompt Coverage Map",
    description:
      "You get visibility across real user-style prompts by category and intent, not vanity keyword rankings that hide model behavior.",
    points: [
      "Intent buckets by service and neighborhood",
      "Appearance tracking by model and prompt set",
      "Weekly coverage delta summary",
    ],
  },
  {
    title: "Change Reports",
    description:
      "Every recommendation includes source links and expected lift so your team can understand what changed and why it matters.",
    points: [
      "Source-backed recommendations",
      "Before/after snapshots",
      "Task owner and ETA guidance",
    ],
  },
];

const workflowSteps = [
  {
    title: "Baseline Audit",
    body: "Run an initial scan of your site, listings, and citations. We return a clear issue log with impact, source, and priority.",
  },
  {
    title: "Implementation Sprint",
    body: "Apply schema, content, and citation updates in an execution window designed to improve machine-readable trust signals quickly.",
  },
  {
    title: "Weekly Monitoring",
    body: "Track prompt coverage and source consistency each week, then iterate from measured changes instead of guesswork.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$299",
    cadence: "/month",
    summary: "For one location building a reliable GEO baseline.",
    features: [
      "Initial GEO baseline audit",
      "Schema implementation guidance",
      "Monthly citation consistency report",
      "1 optimization cycle per month",
    ],
    cta: "Start With Audit",
    featured: false,
  },
  {
    name: "Growth",
    price: "$599",
    cadence: "/month",
    summary: "For teams that want active iteration and reporting.",
    features: [
      "Everything in Starter",
      "Weekly prompt coverage monitoring",
      "Citation correction queue + tracking",
      "2 optimization cycles per month",
      "Priority support",
    ],
    cta: "Choose Growth",
    featured: true,
  },
  {
    name: "Scale",
    price: "$1,199",
    cadence: "/month",
    summary: "For multi-location businesses with larger rollout scope.",
    features: [
      "Everything in Growth",
      "Multi-location entity architecture",
      "Cross-market prompt benchmark sets",
      "Dedicated strategist",
      "Weekly executive summary",
    ],
    cta: "Talk To Sales",
    featured: false,
  },
];

const auditRows = [
  {
    signal: "Entity Data",
    finding: "Missing service schema for two priority categories",
    status: "Needs Work",
    tone: "critical",
  },
  {
    signal: "Citation Consistency",
    finding: "Address format mismatch across 3 high-authority directories",
    status: "In Review",
    tone: "warning",
  },
  {
    signal: "Prompt Presence",
    finding: "Appearing in intent queries for one neighborhood only",
    status: "Low",
    tone: "critical",
  },
  {
    signal: "Review Freshness",
    finding: "Recent first-party review velocity is stable",
    status: "Healthy",
    tone: "good",
  },
] as const;

type AuditTone = (typeof auditRows)[number]["tone"];

function toneClass(tone: AuditTone) {
  if (tone === "good") {
    return "bw-status bw-status-good";
  }

  if (tone === "warning") {
    return "bw-status bw-status-warning";
  }

  return "bw-status bw-status-critical";
}

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="bw-nav-shell">
      <a className="bw-skip-link" href="#main-content">
        Skip to content
      </a>
      <nav className="bw-nav" aria-label="Primary">
        <Link href="/" className="bw-brand" onClick={closeMenu}>
          BrightWill
        </Link>

        <ul className="bw-nav-list" role="list">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="bw-nav-anchor">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="bw-nav-actions">
          <Link href="/signup" className="bw-btn bw-btn-primary">
            Join Waitlist
          </Link>
          <button
            type="button"
            className="bw-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((current) => !current)}
          >
            Menu
          </button>
        </div>
      </nav>

      <div id="mobile-nav" className={`bw-mobile-nav ${menuOpen ? "bw-mobile-nav-open" : ""}`}>
        <ul role="list">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="bw-mobile-link" onClick={closeMenu}>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/signup" className="bw-mobile-link bw-mobile-link-cta" onClick={closeMenu}>
              Join Waitlist
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bw-hero">
      <div className="bw-container bw-hero-grid">
        <div data-reveal className="bw-hero-copy">
          <p className="bw-kicker">Generative Engine Optimization</p>
          <h1>Be the Business AI Assistants Can Verify & Recommend.</h1>
          <p>
            BrightWill helps local businesses become machine-readable across web, listings, and
            citation sources so recommendations are based on trustworthy signals instead of chance.
          </p>
          <div className="bw-hero-actions">
            <Link href="/analyze" className="bw-btn bw-btn-primary">
              Run Free AI Audit
            </Link>
            <Link href="/signup" className="bw-btn bw-btn-secondary">
              Talk With Team
            </Link>
          </div>
          <ul className="bw-hero-proof" role="list">
            <li>Source-linked recommendations for every issue.</li>
            <li>Weekly model coverage tracking by intent.</li>
            <li>Execution-ready tasks instead of vanity dashboards.</li>
          </ul>
        </div>

        <aside data-reveal className="bw-audit-card" style={{ transitionDelay: "120ms" }}>
          <header>
            <p className="bw-card-eyebrow">Example Audit Output</p>
            <h2>Signal Readiness Snapshot</h2>
          </header>
          <ul role="list" className="bw-audit-list">
            {auditRows.map((row) => (
              <li key={row.signal}>
                <div>
                  <p className="bw-audit-signal">{row.signal}</p>
                  <p className="bw-audit-finding">{row.finding}</p>
                </div>
                <span className={toneClass(row.tone)}>{row.status}</span>
              </li>
            ))}
          </ul>
          <p className="bw-card-footnote">
            Every finding includes source links, affected URLs, and an implementation suggestion.
          </p>
        </aside>
      </div>
    </section>
  );
}

function PlatformStrip() {
  return (
    <section className="bw-platform-strip" aria-label="Supported AI platforms">
      <div className="bw-container bw-platform-inner">
        <p>Signals monitored across</p>
        <ul role="list" className="bw-platform-list">
          {signalPlatforms.map((platform) => (
            <li key={platform}>{platform}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bw-section">
      <div className="bw-container">
        <div data-reveal className="bw-section-head">
          <p className="bw-kicker">What We Optimize</p>
          <h2>Sharper Inputs. Better Model Recommendations.</h2>
          <p>
            We focus on the signals assistants use for retrieval and ranking, then convert them into
            a practical implementation plan your team can execute.
          </p>
        </div>

        <div className="bw-feature-grid">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              data-reveal
              className="bw-feature-card"
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <ul role="list">
                {feature.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bw-section bw-section-alt">
      <div className="bw-container">
        <div data-reveal className="bw-section-head">
          <p className="bw-kicker">How It Works</p>
          <h2>Measured Workflow, Not Guesswork.</h2>
          <p>
            The process is designed to move from baseline to measurable improvement quickly while
            preserving a clear audit trail of what changed.
          </p>
        </div>

        <div className="bw-step-grid">
          {workflowSteps.map((step, index) => (
            <article
              key={step.title}
              data-reveal
              className="bw-step-card"
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <span>{`0${index + 1}`}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bw-section">
      <div className="bw-container">
        <div data-reveal className="bw-section-head">
          <p className="bw-kicker">Pricing</p>
          <h2>Clear Plans With Defined Scope.</h2>
          <p>
            Start with a baseline audit and scale support as your location count, complexity, and
            reporting needs increase.
          </p>
        </div>

        <div className="bw-pricing-grid">
          {pricingPlans.map((plan, index) => (
            <article
              key={plan.name}
              data-reveal
              className={`bw-plan ${plan.featured ? "bw-plan-featured" : ""}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {plan.featured && <p className="bw-plan-badge">Most Selected</p>}
              <h3>{plan.name}</h3>
              <p className="bw-plan-price">
                {plan.price}
                <span>{plan.cadence}</span>
              </p>
              <p className="bw-plan-summary">{plan.summary}</p>
              <ul role="list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link href="/signup" className="bw-btn bw-btn-secondary">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bw-final-cta">
      <div className="bw-container" data-reveal>
        <p className="bw-kicker">Start With Evidence</p>
        <h2>See Exactly What Is Limiting Your AI Visibility.</h2>
        <p>
          Run a free audit and get a concrete signal-level action list your team can ship this week.
        </p>
        <div className="bw-hero-actions">
          <Link href="/analyze" className="bw-btn bw-btn-primary">
            Run Free AI Audit
          </Link>
          <Link href="/signup" className="bw-btn bw-btn-secondary">
            Join Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bw-footer">
      <div className="bw-container bw-footer-inner">
        <p>BrightWill</p>
        <p>© 2026 BrightWill. Generative Engine Optimization for local businesses.</p>
        <a href="mailto:hello@brightwill.ai">hello@brightwill.ai</a>
      </div>
    </footer>
  );
}

export default function Home() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <PlatformStrip />
        <Features />
        <HowItWorks />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
