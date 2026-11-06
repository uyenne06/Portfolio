import { FEATURED_PROJECTS, type ProjectSlug } from "@/config/featured-projects.config";
import type { GitHubData } from "@/shared/lib/github";

import type { WorkTimeline, WorkTimelineSeries } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/** Monday 00:00 UTC of the week containing `date`. */
function weekStart(date: Date): number {
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const weekday = (new Date(day).getUTCDay() + 6) % 7;
  return day - weekday * DAY_MS;
}

/**
 * Weekly commits per featured project, from the first week with any commit up to the
 * snapshot date. Commits to repositories that are not featured (and are not mirrors of a
 * featured one) are grouped into an "other" series so the total stays honest.
 */
export function buildWorkTimeline(data: GitHubData): WorkTimeline {
  const byRepo = data.contributions.byRepository;
  const allDays = byRepo.flatMap((entry) => entry.days.filter((day) => day.count > 0));
  if (allDays.length === 0) return { weekStarts: [], series: [] };

  const first = weekStart(new Date(Math.min(...allDays.map((day) => Date.parse(day.date)))));
  const last = weekStart(new Date(data.fetchedAt));
  const weekCount = Math.max(1, Math.round((last - first) / WEEK_MS) + 1);
  const weekStarts = Array.from({ length: weekCount }, (_, index) =>
    new Date(first + index * WEEK_MS).toISOString().slice(0, 10),
  );

  const bucket = (repos: readonly string[]): number[] => {
    const values = Array.from({ length: weekCount }, () => 0);
    for (const entry of byRepo) {
      if (!repos.includes(entry.repo)) continue;
      for (const day of entry.days) {
        const index = Math.round((weekStart(new Date(day.date)) - first) / WEEK_MS);
        if (index >= 0 && index < weekCount) values[index] = (values[index] ?? 0) + day.count;
      }
    }
    return values;
  };

  const toSeries = (id: ProjectSlug | "other", values: number[]): WorkTimelineSeries | null => {
    const active = values.flatMap((value, index) => (value > 0 ? [index] : []));
    const firstIndex = active[0];
    const lastIndex = active.at(-1);
    if (firstIndex === undefined || lastIndex === undefined) return null;
    return {
      id,
      values,
      total: values.reduce((sum, value) => sum + value, 0),
      firstWeek: weekStarts[firstIndex] ?? "",
      lastWeek: weekStarts[lastIndex] ?? "",
    };
  };

  const featuredRepos = new Set(
    FEATURED_PROJECTS.flatMap((project) => [project.repo, ...(project.relatedRepos ?? [])]),
  );
  const otherRepos = byRepo.map((entry) => entry.repo).filter((repo) => !featuredRepos.has(repo));

  const series = [
    ...FEATURED_PROJECTS.map((project) => toSeries(project.slug, bucket([project.repo]))),
    toSeries("other", bucket(otherRepos)),
  ]
    .filter((entry): entry is WorkTimelineSeries => entry !== null)
    // Earliest work in front, most recent at the back of the stack.
    .sort((a, b) => a.firstWeek.localeCompare(b.firstWeek));

  return { weekStarts, series };
}
