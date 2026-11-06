"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealState = "idle" | "pending" | "done";

type RevealOnViewProps = {
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Exposes `data-reveal` for CSS-driven entrances (see globals.css: .reveal-word, .clip-reveal,
 * .heat-cell). Content is visible by default (no-JS, crawlers, already-visible elements);
 * only elements that start below the fold are hidden ("pending") and then revealed ("done")
 * when they scroll into view.
 */
export function RevealOnView({ as: Tag = "div", id, className, children }: RevealOnViewProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<RevealState>("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    // Hiding happens after mount for below-the-fold content only, so it never flashes.
    setState("pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState("done");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} id={id} data-reveal={state} className={className}>
      {children}
    </Tag>
  );
}
