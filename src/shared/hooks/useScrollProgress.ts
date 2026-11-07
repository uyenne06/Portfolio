"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * - `contain`: 0 when the target's top meets the viewport top, 1 when its bottom meets the
 *   viewport bottom (a tall section with a sticky stage).
 * - `cross`: 0 when the target's top enters at the bottom, 1 when its bottom leaves at the top.
 */
export type ScrollRange = "contain" | "cross";

/**
 * Reports scroll progress (0–1, clamped) through a target — or through the whole page when
 * `target` is null — at most once per animation frame. A few lines instead of an animation
 * library: callers write styles straight to the DOM, so scrolling never re-renders React.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null> | null,
  range: ScrollRange,
  onProgress: (value: number) => void,
): void {
  const callback = useRef(onProgress);
  useEffect(() => {
    callback.current = onProgress;
  });

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const viewport = window.innerHeight;
      let value: number;
      if (!target) {
        const max = document.documentElement.scrollHeight - viewport;
        value = max > 0 ? window.scrollY / max : 0;
      } else {
        const element = target.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        value =
          range === "contain"
            ? -rect.top / Math.max(1, rect.height - viewport)
            : (viewport - rect.top) / (viewport + rect.height);
      }
      callback.current(Math.min(1, Math.max(0, value)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [target, range]);
}

/** Piecewise-linear map of `value` from `input` stops to `output` stops, clamped at the ends. */
export function mapRange(value: number, input: readonly number[], output: readonly number[]) {
  if (value <= input[0]) return output[0];
  for (let i = 1; i < input.length; i++) {
    if (value <= input[i]) {
      const t = (value - input[i - 1]) / (input[i] - input[i - 1]);
      return output[i - 1] + t * (output[i] - output[i - 1]);
    }
  }
  return output[output.length - 1];
}
