"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

/** True after the first page has mounted: the curtain only plays on client navigations. */
let hasNavigated = false;

/**
 * Route transition (mounted by `app/[locale]/template.tsx`): a pink curtain lifts off the new
 * page. Skipped on the first load (so it never delays the first paint) and for reduced motion.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [isFirstPage] = useState(() => !hasNavigated);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  if (reduced || isFirstPage) return <>{children}</>;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 origin-top bg-accent-decor"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
