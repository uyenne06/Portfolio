/**
 * Fetches and normalises everything the portfolio needs from the GitHub GraphQL API.
 *
 * Deliberately free of Next.js / `server-only` imports so the same code runs in
 * `scripts/sync-github.ts` (snapshot generation) and in the cached server service.
 */

import { z } from "zod";

import { manifestKindFromPath, parseManifest, type ManifestKind } from "./manifest";
import { buildPortfolioQuery, USER_ID_QUERY, type RepoQueryInput } from "./queries";
import {
  graphqlErrorSchema,
  repoNodeSchema,
  restUserSchema,
  searchCountSchema,
  userNodeSchema,
  viewerIdResponseSchema,
  type RepoNode,
  type UserNode,
} from "./schemas";
import { githubDataSchema, type GitHubData, type RepoData } from "./types";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export type ProjectSource = { repo: string; manifests: string[] };

export class GitHubFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubFetchError";
  }
}

async function graphql(
  token: string,
  query: string,
  variables: Record<string, string>,
): Promise<unknown> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-github-sync",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new GitHubFetchError(
      `GitHub GraphQL responded ${response.status} ${response.statusText}`,
    );
  }

  const json: unknown = await response.json();
  const { errors } = graphqlErrorSchema.parse(json);
  // A missing optional field (e.g. absent manifest) is not an error; real errors are.
  if (errors?.length) {
    throw new GitHubFetchError(`GitHub GraphQL errors: ${errors.map((e) => e.message).join("; ")}`);
  }
  return json;
}

async function fetchPublicEmail(token: string, login: string): Promise<string | null> {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-github-sync",
    },
  });
  if (!response.ok) return null;
  return restUserSchema.parse(await response.json()).email ?? null;
}

function toRepoQueryInputs(projects: readonly ProjectSource[]): RepoQueryInput[] {
  return projects.map((project, index) => {
    const [owner, name] = project.repo.split("/");
    if (!owner || !name) throw new GitHubFetchError(`Invalid repo "${project.repo}"`);
    return { alias: `repo${index}`, owner, name, manifests: project.manifests };
  });
}

function normaliseProfile(user: UserNode, email: string | null): GitHubData["profile"] {
  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    url: user.url,
    location: user.location?.trim() || null,
    company: user.company?.trim() || null,
    email: email || null,
    bio: user.bio,
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    createdAt: user.createdAt,
    socialAccounts: user.socialAccounts.nodes,
  };
}

function normaliseContributions(user: UserNode): GitHubData["contributions"] {
  const collection = user.contributionsCollection;
  return {
    total: collection.contributionCalendar.totalContributions,
    commits: collection.totalCommitContributions,
    pullRequests: collection.totalPullRequestContributions,
    issues: collection.totalIssueContributions,
    reviews: collection.totalPullRequestReviewContributions,
    weeks: collection.contributionCalendar.weeks.map((week) =>
      week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount })),
    ),
  };
}

function normaliseRepo(
  node: RepoNode,
  manifests: string[],
  prsOpened: number,
  prsMerged: number,
): RepoData {
  const dependencies = new Set<string>();
  const kinds = new Set<ManifestKind>();
  const blobs = [node.manifest0, node.manifest1, node.manifest2];

  manifests.forEach((path, index) => {
    const text = blobs[index]?.text;
    const kind = manifestKindFromPath(path);
    if (!text || !kind) return;
    kinds.add(kind);
    for (const dependency of parseManifest(kind, text)) dependencies.add(dependency);
  });

  return {
    nameWithOwner: node.nameWithOwner,
    url: node.url,
    homepageUrl: node.homepageUrl || null,
    description: node.description || null,
    createdAt: node.createdAt,
    pushedAt: node.pushedAt,
    stars: node.stargazerCount,
    languages: node.languages.edges.map((edge) => ({
      name: edge.node.name,
      color: edge.node.color,
      size: edge.size,
    })),
    dependencies: [...dependencies].sort(),
    manifestKinds: [...kinds],
    authorCommits: node.defaultBranchRef?.target?.history?.totalCount ?? 0,
    pullRequestsOpened: prsOpened,
    pullRequestsMerged: prsMerged,
  };
}

export async function fetchGitHubData(options: {
  token: string;
  login: string;
  projects: readonly ProjectSource[];
}): Promise<GitHubData> {
  const { token, login, projects } = options;

  const idResponse = viewerIdResponseSchema.parse(await graphql(token, USER_ID_QUERY, { login }));
  const userId = idResponse.data.user?.id;
  if (!userId) throw new GitHubFetchError(`GitHub user "${login}" not found`);

  const inputs = toRepoQueryInputs(projects);
  const [raw, email] = await Promise.all([
    graphql(token, buildPortfolioQuery(login, inputs), { login, userId }),
    fetchPublicEmail(token, login),
  ]);
  const data = z.object({ data: z.record(z.string(), z.unknown()) }).parse(raw).data;

  const user = userNodeSchema.parse(data.user);
  const repos: Record<string, RepoData> = {};

  inputs.forEach((input, index) => {
    const node = data[input.alias];
    // A renamed / deleted / private repo comes back as null; skip it rather than fail the build.
    if (node == null) return;
    const repo = repoNodeSchema.parse(node);
    const prs = searchCountSchema.parse(data[`${input.alias}_prs`]).issueCount;
    const merged = searchCountSchema.parse(data[`${input.alias}_merged`]).issueCount;
    const source = projects[index];
    if (!source) return;
    repos[source.repo] = normaliseRepo(repo, source.manifests, prs, merged);
  });

  return githubDataSchema.parse({
    fetchedAt: new Date().toISOString(),
    profile: normaliseProfile(user, email),
    contributions: normaliseContributions(user),
    repos,
  });
}
