"use client";

import { useRef, useEffect, useCallback } from "react";

interface MeshGradientProps {
  /** "hero" = scroll-fade to white, "fixed" = static with bottom fade to #f7f7f8, "inline" = contained block */
  mode?: "hero" | "fixed" | "inline";
  /** Height for fixed mode */
  height?: number;
  /** Enable scroll-to-white fade overlay (hero mode only) */
  scrollFade?: boolean;
  /** Reduce orb opacity for use as subtle section background */
  subtle?: boolean;
}

export function MeshGradient({ mode = "hero", height = 520, scrollFade = true, subtle = false }: MeshGradientProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    if (!wrapperRef.current || !overlayRef.current) return;
    const heroHeight = wrapperRef.current.offsetHeight;
    const progress = Math.min(window.scrollY / (heroHeight * 0.6), 1);
    overlayRef.current.style.background = `rgba(243, 239, 232, ${progress})`;
  }, []);

  useEffect(() => {
    if (mode !== "hero" || !scrollFade) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    requestAnimationFrame(handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mode, scrollFade, handleScroll]);

  const m = subtle ? 0.65 : 1;

  const orbs = (
    <>
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          filter: "blur(90px)",
          background: "radial-gradient(circle, #f0a070 0%, transparent 70%)",
          top: -320,
          left: -280,
          opacity: 0.92 * m,
          animation: "drift1 14s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 650,
          height: 650,
          borderRadius: "50%",
          filter: "blur(90px)",
          background: "radial-gradient(circle, #f490b0 0%, transparent 70%)",
          top: -240,
          right: -220,
          opacity: 0.78 * m,
          animation: "drift2 18s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          filter: "blur(90px)",
          background: "radial-gradient(circle, #f5c080 0%, transparent 70%)",
          bottom: -300,
          left: "5%",
          opacity: 0.74 * m,
          animation: "drift3 15s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 550,
          height: 550,
          borderRadius: "50%",
          filter: "blur(90px)",
          background: "radial-gradient(circle, #f0a0b0 0%, transparent 70%)",
          bottom: -260,
          right: -120,
          opacity: 0.68 * m,
          animation: "drift4 20s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          filter: "blur(90px)",
          background: "radial-gradient(circle, #f5d0a0 0%, transparent 70%)",
          top: "35%",
          left: "20%",
          opacity: 0.58 * m,
          animation: "drift5 16s ease-in-out infinite alternate",
        }}
      />
    </>
  );

  if (mode === "fixed") {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height,
          zIndex: 0,
          overflow: "hidden",
          background: "#fdf8f5",
          pointerEvents: "none",
        }}
      >
        {orbs}
        {/* Bottom fade to page bg */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "60%",
            background: "linear-gradient(to bottom, transparent 0%, #f3efe8 100%)",
          }}
        />
      </div>
    );
  }

  if (mode === "inline") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 10,
          overflow: "hidden",
          zIndex: 0,
          background: "#fdf8f5",
        }}
      >
        {orbs}
      </div>
    );
  }

  // Hero mode — scroll-fade overlay
  return (
    <>
      <div
        ref={wrapperRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {orbs}
      </div>
      {scrollFade && (
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background: "rgba(243, 239, 232, 0)",
          }}
        />
      )}
    </>
  );
}
