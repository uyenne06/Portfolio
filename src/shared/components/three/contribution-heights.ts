import type { ContributionDay } from "@/shared/lib/github";

/**
 * Turns the contribution calendar into a weeks × 7 matrix of heights in [0, 1].
 * A square-root scale keeps a single busy day from flattening the rest of the year.
 * Partial first/last weeks are padded with zeros so every column has 7 days.
 */
export function toContributionHeights(weeks: readonly (readonly ContributionDay[])[]): number[][] {
  const max = Math.max(1, ...weeks.flatMap((week) => week.map((day) => day.count)));

  return weeks.map((week, weekIndex) => {
    const counts = week.map((day) => Math.sqrt(day.count / max));
    const padding = Array.from({ length: 7 - counts.length }, () => 0);
    // GitHub's first week is trimmed at the start, the last week at the end.
    return weekIndex === 0 ? [...padding, ...counts] : [...counts, ...padding];
  });
}
