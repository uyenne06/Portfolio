"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export type SceneColors = {
  ink: string;
  muted: string;
  paper: string;
  rule: string;
  accent: string;
  accentSoft: string;
};

const FALLBACK: SceneColors = {
  ink: "#000000",
  muted: "#555555",
  paper: "#ffffff",
  rule: "#e4e4e4",
  accent: "#e8a0bf",
  accentSoft: "#fbe4ee",
};

/** Reads the design tokens from CSS so the WebGL scene follows the active theme. */
export function useThemeColors(): SceneColors {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<SceneColors>(FALLBACK);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    // Sync external (CSS) state into React after the theme class has been applied.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors({
      ink: read("--ink", FALLBACK.ink),
      muted: read("--muted", FALLBACK.muted),
      paper: read("--paper", FALLBACK.paper),
      rule: read("--rule", FALLBACK.rule),
      accent: read("--accent-decor", FALLBACK.accent),
      accentSoft: read("--accent-soft", FALLBACK.accentSoft),
    });
  }, [resolvedTheme]);

  return colors;
}
