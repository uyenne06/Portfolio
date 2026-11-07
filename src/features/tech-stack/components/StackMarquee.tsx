"use client";

import { useEffect, useRef, type RefObject } from "react";

import { usePrefersReducedMotion } from "@/shared/hooks";
import { cn } from "@/shared/utils";

/** Scroll speed (px/s) that gives the full lean, and the lean itself in degrees. */
const FULL_SPEED = 2500;
const MAX_SKEW = 10;

/** Eases the band's skew towards the current scroll velocity, then back upright; idles when settled. */
function useVelocitySkew(bandRef: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = bandRef.current;
    if (!element || !enabled) return;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let goal = 0;
    let skew = 0;
    let frame = 0;
    const tick = () => {
      // Without new scroll events the goal decays back to zero.
      goal *= 0.9;
      skew += (goal - skew) * 0.15;
      element.style.transform = `skewX(${skew.toFixed(2)}deg)`;
      frame = Math.abs(skew) > 0.02 || Math.abs(goal) > 0.02 ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      const now = performance.now();
      const velocity = ((window.scrollY - lastY) / Math.max(1, now - lastTime)) * 1000;
      lastY = window.scrollY;
      lastTime = now;
      goal = Math.max(-MAX_SKEW, Math.min(MAX_SKEW, (-velocity / FULL_SPEED) * MAX_SKEW));
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [bandRef, enabled]);
}

/**
 * Eight-spoked asterisk separator. Drawn as SVG rather than the "✳" character, which phones
 * render as a green emoji tile instead of a pink glyph.
 */
function Asterisk() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-[0.6em] shrink-0 text-accent-decor"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
    >
      <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
    </svg>
  );
}

/**
 * Kinetic band of the tools used most across the featured projects. It drifts on its own and
 * leans with scroll velocity. Decorative (aria-hidden): the same data is in the matrix below.
 */
export function StackMarquee({ items }: { items: string[] }) {
  const reduced = usePrefersReducedMotion();
  const band = useRef<HTMLDivElement>(null);
  useVelocitySkew(band, !reduced);
  const loop = [...items, ...items];

  return (
    <div aria-hidden="true" className="overflow-hidden border-y-2 border-ink py-6 lg:py-10">
      <div ref={band}>
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {loop.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={cn(
                "flex items-center gap-8 pr-8 font-display text-section font-medium whitespace-nowrap",
                index % 2 === 1 ? "text-outline" : "text-ink",
              )}
            >
              {item}
              <Asterisk />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
