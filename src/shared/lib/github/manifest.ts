/** Extracts dependency identifiers from dependency manifests fetched as raw text. */

export type ManifestKind = "npm" | "maven";

export function manifestKindFromPath(path: string): ManifestKind | null {
  if (path.endsWith("package.json")) return "npm";
  if (path.endsWith("pom.xml")) return "maven";
  return null;
}

function parsePackageJson(text: string): string[] {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null) return [];
    const record = parsed as Record<string, unknown>;
    const names = new Set<string>();
    for (const field of ["dependencies", "devDependencies"]) {
      const block = record[field];
      if (typeof block === "object" && block !== null) {
        for (const name of Object.keys(block)) names.add(name);
      }
    }
    return [...names];
  } catch {
    return [];
  }
}

function parsePomXml(text: string): string[] {
  // Only <dependency> artifactIds are relevant; a regex is enough for this narrow use.
  const ids = new Set<string>();
  const dependencyPattern =
    /<dependency>[\s\S]*?<artifactId>([^<]+)<\/artifactId>[\s\S]*?<\/dependency>/g;
  for (const match of text.matchAll(dependencyPattern)) {
    const id = match[1]?.trim();
    if (id) ids.add(id);
  }
  return [...ids];
}

export function parseManifest(kind: ManifestKind, text: string): string[] {
  return kind === "npm" ? parsePackageJson(text) : parsePomXml(text);
}
