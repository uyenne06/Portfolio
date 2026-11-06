import type { ProjectSlug } from "@/config/featured-projects.config";

export type WorkTimelineSeries = {
  id: ProjectSlug | "other";
  /** Commits per week, aligned with `WorkTimeline.weekStarts`. */
  values: number[];
  total: number;
  firstWeek: string;
  lastWeek: string;
};

/** Locale-independent weekly commit series; labels are added by the component. */
export type WorkTimeline = {
  /** ISO dates (Mondays) of each week on the x-axis. */
  weekStarts: string[];
  series: WorkTimelineSeries[];
};
