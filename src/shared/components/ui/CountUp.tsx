"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

type CountUpProps = { value: number; locale: string; className?: string };

/**
 * Renders the final number on the server (no-JS and crawlers see the real value), then
 * counts up from zero the first time it scrolls into view — only if it started off-screen.
 */
export function CountUp({ value, locale, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();
  const armed = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    const rect = node.getBoundingClientRect();
    // Already visible on load: keep the static value, nothing to animate.
    if (rect.top < window.innerHeight) return;
    node.textContent = new Intl.NumberFormat(locale).format(0);
    armed.current = true;
  }, [locale, reduced]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || !armed.current) return;
    const format = new Intl.NumberFormat(locale);
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = format.format(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [inView, value, locale]);

  return (
    <span ref={ref} className={className}>
      {new Intl.NumberFormat(locale).format(value)}
    </span>
  );
}
