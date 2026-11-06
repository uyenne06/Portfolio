import { z } from "zod";

/**
 * Normalised GitHub data used by the whole site. This is also the exact shape of
 * the committed snapshot (`src/data/github-snapshot.json`), so the schema doubles
 * as the snapshot validator.
 */

export const languageShareSchema = z.object({
  name: z.string(),
  color: z.string().nullable(),
  size: z.number().int().nonnegative(),
});

export const repoDataSchema = z.object({
  nameWithOwner: z.string(),
  url: z.url(),
  homepageUrl: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.string(),
  pushedAt: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  languages: z.array(languageShareSchema),
  /** Dependency identifiers found in the configured manifests (package names / Maven artifactIds). */
  dependencies: z.array(z.string()),
  /** Manifest kinds that were found, e.g. "npm" or "maven". */
  manifestKinds: z.array(z.enum(["npm", "maven"])),
  /** Commits authored by the user on the default branch (merge commits included). */
  authorCommits: z.number().int().nonnegative(),
  pullRequestsOpened: z.number().int().nonnegative(),
  pullRequestsMerged: z.number().int().nonnegative(),
});

export const contributionDaySchema = z.object({
  date: z.string(),
  count: z.number().int().nonnegative(),
});

export const githubDataSchema = z.object({
  fetchedAt: z.string(),
  profile: z.object({
    login: z.string(),
    name: z.string().nullable(),
    avatarUrl: z.url(),
    url: z.url(),
    location: z.string().nullable(),
    company: z.string().nullable(),
    email: z.string().nullable(),
    bio: z.string().nullable(),
    followers: z.number().int().nonnegative(),
    publicRepos: z.number().int().nonnegative(),
    createdAt: z.string(),
    socialAccounts: z.array(z.object({ provider: z.string(), url: z.url() })),
  }),
  contributions: z.object({
    total: z.number().int().nonnegative(),
    commits: z.number().int().nonnegative(),
    pullRequests: z.number().int().nonnegative(),
    issues: z.number().int().nonnegative(),
    reviews: z.number().int().nonnegative(),
    /** One array per week, each holding up to 7 days (Sunday first). */
    weeks: z.array(z.array(contributionDaySchema)),
  }),
  repos: z.record(z.string(), repoDataSchema),
});

export type LanguageShare = z.infer<typeof languageShareSchema>;
export type RepoData = z.infer<typeof repoDataSchema>;
export type ContributionDay = z.infer<typeof contributionDaySchema>;
export type GitHubData = z.infer<typeof githubDataSchema>;
export type GitHubDataSource = "live" | "snapshot";
