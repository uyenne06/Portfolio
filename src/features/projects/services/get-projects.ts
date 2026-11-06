import { FEATURED_PROJECTS, type FeaturedProjectConfig } from "@/config/featured-projects.config";
import type { GitHubData, RepoData } from "@/shared/lib/github";
import { technologiesOf } from "@/shared/lib/tech-catalog";

import type { LanguagePercent, Project } from "../types";

const MIN_LANGUAGE_SHARE = 0.01;

function languagePercents(repo: RepoData): LanguagePercent[] {
  const total = repo.languages.reduce((sum, language) => sum + language.size, 0);
  if (total === 0) return [];
  return repo.languages
    .map((language) => ({ name: language.name, share: language.size / total }))
    .filter((language) => language.share >= MIN_LANGUAGE_SHARE)
    .map((language) => ({ name: language.name, percent: Math.round(language.share * 1000) / 10 }));
}

function toProject(config: FeaturedProjectConfig, repo: RepoData): Project {
  return {
    slug: config.slug,
    context: config.context,
    repoName: repo.nameWithOwner,
    repoUrl: repo.url,
    demoUrl: config.demoUrl ?? repo.homepageUrl,
    relatedRepos: (config.relatedRepos ?? []).map((name) => ({
      name,
      url: `https://github.com/${name}`,
    })),
    commits: repo.authorCommits,
    pullRequestsOpened: repo.pullRequestsOpened,
    pullRequestsMerged: repo.pullRequestsMerged,
    languages: languagePercents(repo),
    stack: technologiesOf(repo),
    image: config.image ?? null,
    references: config.references,
  };
}

/** Featured projects that exist in the data, ordered by the author's commit count. */
export function getProjects(data: GitHubData): Project[] {
  return FEATURED_PROJECTS.flatMap((config) => {
    const repo = data.repos[config.repo];
    return repo ? [toProject(config, repo)] : [];
  }).sort((a, b) => b.commits - a.commits);
}

export function getProject(data: GitHubData, slug: string): Project | undefined {
  return getProjects(data).find((project) => project.slug === slug);
}

/** Repositories behind the featured projects (for stack and language aggregation). */
export function getFeaturedRepos(data: GitHubData): RepoData[] {
  return FEATURED_PROJECTS.flatMap((config) => data.repos[config.repo] ?? []);
}
