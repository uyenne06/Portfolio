/**
 * Every factual claim on the site cites one of these sources as `[n]`.
 * The order here is the numbering shown on the page.
 * Labels are source identifiers (repo/file paths), so they are not translated.
 */

export type Reference = {
  id: string;
  label: string;
  url?: string;
};

export const REFERENCES: readonly Reference[] = [
  {
    id: "github-profile",
    label: "GitHub REST API — users/uyenne06",
    url: "https://github.com/uyenne06",
  },
  {
    id: "profile-readme",
    label: "uyenne06/uyenne06 — README.md",
    url: "https://github.com/uyenne06/uyenne06/blob/main/README.md",
  },
  {
    id: "contributions",
    label: "GitHub GraphQL API — user.contributionsCollection (last 12 months)",
    url: "https://github.com/uyenne06",
  },
  {
    id: "repo-pegaxus",
    label: "HKBDU/pegaxus-fe — README.md, package.json",
    url: "https://github.com/HKBDU/pegaxus-fe",
  },
  {
    id: "repo-bmt",
    label: "hdyui/BMT_FE, uyenne06/BMT-Landing-Page — app/layout.tsx, package.json",
    url: "https://github.com/uyenne06/BMT-Landing-Page",
  },
  {
    id: "repo-savico",
    label: "kat-minh/savico-ai — README.md, package.json",
    url: "https://github.com/kat-minh/savico-ai",
  },
  {
    id: "repo-meetly",
    label: "HKBDU/Meetly — README.md, frontend/package.json",
    url: "https://github.com/HKBDU/Meetly",
  },
  {
    id: "repo-ritual",
    label: "uyenne06/RitualCatalog — src/features/ritual, .github/workflows",
    url: "https://github.com/uyenne06/RitualCatalog",
  },
  {
    id: "repo-math-util",
    label: "uyenne06/math-util — README.md, pom.xml",
    url: "https://github.com/uyenne06/math-util",
  },
  {
    id: "owner-confirmation",
    label: "Confirmed by the author, November 2026 (internship dates, roles, LinkedIn)",
  },
];

export function referenceNumber(id: string): number {
  const index = REFERENCES.findIndex((reference) => reference.id === id);
  if (index === -1) throw new Error(`Unknown reference id: ${id}`);
  return index + 1;
}
