"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Short fade between routes (mounted by `app/[locale]/template.tsx`). */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
