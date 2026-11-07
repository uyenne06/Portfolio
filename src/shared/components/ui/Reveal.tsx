import type { ReactNode } from "react";

import { cn } from "@/shared/utils";

import { RevealOnView } from "./RevealOnView";

/**
 * Fades a block in once when it scrolls into view. Used sparingly (figures only).
 * CSS-driven (`.fade-up` in globals.css); visible by default and for reduced motion.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return <RevealOnView className={cn("fade-up", className)}>{children}</RevealOnView>;
}
