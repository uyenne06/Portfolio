"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** The blocks that enter one by one: text, list items, figures and anything marked explicitly. */
const BLOCKS = "p, li, h3, h4, blockquote, figure, dl, table, pre, [data-reveal-block]";
/** Delay between blocks that come into view together. */
const STAGGER_MS = 90;
const MAX_STAGGER = 8;
/** Enter duration (globals.css, [data-block]) plus slack, before the element is handed back. */
const SETTLE_MS = 1200;

/**
 * Wraps a section body and brings its blocks in as each one scrolls into view — paragraphs
 * rise out of a soft blur, list items slide in from the left, figures settle from a slight
 * zoom (globals.css, "Block entrances"). Blocks that come into view together enter in DOM
 * order, a beat apart.
 *
 * Only blocks that start below the fold are hidden, after hydration, so nothing ever flashes;
 * no-JS and crawlers see everything. Nested blocks follow their outermost block. Once a block
 * has entered its attribute is removed, so its own transitions (hover colours…) are untouched.
 */
export function RevealBlocks({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blocks = [...root.querySelectorAll<HTMLElement>(BLOCKS)].filter((block) => {
      const outer = block.parentElement?.closest(BLOCKS);
      return !outer || !root.contains(outer);
    });
    const seen = new WeakSet<Element>();
    const timers: number[] = [];

    const enter = (block: HTMLElement, index: number) => {
      block.style.setProperty("--block-delay", `${Math.min(index, MAX_STAGGER) * STAGGER_MS}ms`);
      block.dataset.block = "in";
      timers.push(
        window.setTimeout(
          () => {
            delete block.dataset.block;
            block.style.removeProperty("--block-delay");
          },
          SETTLE_MS + Math.min(index, MAX_STAGGER) * STAGGER_MS,
        ),
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entering: HTMLElement[] = [];
        for (const entry of entries) {
          const block = entry.target as HTMLElement;
          if (!seen.has(block)) {
            // First report: where the block starts. Already on screen → leave it alone.
            seen.add(block);
            if (entry.boundingClientRect.top < window.innerHeight) {
              observer.unobserve(block);
              continue;
            }
            block.dataset.block = "pending";
            continue;
          }
          if (entry.isIntersecting) {
            observer.unobserve(block);
            entering.push(block);
          }
        }
        entering
          .sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          )
          .forEach(enter);
      },
      // Far above the viewport counts as seen, so a fast scroll never leaves blocks hidden.
      { rootMargin: "100000px 0px -8% 0px" },
    );
    blocks.forEach((block) => observer.observe(block));

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
