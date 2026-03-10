"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { WordFadeIn } from "./word-fade-in"

interface Feature {
  step: string
  title?: string
  content: string
  mockup: React.ReactNode
}

interface FeatureStepsProps {
  features: Feature[]
  className?: string
  title?: string
  label?: string
}

export function FeatureSteps({
  features,
  className,
  title = "How to get Started",
  label,
}: FeatureStepsProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [titleProgress, setTitleProgress] = useState(0)
  const [visibleCards, setVisibleCards] = useState<boolean[]>(
    features.map(() => false)
  )

  // Scroll-driven title fade-in
  const handleScroll = useCallback(() => {
    if (!titleRef.current) return
    const r = titleRef.current.getBoundingClientRect()
    const vh = window.innerHeight
    const center = r.top + r.height / 2
    const start = vh * 0.85
    const end = vh * 0.25
    setTitleProgress(
      center < start
        ? Math.min(1, Math.max(0, (start - center) / (start - end)))
        : 0
    )
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    requestAnimationFrame(handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Staggered card reveal on scroll
  useEffect(() => {
    const el = cardsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          features.forEach((_, i) => {
            setTimeout(() => {
              setVisibleCards((prev) => {
                const next = [...prev]
                next[i] = true
                return next
              })
            }, i * 180)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [features])

  return (
    <div className={className}>
      {/* Sticky section title — pins below nav */}
      <div
        ref={titleRef}
        style={{
          position: "sticky",
          top: 60,
          zIndex: 20,
          background: "#09090b",
          textAlign: "center",
          padding: "1.5rem 2.5rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {label && (
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "0.75rem",
              opacity: Math.min(1, titleProgress * 3),
              transform: `translateY(${(1 - Math.min(1, titleProgress * 3)) * 10}px)`,
            }}
          >
            {label}
          </div>
        )}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "#ffffff",
          }}
        >
          <WordFadeIn
            words={title}
            scrollDriven
            scrollProgress={titleProgress}
            className="flex flex-wrap justify-center"
          />
        </div>
      </div>

      {/* 3-column step cards */}
      <div
        ref={cardsRef}
        className="steps-row"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${features.length}, 1fr)`,
          gap: "1.5rem",
          maxWidth: 1140,
          margin: "0 auto",
          padding: "4rem 2.5rem 6rem",
        }}
      >
        {features.map((feature, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              opacity: visibleCards[i] ? 1 : 0,
              transform: visibleCards[i] ? "translateY(0)" : "translateY(30px)",
              transition:
                "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div className="step-card" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {/* Number badge */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "#ffffff",
                  marginBottom: "1.25rem",
                }}
              >
                {i + 1}
              </div>

              {/* Mockup */}
              <div style={{ marginBottom: "1.5rem", flex: 1 }}>{feature.mockup}</div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  color: "#ffffff",
                  marginBottom: "0.5rem",
                }}
              >
                {feature.title || feature.step}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.6,
                }}
              >
                {feature.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
