"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useMediaQuery, usePrefersReducedMotion } from "@/shared/hooks";

// The follower (and the animation library it uses) loads on the first mouse move, so it never
// competes with the first paint or hydration — and touch devices never download it.
const CursorFollowerLayer = dynamic(() => import("./CursorFollowerLayer"), { ssr: false });

/** Decorative cursor companion for fine pointers without a reduced-motion preference. */
export function CursorFollower() {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const arm = () => setArmed(true);
    window.addEventListener("pointermove", arm, { once: true, passive: true });
    return () => window.removeEventListener("pointermove", arm);
  }, [enabled]);

  return enabled && armed ? <CursorFollowerLayer /> : null;
}
