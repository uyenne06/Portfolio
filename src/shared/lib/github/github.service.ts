import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { FEATURED_PROJECTS } from "@/config/featured-projects.config";
import { serverEnv } from "@/config/env";
import snapshotJson from "@/data/github-snapshot.json";

import { fetchGitHubData } from "./fetch-github-data";
import { githubDataSchema, type GitHubData, type GitHubDataSource } from "./types";

export const GITHUB_CACHE_TAG = "github";

export type GitHubDataResult = { data: GitHubData; source: GitHubDataSource };

function loadSnapshot(): GitHubData {
  return githubDataSchema.parse(snapshotJson);
}

/**
 * Single entry point for GitHub data on the server.
 *
 * Cached with Cache Components: refreshed at most once per hour (`cacheLife("hours")`,
 * the ISR equivalent of `revalidate = 3600`) and invalidatable via `revalidateTag("github")`.
 * Falls back to the committed snapshot when no token is configured or the API fails,
 * so builds never depend on GitHub being reachable.
 */
export async function getGitHubData(): Promise<GitHubDataResult> {
  "use cache";
  cacheLife("hours");
  cacheTag(GITHUB_CACHE_TAG);

  const token = serverEnv.GITHUB_TOKEN;
  if (!token) return { data: loadSnapshot(), source: "snapshot" };

  try {
    const data = await fetchGitHubData({
      token,
      login: serverEnv.GITHUB_USERNAME,
      projects: FEATURED_PROJECTS,
    });
    return { data, source: "live" };
  } catch (error) {
    console.warn("[github] live fetch failed, serving snapshot:", error);
    return { data: loadSnapshot(), source: "snapshot" };
  }
}
