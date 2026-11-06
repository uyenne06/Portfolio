/**
 * Captures a screenshot of each featured project's live demo into `public/projects/<slug>.jpg`.
 * These are the only images of the projects on the site, so they show the real product.
 *
 *   npx playwright install chromium   (once)
 *   npm run capture:previews
 *
 * Projects without a demo (or whose demo fails to load) are skipped; add an image by hand
 * in that case, e.g. a screenshot that the repository itself publishes.
 */

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

import snapshot from "../src/data/github-snapshot.json";
import { FEATURED_PROJECTS } from "../src/config/featured-projects.config";

const OUT_DIR = resolve(process.cwd(), "public/projects");
const VIEWPORT = { width: 1440, height: 900 };

type SnapshotRepo = { homepageUrl: string | null };

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const repos = snapshot.repos as Record<string, SnapshotRepo>;

  const only = process.argv[2];
  for (const project of FEATURED_PROJECTS.filter((p) => !only || p.slug === only)) {
    const url = project.previewUrl ?? project.demoUrl ?? repos[project.repo]?.homepageUrl;
    if (!url) {
      console.log(`- ${project.slug}: no demo URL, skipped`);
      continue;
    }
    const page = await browser.newPage({ viewport: VIEWPORT, colorScheme: "light" });
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      await page.waitForTimeout(2_500);
      const path = resolve(OUT_DIR, `${project.slug}.jpg`);
      await page.screenshot({ path, type: "jpeg", quality: 82 });
      console.log(`✓ ${project.slug}: ${url} → ${path}`);
    } catch (error) {
      console.warn(`✗ ${project.slug}: ${url} failed (${(error as Error).message.split("\n")[0]})`);
    } finally {
      await page.close();
    }
  }
  await browser.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
