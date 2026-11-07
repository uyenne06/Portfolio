"use client";

import { useEffect, useRef } from "react";

type CountUpProps = { value: number; locale: string; className?: string };

const DURATION_MS = 1400;
/** Quartic ease-out — close to the site's cubic-bezier(0.22, 1, 0.36, 1) for counting digits. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Renders the final number on the server (no-JS and crawlers see the real value), then
 * counts up from zero the first time it scrolls into view — only if it started off-screen.
 */
export function CountUp({ value, locale, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const format = new Intl.NumberFormat(locale);
    let frame = 0;
    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (first) {
          first = false;
          // Already visible (or scrolled past) on load: keep the static value.
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            observer.disconnect();
            return;
          }
          node.textContent = format.format(0);
          return;
        }
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          node.textContent = format.format(Math.round(easeOut(t) * value));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, locale]);

  return (
    <span ref={ref} className={className}>
      {new Intl.NumberFormat(locale).format(value)}
    </span>
  );
}
