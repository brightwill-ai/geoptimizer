"use client"

import { cn } from "@/lib/utils"
import React, { useEffect, useRef } from "react"

interface ParticlesProps {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  color?: string
  vx?: number
  vy?: number
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "")
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("")
  }
  const hexInt = parseInt(hex, 16)
  return [(hexInt >> 16) & 255, (hexInt >> 8) & 255, hexInt & 255]
}

type Circle = {
  x: number
  y: number
  translateX: number
  translateY: number
  size: number
  alpha: number
  targetAlpha: number
  dx: number
  dy: number
  magnetism: number
}

const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvasContainerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rgb = hexToRgb(color)
    let circles: Circle[] = []
    let w = 0
    let h = 0
    const mouse = { x: 0, y: 0 }
    let rafId = 0

    function resize() {
      circles = []
      w = container!.offsetWidth
      h = container!.offsetHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.scale(dpr, dpr)
      initParticles()
    }

    function makeCircle(): Circle {
      return {
        x: Math.floor(Math.random() * w),
        y: Math.floor(Math.random() * h),
        translateX: 0,
        translateY: 0,
        size: Math.floor(Math.random() * 2) + size,
        alpha: 0,
        targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
        dx: (Math.random() - 0.5) * 0.1,
        dy: (Math.random() - 0.5) * 0.1,
        magnetism: 0.1 + Math.random() * 4,
      }
    }

    function drawCircle(c: Circle) {
      ctx!.translate(c.translateX, c.translateY)
      ctx!.beginPath()
      ctx!.arc(c.x, c.y, c.size, 0, 2 * Math.PI)
      ctx!.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${c.alpha})`
      ctx!.fill()
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function initParticles() {
      ctx!.clearRect(0, 0, w, h)
      for (let i = 0; i < quantity; i++) {
        const c = makeCircle()
        circles.push(c)
        drawCircle(c)
      }
    }

    function remap(value: number, s1: number, e1: number, s2: number, e2: number) {
      const r = ((value - s1) * (e2 - s2)) / (e1 - s1) + s2
      return r > 0 ? r : 0
    }

    function animate() {
      ctx!.clearRect(0, 0, w, h)

      for (let i = circles.length - 1; i >= 0; i--) {
        const c = circles[i]

        // Alpha based on edge proximity
        const edges = [
          c.x + c.translateX - c.size,
          w - c.x - c.translateX - c.size,
          c.y + c.translateY - c.size,
          h - c.y - c.translateY - c.size,
        ]
        const closestEdge = Math.min(...edges)
        const edgeFactor = parseFloat(remap(closestEdge, 0, 20, 0, 1).toFixed(2))

        if (edgeFactor > 1) {
          c.alpha += 0.02
          if (c.alpha > c.targetAlpha) c.alpha = c.targetAlpha
        } else {
          c.alpha = c.targetAlpha * edgeFactor
        }

        // Movement
        c.x += c.dx + vx
        c.y += c.dy + vy

        // Mouse magnetism
        c.translateX += (mouse.x / (staticity / c.magnetism) - c.translateX) / ease
        c.translateY += (mouse.y / (staticity / c.magnetism) - c.translateY) / ease

        drawCircle(c)

        // Respawn if out of bounds
        if (
          c.x < -c.size ||
          c.x > w + c.size ||
          c.y < -c.size ||
          c.y > h + c.size
        ) {
          circles.splice(i, 1)
          const nc = makeCircle()
          circles.push(nc)
          drawCircle(nc)
        }
      }

      rafId = window.requestAnimationFrame(animate)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      const cx = e.clientX - rect.left - w / 2
      const cy = e.clientY - rect.top - h / 2
      if (cx > -w / 2 && cx < w / 2 && cy > -h / 2 && cy < h / 2) {
        mouse.x = cx
        mouse.y = cy
      }
    }

    resize()
    rafId = window.requestAnimationFrame(animate)

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMouseMove)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [color, quantity, staticity, ease, size, vx, vy])

  return (
    <div
      className={cn("pointer-events-none", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

export { Particles }
