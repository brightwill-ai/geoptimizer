"use client"

import React, { useId } from "react"
import { cn } from "@/lib/utils"

interface DottedSurfaceProps {
  children?: React.ReactNode
  className?: string
  dotColor?: string
  dotSize?: number
  gap?: number
}

export function DottedSurface({
  children,
  className,
  dotColor = "rgba(255,255,255,0.15)",
  dotSize = 1,
  gap = 24,
}: DottedSurfaceProps) {
  const id = useId()
  const patternId = `dotted-surface-${id}`

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* SVG dot pattern */}
      <svg
        className="absolute inset-0 size-full"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <pattern
            id={patternId}
            x={0}
            y={0}
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={gap / 2} cy={gap / 2} r={dotSize} fill={dotColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
