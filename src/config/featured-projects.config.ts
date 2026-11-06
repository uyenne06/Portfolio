/**
 * Which repositories appear on the portfolio, in display order.
 *
 * Structure only — every human-readable string (title, summary, case study)
 * lives in `src/i18n/messages/{en,vi}.json` under `projects.items.<slug>`, so the
 * bilingual copy stays next to the rest of the translations.
 *
 * Facts behind each entry are documented in `docs/github-facts.md`.
 */

import type messages from "@/i18n/messages/en.json";

export type ProjectContext = "vnz" | "hkbdu" | "team" | "personal";

/** A slug must have copy in the message files, so the type is derived from them. */
export type ProjectSlug = keyof typeof messages.projects.items;

export type FeaturedProjectConfig = {
  /** URL segment for `/projects/[slug]` and key into `projects.items` messages. */
  slug: ProjectSlug;
  /** `owner/name` of the repository whose stats (commits, PRs, languages) are shown. */
  repo: string;
  /** Paths of dependency manifests read to derive the tech stack. */
  manifests: string[];
  /** Overrides the repository homepage when the live demo lives elsewhere. */
  demoUrl?: string;
  /** Extra repositories linked from the case study (mirrors, preview deployments). */
  relatedRepos?: string[];
  context: ProjectContext;
  /** Reference ids (see references.config.ts) cited by the case study. */
  references: string[];
};

export const FEATURED_PROJECTS: readonly FeaturedProjectConfig[] = [
  {
    slug: "pegaxus",
    repo: "HKBDU/pegaxus-fe",
    manifests: ["package.json"],
    context: "hkbdu",
    references: ["repo-pegaxus"],
  },
  {
    slug: "bmt-decor",
    repo: "hdyui/BMT_FE",
    manifests: ["package.json"],
    relatedRepos: ["uyenne06/BMT-Landing-Page"],
    context: "vnz",
    references: ["repo-bmt", "owner-confirmation"],
  },
  {
    slug: "savico-ai",
    repo: "kat-minh/savico-ai",
    manifests: ["package.json"],
    relatedRepos: ["uyenne06/savico-ai-preview"],
    context: "team",
    references: ["repo-savico"],
  },
  {
    slug: "meetly",
    repo: "HKBDU/Meetly",
    manifests: ["frontend/package.json"],
    context: "hkbdu",
    references: ["repo-meetly"],
  },
  {
    slug: "ritual-catalog",
    repo: "uyenne06/RitualCatalog",
    manifests: ["package.json"],
    context: "personal",
    references: ["repo-ritual", "owner-confirmation"],
  },
  {
    slug: "math-util",
    repo: "uyenne06/math-util",
    manifests: ["pom.xml"],
    context: "personal",
    references: ["repo-math-util"],
  },
];

export function findFeaturedProject(slug: string): FeaturedProjectConfig | undefined {
  return FEATURED_PROJECTS.find((project) => project.slug === slug);
}
