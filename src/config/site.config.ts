/**
 * Static site identity. Values here come from the GitHub profile / profile README
 * (see docs/github-facts.md) or were confirmed by the author; live numbers are
 * fetched from the GitHub API instead of being hard-coded.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  // Vercel exposes the production domain at build time without a protocol.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  url: resolveSiteUrl(),
  githubUsername: process.env.GITHUB_USERNAME ?? "uyenne06",
  /** Not on the GitHub profile; provided by the author (reference: owner-confirmation). */
  linkedinUrl:
    "https://www.linkedin.com/in/nguy%E1%BB%85n-hu%E1%BB%B3nh-ho%C3%A0ng-uy%C3%AAn-7472b5353/",
} as const;
