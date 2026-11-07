"use client";

import { useEffect, useState, type ReactNode } from "react";

/** True after the first page has mounted: the curtain only plays on client navigations. */
let hasNavigated = false;

/**
 * Route transition (mounted by `app/[locale]/template.tsx`): a pink curtain lifts off the new
 * page while it fades up. Pure CSS (`.page-curtain` / `.page-enter` in globals.css), skipped on
 * the first load so it never delays the first paint; reduced motion collapses it to nothing.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [isFirstPage] = useState(() => !hasNavigated);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  if (isFirstPage) return <>{children}</>;

  return (
    <>
      <div
        aria-hidden="true"
        className="page-curtain pointer-events-none fixed inset-0 z-50 origin-top bg-accent-decor"
      />
      <div className="page-enter">{children}</div>
    </>
  );
}
