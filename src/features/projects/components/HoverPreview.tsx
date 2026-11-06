"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useState, type PointerEvent, type ReactNode } from "react";

import { useMediaQuery } from "@/shared/hooks";

type HoverPreviewProps = {
  /** Server-rendered plates per slug, shown next to the cursor. */
  previews: Record<string, ReactNode>;
  children: ReactNode;
};

/**
 * Wraps the project list (server-rendered children) and floats the hovered project's
 * screenshot beside the cursor. Only on wide screens with a fine pointer; the list stays
 * fully usable without it.
 */
export function HoverPreview({ previews, children }: HoverPreviewProps) {
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 64rem)");
  const reduced = useReducedMotion();
  const [slug, setSlug] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  // Lean into the direction of travel, like a card being dragged.
  const rotate = useTransform(useVelocity(springX), [-1800, 1800], [-9, 9], { clamp: true });

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-preview]");
    setSlug(row?.dataset.preview ?? null);
    const bounds = event.currentTarget.getBoundingClientRect();
    // The preview sits left of the cursor (28rem wide, shifted -110%); keep it inside the list.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    x.set(Math.max(rem * 28 * 1.1, event.clientX - bounds.left));
    y.set(event.clientY - bounds.top);
  };

  return (
    <div className="relative" onPointerMove={onPointerMove} onPointerLeave={() => setSlug(null)}>
      {children}
      <AnimatePresence>
        {enabled && slug && previews[slug] ? (
          <motion.div
            key={slug}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-10 w-md"
            style={{
              x: reduced ? x : springX,
              y: reduced ? y : springY,
              rotate: reduced ? 0 : rotate,
              translateX: "-110%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="shadow-2xl shadow-ink/20">{previews[slug]}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
