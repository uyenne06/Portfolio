"use client";

import { useRef } from "react";

import { useScrollProgress } from "@/shared/hooks";

/** Thin pink reading-progress rule along the bottom of the masthead. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useScrollProgress(null, "contain", (value) => {
    if (bar.current) bar.current.style.transform = `scaleX(${value})`;
  });
  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-accent-decor"
    />
  );
}
