"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False on the server and during hydration, true afterwards (avoids mismatches for client-only state). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
