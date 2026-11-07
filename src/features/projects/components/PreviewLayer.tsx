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
import { useEffect, useState, type ReactNode, type RefObject } from "react";

type PreviewLayerProps = {
  /** The project list the preview follows the pointer over. */
  containerRef: RefObject<HTMLDivElement | null>;
  previews: Record<string, ReactNode>;
};

/**
 * The floating screenshot itself, loaded by HoverPreview on the first hover. It listens to the
 * list's pointer events directly and springs after the cursor, leaning into the direction of
 * travel like a card being dragged.
 */
export default function PreviewLayer({ containerRef, previews }: PreviewLayerProps) {
  const reduced = useReducedMotion();
  const [slug, setSlug] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const rotate = useTransform(useVelocity(springX), [-1800, 1800], [-9, 9], { clamp: true });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onMove = (event: PointerEvent) => {
      const row = (event.target as HTMLElement).closest<HTMLElement>("[data-preview]");
      setSlug(row?.dataset.preview ?? null);
      const bounds = container.getBoundingClientRect();
      // The preview sits left of the cursor (28rem wide, shifted -110%); keep it inside the list.
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      x.set(Math.max(rem * 28 * 1.1, event.clientX - bounds.left));
      y.set(event.clientY - bounds.top);
    };
    const onLeave = () => setSlug(null);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef, x, y]);

  return (
    <AnimatePresence>
      {slug && previews[slug] ? (
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
  );
}
