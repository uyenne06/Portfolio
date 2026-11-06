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

/** `symbol` is a two-letter "element" symbol for the periodic-table figure in Methods. */
export type TechEntry = { label: string; group: TechGroup; symbol: string };

/** npm package names (or prefixes ending with "/") and Maven artifactIds. */
const DEPENDENCY_CATALOG: Record<string, TechEntry> = {
  react: { label: "React", group: "frontend", symbol: "Re" },
  next: { label: "Next.js", group: "frontend", symbol: "Nx" },
  vite: { label: "Vite", group: "frontend", symbol: "Vi" },
  "react-router-dom": { label: "React Router", group: "frontend", symbol: "Rr" },
  "@react-three/fiber": { label: "React Three Fiber", group: "frontend", symbol: "Rf" },
  "maplibre-gl": { label: "MapLibre GL", group: "frontend", symbol: "Ml" },

  tailwindcss: { label: "Tailwind CSS", group: "styling", symbol: "Tw" },
  shadcn: { label: "shadcn/ui", group: "styling", symbol: "Sh" },
  "radix-ui": { label: "Radix UI", group: "styling", symbol: "Rx" },
  "@radix-ui/": { label: "Radix UI", group: "styling", symbol: "Rx" },
  "@base-ui/react": { label: "Base UI", group: "styling", symbol: "Bu" },
  "@base-ui-components/react": { label: "Base UI", group: "styling", symbol: "Bu" },
  "class-variance-authority": { label: "CVA", group: "styling", symbol: "Cv" },
  motion: { label: "Motion", group: "styling", symbol: "Mo" },
  "framer-motion": { label: "Motion", group: "styling", symbol: "Mo" },
  gsap: { label: "GSAP", group: "styling", symbol: "Gs" },
  bootstrap: { label: "Bootstrap", group: "styling", symbol: "Bs" },
  antd: { label: "Ant Design", group: "styling", symbol: "Ad" },
  "next-themes": { label: "next-themes", group: "styling", symbol: "Nt" },
  "lucide-react": { label: "Lucide", group: "styling", symbol: "Lu" },

  "@tanstack/react-query": { label: "TanStack Query", group: "data", symbol: "Tq" },
  "@tanstack/react-table": { label: "TanStack Table", group: "data", symbol: "Tt" },
  zustand: { label: "Zustand", group: "data", symbol: "Zu" },
  axios: { label: "Axios", group: "data", symbol: "Ax" },
  zod: { label: "Zod", group: "data", symbol: "Zd" },
  "react-hook-form": { label: "React Hook Form", group: "data", symbol: "Hf" },
  "next-intl": { label: "next-intl", group: "data", symbol: "Ni" },
  "@microsoft/signalr": { label: "SignalR", group: "data", symbol: "Sr" },

  typescript: { label: "TypeScript", group: "tooling", symbol: "Ts" },
  eslint: { label: "ESLint", group: "tooling", symbol: "Es" },
  oxlint: { label: "Oxlint", group: "tooling", symbol: "Ox" },
  prettier: { label: "Prettier", group: "tooling", symbol: "Pr" },
  "@playwright/test": { label: "Playwright", group: "tooling", symbol: "Pw" },
  husky: { label: "Husky", group: "tooling", symbol: "Hu" },
  msw: { label: "MSW", group: "tooling", symbol: "Mw" },
  "junit-jupiter": { label: "JUnit 5", group: "tooling", symbol: "Ju" },
};

/** Repository languages that indicate a layer not visible in npm manifests. */
const LANGUAGE_CATALOG: Record<string, TechEntry> = {
  TypeScript: { label: "TypeScript", group: "tooling", symbol: "Ts" },
  "C#": { label: "C# / .NET", group: "backend", symbol: "Cs" },
  Java: { label: "Java", group: "backend", symbol: "Ja" },
};

const MANIFEST_CATALOG: Record<RepoData["manifestKinds"][number], TechEntry | null> = {
  npm: null,
  maven: { label: "Maven", group: "tooling", symbol: "Mv" },
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
