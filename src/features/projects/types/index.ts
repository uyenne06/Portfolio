import type { FeaturedProjectConfig, ProjectContext } from "@/config/featured-projects.config";
import type { TechGroup } from "@/shared/lib/tech-catalog";

export type LanguagePercent = { name: string; percent: number };

/** Locale-independent view model; copy comes from `projects.items.<slug>` messages. */
export type Project = {
  slug: FeaturedProjectConfig["slug"];
  context: ProjectContext;
  repoName: string;
  repoUrl: string;
  demoUrl: string | null;
  relatedRepos: { name: string; url: string }[];
  commits: number;
  pullRequestsOpened: number;
  pullRequestsMerged: number;
  languages: LanguagePercent[];
  stack: { label: string; group: TechGroup }[];
  image: FeaturedProjectConfig["image"] | null;
  references: string[];
};
