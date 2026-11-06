"use client";

import type { ReactNode } from "react";

import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

/** All client-side providers in one place. i18n is provided by NextIntlClientProvider in the layout. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
