"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

import { useMediaQuery, usePrefersReducedMotion } from "@/shared/hooks";
import { cn } from "@/shared/utils";

/**
 * Decorative cursor companion (the native cursor stays visible): a pink dot plus a lagging
 * ring that grows over interactive elements and shows a label over `[data-cursor]` targets.
 * Only for fine pointers without a reduced-motion preference. Loaded lazily by CursorFollower.
 */
export default function CursorFollowerLayer() {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 32, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 380, damping: 32, mass: 0.5 });
  const [mode, setMode] = useState<"idle" | "link" | "label">("idle");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = event.target instanceof Element ? event.target : null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setMode("label");
        setLabel(labelled.dataset.cursor ?? "");
      } else if (target?.closest("a, button, [role='button'], summary, label")) {
        setMode("link");
      } else {
        setMode("idle");
      }
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
      <motion.div
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: mode === "label" ? 1 : mode === "link" ? 1.5 : 1,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={cn(
          "absolute top-0 left-0 flex items-center justify-center rounded-full transition-[width,height,background-color,border-color] duration-300",
          mode === "label"
            ? "size-24 border-transparent bg-accent-decor"
            : "size-9 border border-ink/50",
        )}
      >
        <AnimatePresence>
          {mode === "label" ? (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="font-mono text-xs font-medium text-on-accent"
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>
      <motion.div
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible && mode !== "label" ? 1 : 0 }}
        className="absolute top-0 left-0 size-1.5 rounded-full bg-accent-decor"
      />
    </div>
  );
}
