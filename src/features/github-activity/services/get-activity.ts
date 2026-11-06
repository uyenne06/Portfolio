import type { GitHubData, GitHubDataSource, RepoData } from "@/shared/lib/github";

import { OTHER_LANGUAGE } from "../constants";
import type { ActivitySummary, LanguageSlice } from "../types";

/** Languages below this share are folded into "Other" to keep Fig. 2 legible. */
const MIN_SHARE = 0.02;

function aggregateLanguages(repos: readonly RepoData[]): LanguageSlice[] {
  const totals = new Map<string, number>();
  for (const repo of repos) {
    for (const language of repo.languages) {
      totals.set(language.name, (totals.get(language.name) ?? 0) + language.size);
    }
  }

  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (sum === 0) return [];

  let other = 0;
  const slices: LanguageSlice[] = [];
  for (const [name, size] of [...totals.entries()].sort((a, b) => b[1] - a[1])) {
    const share = size / sum;
    if (share < MIN_SHARE) other += share;
    else slices.push({ name, percent: Math.round(share * 1000) / 10 });
  }
  if (other > 0) slices.push({ name: OTHER_LANGUAGE, percent: Math.round(other * 1000) / 10 });
  return slices;
}

export function getActivitySummary(
  data: GitHubData,
  featuredRepos: readonly RepoData[],
  source: GitHubDataSource,
): ActivitySummary {
  const { contributions } = data;
  return {
    stats: {
      contributions: contributions.total,
      commits: contributions.commits,
      pullRequests: contributions.pullRequests,
      issues: contributions.issues,
      reviews: contributions.reviews,
    },
    languages: aggregateLanguages(featuredRepos),
    weeks: contributions.weeks,
    source,
    fetchedAt: data.fetchedAt,
  };
}
