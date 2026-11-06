"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin pink reading-progress rule along the bottom of the masthead. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-accent-decor"
      style={{ scaleX }}
    />
  );
}
