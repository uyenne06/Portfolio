/**
 * Regenerates `src/data/github-snapshot.json` from the live GitHub API.
 *
 * The snapshot is committed so `next build` works without a token or when the API
 * is rate-limited. Run it whenever you want the fallback data refreshed:
 *
 *   GITHUB_TOKEN=... npm run sync:github
 *   (or put GITHUB_TOKEN in .env.local)
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { FEATURED_PROJECTS } from "../src/config/featured-projects.config";
import { fetchGitHubData } from "../src/shared/lib/github/fetch-github-data";

const SNAPSHOT_PATH = resolve(process.cwd(), "src/data/github-snapshot.json");

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const login = process.env.GITHUB_USERNAME?.trim() || "uyenne06";

  if (!token) {
    console.error("GITHUB_TOKEN is not set. Add it to .env.local or the environment.");
    process.exitCode = 1;
    return;
  }

  const data = await fetchGitHubData({ token, login, projects: FEATURED_PROJECTS });
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  const missing = FEATURED_PROJECTS.filter((project) => !data.repos[project.repo]);
  console.log(`Snapshot written to ${SNAPSHOT_PATH}`);
  console.log(
    `  contributions: ${data.contributions.total}, repos: ${Object.keys(data.repos).length}`,
  );
  if (missing.length) {
    console.warn(`  missing repos: ${missing.map((project) => project.repo).join(", ")}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
