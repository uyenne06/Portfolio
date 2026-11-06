"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { useIsClient } from "@/shared/hooks";

const ORDER = ["system", "light", "dark"] as const;
type ThemeChoice = (typeof ORDER)[number];

const ICONS = { system: Monitor, light: Sun, dark: Moon } satisfies Record<ThemeChoice, unknown>;

function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return (ORDER as readonly string[]).includes(value ?? "");
}

/** Cycles system → light → dark. Defaults to the system preference. */
export function ThemeToggle() {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  const current: ThemeChoice = isClient && isThemeChoice(theme) ? theme : "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? "system";
  const Icon = ICONS[current];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={t("label", { current: t(current), next: t(next) })}
      title={t("label", { current: t(current), next: t(next) })}
      className="inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:text-accent"
    >
      <Icon className="size-5" aria-hidden="true" strokeWidth={1.5} />
    </button>
  );
}
