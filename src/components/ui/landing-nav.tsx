"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export interface LandingNavProps {
  /** Right-side CTA button */
  cta?: { label: string; href: string };
}

const defaultCta = { label: "Get free audit", href: "/analyze" };

export function LandingNav({ cta = defaultCta }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const linkClass = "landing-nav-link";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 720,
          padding: "10px 20px",
          borderRadius: 999,
          border: "1px solid transparent",
          background: scrolled
            ? "rgba(255,255,255,0.8)"
            : "rgba(0,0,0,0.02)",
          backdropFilter: scrolled ? "blur(32px)" : "blur(24px)",
          WebkitBackdropFilter: scrolled ? "blur(32px)" : "blur(24px)",
          borderColor: scrolled ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.06)",
          boxShadow: scrolled ? "0 10px 40px rgba(0,0,0,0.08)" : "none",
          transition: "all 0.5s",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "-0.02em",
            color: "#18181b",
            textDecoration: "none",
          }}
        >
          <Image
            src="/logo.png"
            alt="BrightWill"
            width={24}
            height={24}
            style={{ borderRadius: 4, filter: "brightness(0)" }}
          />
          BrightWill
        </Link>

        <div
          className="landing-nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Link
            href="/#features"
            className={linkClass}
            style={{
              fontSize: 12,
              color: "#71717a",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#18181b";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#71717a";
            }}
          >
            Features
          </Link>
          <Link
            href="/#how"
            className={linkClass}
            style={{
              fontSize: 12,
              color: "#71717a",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#18181b";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#71717a";
            }}
          >
            How it works
          </Link>
          <Link
            href="/#pricing"
            className={linkClass}
            style={{
              fontSize: 12,
              color: "#71717a",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#18181b";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#71717a";
            }}
          >
            Pricing
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Link
            href={cta.href}
            style={{
              background: "#18181b",
              color: "#ffffff",
              padding: "6px 20px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#27272a";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#18181b";
            }}
          >
            {cta.label}
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="landing-nav-mobile-btn"
          style={{
            background: "none",
            border: "none",
            color: "#18181b",
            cursor: "pointer",
            padding: 4,
            fontSize: 20,
          }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {mobileOpen && (
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 16,
            right: 16,
            borderRadius: 16,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(24px)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 24px 48px rgba(0,0,0,0.08)",
          }}
        >
          <Link
            href="/#features"
            style={{ fontSize: 14, color: "#52525b", textDecoration: "none" }}
            onClick={() => setMobileOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/#how"
            style={{ fontSize: 14, color: "#52525b", textDecoration: "none" }}
            onClick={() => setMobileOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/#pricing"
            style={{ fontSize: 14, color: "#52525b", textDecoration: "none" }}
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href={cta.href}
            style={{
              background: "#18181b",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              alignSelf: "flex-start",
              marginTop: 8,
            }}
            onClick={() => setMobileOpen(false)}
          >
            {cta.label}
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 860px) {
          .landing-nav-links {
            display: none !important;
          }
          .landing-nav-mobile-btn {
            display: block !important;
          }
        }
        .landing-nav-mobile-btn {
          display: none;
        }
      `}</style>
    </nav>
  );
}
