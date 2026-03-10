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
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const [rawProgress, setRawProgress] = useState(0)
  const [titleProgress, setTitleProgress] = useState(0)

  const handleScroll = useCallback(() => {
    // Title reveal
    if (titleRef.current) {
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
    }

    // Main scroll area progress (0 = top of section, 1 = bottom)
    if (scrollAreaRef.current) {
      const r = scrollAreaRef.current.getBoundingClientRect()
      const scrollable = scrollAreaRef.current.offsetHeight - window.innerHeight
      if (scrollable > 0) {
        setRawProgress(Math.min(1, Math.max(0, -r.top / scrollable)))
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const n = features.length

  // Convert raw progress into a continuous float index (0 to n-1).
  const floatIndex = rawProgress * (n - 1 + 0.001)

  // Per-step opacity with hold zones: each step stays fully visible
  // for ±0.25 of floatIndex, then crossfades over the next 0.5.
  function stepOpacity(i: number): number {
    const dist = Math.abs(floatIndex - i)
    if (dist <= 0.25) return 1
    if (dist >= 0.75) return 0
    return 1 - (dist - 0.25) / 0.5
  }

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

      {/* 2-column layout */}
      <div
        ref={scrollAreaRef}
        className="feature-2col"
        style={{
          display: "flex",
          maxWidth: 1140,
          margin: "0 auto",
          padding: "0 2.5rem",
          gap: "3.5rem",
        }}
      >
        {/* LEFT — sticky text, crossfading */}
        <div
          className="feature-left-col"
          style={{
            flex: "0 0 36%",
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", width: "100%" }}>
            {features.map((feature, i) => {
              const o = stepOpacity(i)
              return (
                <div
                  key={i}
                  style={{
                    position: i === 0 ? "relative" : "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    opacity: o,
                    transform: `translateY(${(1 - o) * 18}px)`,
                    pointerEvents: o > 0.5 ? "auto" : "none",
                  }}
                >
                  {/* Step badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "1.5px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        color: "#ffffff",
                        flexShrink: 0,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {feature.step}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
                      fontWeight: 300,
                      letterSpacing: "-0.04em",
                      lineHeight: 1.15,
                      color: "#ffffff",
                      marginBottom: "1rem",
                    }}
                  >
                    {feature.title || feature.step}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.65,
                      maxWidth: "34ch",
                    }}
                  >
                    {feature.content}
                  </p>

                  {/* Progress dots */}
                  <div style={{ display: "flex", gap: 8, marginTop: "2rem" }}>
                    {features.map((_, j) => {
                      const active = stepOpacity(j) > 0.5
                      return (
                        <div
                          key={j}
                          style={{
                            width: active ? 24 : 6,
                            height: 6,
                            borderRadius: 3,
                            background: active
                              ? "rgba(255,255,255,0.4)"
                              : "rgba(255,255,255,0.08)",
                            transition:
                              "width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.4s ease",
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — single sticky frame, mockups crossfade in place */}
        <div style={{ flex: 1, minHeight: `${n * 200}vh` }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
              {features.map((feature, i) => {
                const o = stepOpacity(i)
                return (
                  <div
                    key={i}
                    style={{
                      position: i === 0 ? "relative" : "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      opacity: o,
                      transition: "opacity 0.3s ease",
                      pointerEvents: o > 0.5 ? "auto" : "none",
                    }}
                  >
                    {feature.mockup}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
