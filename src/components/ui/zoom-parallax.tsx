"use client"

import React, { useRef } from "react"

interface ZoomParallaxImage {
  /** React node to render (can be <img>, <div>, or any component) */
  content: React.ReactNode
  /** Scale range: [startScale, endScale] */
  scale: [number, number]
  /** Position: top, left as CSS values */
  top: string
  left: string
  width?: string
  height?: string
}

interface ZoomParallaxProps {
  items: ZoomParallaxImage[]
  className?: string
}

export function ZoomParallax({ items, className }: ZoomParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    function onScroll() {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const scrollable = containerRef.current.offsetHeight - window.innerHeight
      if (scrollable <= 0) return
      const p = Math.min(1, Math.max(0, -rect.top / scrollable))
      setProgress(p)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: "300vh", position: "relative" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {items.map((item, i) => {
          const scale =
            item.scale[0] + (item.scale[1] - item.scale[0]) * progress

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: item.top,
                left: item.left,
                width: item.width || "auto",
                height: item.height || "auto",
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                willChange: "transform",
              }}
            >
              {item.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
