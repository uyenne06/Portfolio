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

    // The observer's first report says where the element starts, without forcing a
    // synchronous layout during hydration (as reading its rect here would). Hiding happens
    // after mount for below-the-fold content only, so it never flashes.
    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (first) {
          first = false;
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            observer.disconnect();
            return;
          }
          setState("pending");
          return;
        }
        // Also reveal when it was scrolled past between two reports (fast scroll, a jump to
        // an anchor), so content is never left hidden above the viewport.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          setState("done");
          observer.disconnect();
        }
      },
      // The root extends far above the viewport: an element counts as seen once it has
      // entered from below, even if a fast scroll or an anchor jump carried it straight past.
      { rootMargin: "100000px 0px -12% 0px" },
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
