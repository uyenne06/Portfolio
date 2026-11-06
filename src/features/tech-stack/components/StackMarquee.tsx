"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

import { cn } from "@/shared/utils";

/**
 * Kinetic band of the tools used most across the featured projects. It drifts on its own and
 * leans with scroll velocity. Decorative (aria-hidden): the same data is in the matrix below.
 */
export function StackMarquee({ items }: { items: string[] }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const skewX = useTransform(velocity, [-2500, 2500], [10, -10], { clamp: true });
  const loop = [...items, ...items];

  return (
    <div aria-hidden="true" className="overflow-hidden border-y-2 border-ink py-6 lg:py-10">
      <motion.div style={reduced ? undefined : { skewX }}>
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {loop.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={cn(
                "flex items-center gap-8 pr-8 font-display text-section font-medium whitespace-nowrap",
                index % 2 === 1 ? "text-outline" : "text-ink",
              )}
            >
              {item}
              <span className="text-accent-decor">✳</span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
