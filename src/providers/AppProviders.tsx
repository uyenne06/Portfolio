"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "./ThemeProvider";

/** App-wide client providers. i18n is provided by NextIntlClientProvider in the layout. */
export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
