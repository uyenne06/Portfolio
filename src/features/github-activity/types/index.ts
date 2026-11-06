import type { ContributionDay, GitHubDataSource } from "@/shared/lib/github";

export type ActivityStats = {
  contributions: number;
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
};

export type LanguageSlice = { name: string; percent: number };

export type ActivitySummary = {
  stats: ActivityStats;
  languages: LanguageSlice[];
  weeks: ContributionDay[][];
  source: GitHubDataSource;
  fetchedAt: string;
};
