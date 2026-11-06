import type { RepoData } from "@/shared/lib/github";

/**
 * Maps raw dependency names / repository languages to display labels and layers.
 * Only identifiers listed here are shown, so the stack reflects real manifests
 * without surfacing every transitive helper package.
 */

export type TechGroup = "frontend" | "styling" | "data" | "backend" | "tooling";

export const TECH_GROUP_ORDER: readonly TechGroup[] = [
  "frontend",
  "styling",
  "data",
  "backend",
  "tooling",
];

type TechEntry = { label: string; group: TechGroup };

/** npm package names (or prefixes ending with "/") and Maven artifactIds. */
const DEPENDENCY_CATALOG: Record<string, TechEntry> = {
  react: { label: "React", group: "frontend" },
  next: { label: "Next.js", group: "frontend" },
  vite: { label: "Vite", group: "frontend" },
  "react-router-dom": { label: "React Router", group: "frontend" },
  "@react-three/fiber": { label: "React Three Fiber", group: "frontend" },
  "maplibre-gl": { label: "MapLibre GL", group: "frontend" },

  tailwindcss: { label: "Tailwind CSS", group: "styling" },
  shadcn: { label: "shadcn/ui", group: "styling" },
  "radix-ui": { label: "Radix UI", group: "styling" },
  "@radix-ui/": { label: "Radix UI", group: "styling" },
  "@base-ui/react": { label: "Base UI", group: "styling" },
  "@base-ui-components/react": { label: "Base UI", group: "styling" },
  "class-variance-authority": { label: "CVA", group: "styling" },
  motion: { label: "Motion", group: "styling" },
  "framer-motion": { label: "Motion", group: "styling" },
  gsap: { label: "GSAP", group: "styling" },
  bootstrap: { label: "Bootstrap", group: "styling" },
  antd: { label: "Ant Design", group: "styling" },
  "next-themes": { label: "next-themes", group: "styling" },
  "lucide-react": { label: "Lucide", group: "styling" },

  "@tanstack/react-query": { label: "TanStack Query", group: "data" },
  "@tanstack/react-table": { label: "TanStack Table", group: "data" },
  zustand: { label: "Zustand", group: "data" },
  axios: { label: "Axios", group: "data" },
  zod: { label: "Zod", group: "data" },
  "react-hook-form": { label: "React Hook Form", group: "data" },
  "next-intl": { label: "next-intl", group: "data" },
  "@microsoft/signalr": { label: "SignalR", group: "data" },

  typescript: { label: "TypeScript", group: "tooling" },
  eslint: { label: "ESLint", group: "tooling" },
  oxlint: { label: "Oxlint", group: "tooling" },
  prettier: { label: "Prettier", group: "tooling" },
  "@playwright/test": { label: "Playwright", group: "tooling" },
  husky: { label: "Husky", group: "tooling" },
  msw: { label: "MSW", group: "tooling" },
  "junit-jupiter": { label: "JUnit 5", group: "tooling" },
};

/** Repository languages that indicate a layer not visible in npm manifests. */
const LANGUAGE_CATALOG: Record<string, TechEntry> = {
  TypeScript: { label: "TypeScript", group: "tooling" },
  "C#": { label: "C# / .NET", group: "backend" },
  Java: { label: "Java", group: "backend" },
};

const MANIFEST_CATALOG: Record<RepoData["manifestKinds"][number], TechEntry | null> = {
  npm: null,
  maven: { label: "Maven", group: "tooling" },
};

function lookupDependency(name: string): TechEntry | undefined {
  const exact = DEPENDENCY_CATALOG[name];
  if (exact) return exact;
  const prefix = Object.keys(DEPENDENCY_CATALOG).find(
    (key) => key.endsWith("/") && name.startsWith(key),
  );
  return prefix ? DEPENDENCY_CATALOG[prefix] : undefined;
}

/** All recognised technologies used by one repository, de-duplicated by label. */
export function technologiesOf(repo: RepoData): TechEntry[] {
  const found = new Map<string, TechEntry>();
  const add = (entry: TechEntry | null | undefined) => {
    if (entry && !found.has(entry.label)) found.set(entry.label, entry);
  };

  repo.dependencies.forEach((name) => add(lookupDependency(name)));
  // Languages need a meaningful share to count (ignores a stray script file).
  const total = repo.languages.reduce((sum, language) => sum + language.size, 0) || 1;
  repo.languages
    .filter((language) => language.size / total >= 0.02)
    .forEach((language) => add(LANGUAGE_CATALOG[language.name]));
  repo.manifestKinds.forEach((kind) => add(MANIFEST_CATALOG[kind]));

  return [...found.values()];
}
