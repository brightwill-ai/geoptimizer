"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        prevent: (node: HTMLElement) => {
          // Allow native scroll on elements that have their own scrollable overflow
          let el: HTMLElement | null = node;
          while (el && el !== document.body) {
            const overflow = getComputedStyle(el).overflowY;
            if ((overflow === "auto" || overflow === "scroll") && el.scrollHeight > el.clientHeight) {
              return true;
            }
            el = el.parentElement;
          }
          return false;
        },
      }}
    >
      {children}
    </ReactLenis>
  );
}
