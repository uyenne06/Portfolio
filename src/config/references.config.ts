/**
 * Every factual claim on the site cites one of these sources as `[n]`.
 * The order here is the numbering shown on the page.
 * Labels are source identifiers (repo/file paths), so they are not translated.
 */

export type ReferenceKind = "api" | "readme" | "repository" | "author";

export type Reference = {
  id: string;
  label: string;
  kind: ReferenceKind;
  url?: string;
};

export const REFERENCES: readonly Reference[] = [
  {
    id: "github-profile",
    kind: "api",
    label: "GitHub REST API — users/uyenne06",
    url: "https://github.com/uyenne06",
  },
  {
    id: "profile-readme",
    kind: "readme",
    label: "uyenne06/uyenne06 — README.md",
    url: "https://github.com/uyenne06/uyenne06/blob/main/README.md",
  },
  {
    id: "contributions",
    kind: "api",
    label: "GitHub GraphQL API — user.contributionsCollection (last 12 months)",
    url: "https://github.com/uyenne06",
  },
  {
    id: "repo-pegaxus",
    kind: "repository",
    label: "HKBDU/pegaxus-fe — README.md, package.json",
    url: "https://github.com/HKBDU/pegaxus-fe",
  },
  {
    id: "repo-bmt",
    kind: "repository",
    label: "hdyui/BMT_FE, uyenne06/BMT-Landing-Page — app/layout.tsx, package.json",
    url: "https://github.com/uyenne06/BMT-Landing-Page",
  },
  {
    id: "repo-savico",
    kind: "repository",
    label: "kat-minh/savico-ai — README.md, package.json",
    url: "https://github.com/kat-minh/savico-ai",
  },
  {
    id: "repo-meetly",
    kind: "repository",
    label: "HKBDU/Meetly — README.md, frontend/package.json",
    url: "https://github.com/HKBDU/Meetly",
  },
  {
    id: "repo-ritual",
    kind: "repository",
    label: "uyenne06/RitualCatalog — src/features/ritual, .github/workflows",
    url: "https://github.com/uyenne06/RitualCatalog",
  },
  {
    id: "repo-math-util",
    kind: "repository",
    label: "uyenne06/math-util — README.md, pom.xml",
    url: "https://github.com/uyenne06/math-util",
  },
  {
    id: "owner-confirmation",
    kind: "author",
    label: "Confirmed by the author, November 2026 (internship dates, roles, LinkedIn)",
  },
];

export function referenceNumber(id: string): number {
  const index = REFERENCES.findIndex((reference) => reference.id === id);
  if (index === -1) throw new Error(`Unknown reference id: ${id}`);
  return index + 1;
}
