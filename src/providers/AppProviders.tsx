"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "./ThemeProvider";

/**
 * App-wide client providers. i18n is provided by NextIntlClientProvider in the layout; the
 * TanStack Query provider wraps only the one client-fetched island (RecentActivityFeed), so
 * the query library is not part of the first load.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
