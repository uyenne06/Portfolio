/** Presentation-ready data for the ridgeline figure (labels already localised). */

export type RidgeSeries = {
  id: string;
  label: string;
  /** e.g. "148 commits · Sep – Oct 2026" */
  detail: string;
  /** Commits per week. */
  values: number[];
  /** In-page anchor for the project, or null for the "other repositories" ridge. */
  href: string | null;
};

export type RidgeTimeline = {
  /** Month labels and the week index where each month starts. */
  months: { index: number; label: string }[];
  weekCount: number;
  /** Front-to-back order. */
  series: RidgeSeries[];
};
