"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface WordFadeInProps {
  words: string
  className?: string
  /** CSS class for each word span */
  wordClassName?: string
  /** Use scroll progress instead of timed animation */
  scrollDriven?: boolean
  /** External scroll progress 0-1 (for scrollDriven mode) */
  scrollProgress?: number
  /** Inline styles for the container div */
  style?: React.CSSProperties
}

export function WordFadeIn({
  words,
  className,
  wordClassName,
  scrollDriven = false,
  scrollProgress: externalProgress,
  style,
}: WordFadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [hasEntered, setHasEntered] = useState(false)

  // Scroll-driven: track element's position in viewport
  const handleScroll = useCallback(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const vh = window.innerHeight

    const start = vh * 0.82
    const end = vh * 0.52
    const elementCenter = rect.top + rect.height / 2

    if (elementCenter < start) {
      setHasEntered(true)
      const p = Math.min(1, Math.max(0, (start - elementCenter) / (start - end)))
      setProgress(p)
    }
  }, [])

  useEffect(() => {
    if (!scrollDriven || externalProgress !== undefined) return
    window.addEventListener("scroll", handleScroll, { passive: true })
    requestAnimationFrame(handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrollDriven, externalProgress, handleScroll])

  // Timed animation: fade in words sequentially on enter
  useEffect(() => {
    if (scrollDriven) return
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [scrollDriven])

  // For timed mode: animate progress from 0 to 1
  useEffect(() => {
    if (scrollDriven || !hasEntered) return
    const duration = 800
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const p = Math.min(1, elapsed / duration)
      setProgress(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [scrollDriven, hasEntered])

  const currentProgress = externalProgress !== undefined ? externalProgress : progress
  const wordArray = words.split(" ")

  return (
    <div ref={ref} className={className} style={style}>
      {wordArray.map((word, i) => {
        // Each word fades in at a staggered point in the progress
        const wordStart = i / wordArray.length
        const wordEnd = (i + 1) / wordArray.length
        const wordProgress = Math.min(
          1,
          Math.max(0, (currentProgress - wordStart) / (wordEnd - wordStart))
        )

        return (
          <span
            key={i}
            className={cn(wordClassName)}
            style={{
              display: "inline-block",
              opacity: wordProgress,
              transform: `translateY(${(1 - wordProgress) * 8}px)`,
              transition: scrollDriven ? "none" : "opacity 0.3s ease, transform 0.3s ease",
              marginRight: "0.3em",
            }}
          >
            {word}
          </span>
        )
      })}
    </div>
  )
}
