/** Theme cycle order of the masthead toggle (system → light → dark). */
export const THEME_ORDER = ["system", "light", "dark"] as const;
export type ThemeChoice = (typeof THEME_ORDER)[number];
