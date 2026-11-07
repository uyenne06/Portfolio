"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { THEME_ORDER, type ThemeChoice } from "@/shared/constants/theme";
import { useIsClient } from "@/shared/hooks";

const ORDER = THEME_ORDER;

const ICONS = { system: Monitor, light: Sun, dark: Moon } satisfies Record<ThemeChoice, unknown>;

function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return (ORDER as readonly string[]).includes(value ?? "");
}

/**
 * Cycles system → light → dark. Defaults to the system preference. `labels` holds the
 * accessible name for each current choice ("Colour theme: light. Switch to dark."), formatted
 * on the server.
 */
export function ThemeToggle({ labels }: { labels: Record<ThemeChoice, string> }) {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  const current: ThemeChoice = isClient && isThemeChoice(theme) ? theme : "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? "system";
  const Icon = ICONS[current];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={labels[current]}
      title={labels[current]}
      className="inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:text-accent"
    >
      <Icon className="size-5" aria-hidden="true" strokeWidth={1.5} />
    </button>
  );
}
