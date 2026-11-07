"use client";

import { useRef } from "react";

import { useScrollProgress } from "@/shared/hooks";

/** Pink reading-progress rule along the top edge of the masthead. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useScrollProgress(null, "contain", (value) => {
    if (bar.current) bar.current.style.transform = `scaleX(${value})`;
  });
  // Width comes from `transform` alone (Tailwind's scale-* utilities use the separate `scale`
  // property, which would multiply with it and keep the bar at zero).
  return (
    <div
      ref={bar}
      aria-hidden="true"
      style={{ transform: "scaleX(0)" }}
      className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-accent-decor"
    />
  );
}
