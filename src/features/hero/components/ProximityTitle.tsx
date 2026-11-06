"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { useMediaQuery, usePrefersReducedMotion } from "@/shared/hooks";

type ProximityTitleProps = { id: string; words: string[]; className?: string };

/** Grapheme split, so Vietnamese letters with stacked diacritics stay whole. */
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const graphemes = (word: string) => [...segmenter.segment(word)].map((part) => part.segment);

/** Radius of the cursor's influence, in rem (converted with the root font size). */
const RADIUS_REM = 14;

/**
 * The name as the page title. Words rise in on load (CSS); afterwards, letters near the
 * cursor lift and blush pink like a wave. Only transforms and colour change, so the line
 * never reflows. Disabled for touch and reduced motion.
 */
export function ProximityTitle({ id, words, className }: ProximityTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const heading = ref.current;
    if (!heading || !finePointer || reduced) return;
    const letters = [...heading.querySelectorAll<HTMLSpanElement>("[data-letter]")];
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const radius = RADIUS_REM * rem;
    let frame = 0;
    let pointer = { x: -1e6, y: -1e6 };

    const paint = () => {
      frame = 0;
      for (const letter of letters) {
        const box = letter.getBoundingClientRect();
        const distance = Math.hypot(
          box.left + box.width / 2 - pointer.x,
          box.top + box.height / 2 - pointer.y,
        );
        const t = Math.max(0, 1 - distance / radius);
        const eased = t * t * (3 - 2 * t);
        letter.style.transform = eased
          ? `translateY(${(-0.12 * eased).toFixed(3)}em) rotate(${(-4 * eased).toFixed(2)}deg)`
          : "";
        letter.style.color = eased
          ? `color-mix(in oklab, var(--accent) ${Math.round(eased * 100)}%, var(--ink))`
          : "";
      }
    };
    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      pointer = { x: -1e6, y: -1e6 };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [finePointer, reduced]);

  return (
    <h1 ref={ref} id={id} className={className} aria-label={words.join(" ")}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} aria-hidden="true">
          <span className="rise-word">
            <span style={{ "--rise-index": index } as CSSProperties}>
              {graphemes(word).map((char, charIndex) => (
                <span
                  key={charIndex}
                  data-letter=""
                  className="inline-block transition-[transform,color] duration-300 ease-paper"
                >
                  {char}
                </span>
              ))}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}
