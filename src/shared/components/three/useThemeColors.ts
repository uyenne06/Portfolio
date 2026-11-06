"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export type SceneColors = { ink: string; accent: string };

const FALLBACK: SceneColors = { ink: "#000000", accent: "#e8a0bf" };

/** Reads the design tokens from CSS so the WebGL scene follows the active theme. */
export function useThemeColors(): SceneColors {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<SceneColors>(FALLBACK);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const ink = styles.getPropertyValue("--ink").trim() || FALLBACK.ink;
    const accent = styles.getPropertyValue("--accent-decor").trim() || FALLBACK.accent;
    // Sync external (CSS) state into React after the theme class has been applied.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors({ ink, accent });
  }, [resolvedTheme]);

  return colors;
}
