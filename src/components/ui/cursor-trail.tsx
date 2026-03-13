"use client";

import { useEffect, useRef } from "react";

export function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Characters matching the Codex / Matrix aesthetic
    const CHARS = ["<", "_", "0", "-", ">", "*", "/", "1", "x", "y", "="];
    const GRID_SIZE = 20;     // Classic relaxed grid spacing
    const FADE_TIME = 1000;   // Original 1 second fade duration
    let lastCell = "";

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Snap to a virtual grid
      const gridX = Math.round(x / GRID_SIZE) * GRID_SIZE;
      const gridY = Math.round(y / GRID_SIZE) * GRID_SIZE;
      
      const currentCell = `${gridX},${gridY}`;
      
      // Only drop a new character if we've entered a new grid cell
      if (currentCell !== lastCell) {
        lastCell = currentCell;
        
        // Define potential relative grid points around the cursor to drop characters
        const clusterSpecs = [
          { dx: 0, dy: 0 },
          { dx: GRID_SIZE, dy: 0 },
          { dx: 0, dy: GRID_SIZE },
          { dx: -GRID_SIZE, dy: GRID_SIZE },
        ];

        // Randomly pick 1 or 2 dots per cell change for a very subtle area effect
        const clusterCount = Math.floor(Math.random() * 2) + 1;
        clusterSpecs.sort(() => Math.random() - 0.5);

        for (let i = 0; i < clusterCount; i++) {
          const spec = clusterSpecs[i];
          
          const el = document.createElement("span");
          el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
          el.style.position = "absolute";
          el.style.left = `${gridX + spec.dx}px`;
          el.style.top = `${gridY + spec.dy}px`;
          el.style.transform = `translate(-50%, -50%) scale(1)`;
          el.style.fontFamily = "monospace, ui-monospace, sans-serif";
          el.style.fontSize = "14px";
          el.style.fontWeight = "400";
          // A subtle, warm muted color
          el.style.color = "rgba(142, 142, 160, 0.65)";
          el.style.pointerEvents = "none";
          el.style.userSelect = "none";
          // Smooth 1-second fade and slightly shrinking scale
          el.style.transition = `opacity ${FADE_TIME}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${FADE_TIME}ms cubic-bezier(0.16, 1, 0.3, 1)`;
          el.style.opacity = "1";

          container.appendChild(el);

          // Force browser to register the initial layout to enable CSS transition
          void el.offsetWidth;

          // Apply target state for animation immediately
          el.style.opacity = "0";
          el.style.transform = `translate(-50%, -50%) scale(0.6)`;

          // Clean up the DOM element after animation completes
          setTimeout(() => {
            if (container.contains(el)) {
              container.removeChild(el);
            }
          }, FADE_TIME);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none", // Ensure it doesn't block clicks whatsoever
        zIndex: 9999,          // Sit above all UI elements
        overflow: "hidden",
      }}
    />
  );
}
