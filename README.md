# Portfolio — Nguyen Huynh Hoang Uyen

Personal portfolio of [@uyenne06](https://github.com/uyenne06), laid out like a research preprint:
numbered sections, figures, and a bracketed citation `[n]` on every fact pointing to the GitHub
source it came from. All content is drawn from the GitHub API (profile, contributions, repositories,
dependency manifests) — see [`docs/github-facts.md`](docs/github-facts.md).

- **Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) ·
  Tailwind CSS v4 · next-intl (`/en`, `/vi`) · next-themes · Motion · React Three Fiber ·
  TanStack Query · Zod
- **Data:** fetched on the server with `GITHUB_TOKEN`, cached for one hour (`'use cache'` +
  `cacheLife('hours')`), with a committed JSON snapshot as fallback.

## Getting started

Requires Node.js ≥ 20.

```bash
npm install
cp .env.example .env.local   # optional: add GITHUB_TOKEN for live data
npm run dev                  # http://localhost:3000 → redirects to /en
```

Without `GITHUB_TOKEN` the site renders from `src/data/github-snapshot.json`.

## Scripts

| Script                     | What it does                                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`              | Development server                                                       |
| `npm run build`            | Production build (prerenders `/en`, `/vi` and every case study)          |
| `npm run start`            | Serve the production build                                               |
| `npm run lint`             | ESLint (`eslint-config-next`)                                            |
| `npm run typecheck`        | Generate route types, then `tsc --noEmit`                                |
| `npm run format`           | Prettier + Tailwind class sorting                                        |
| `npm run sync:github`      | Refresh the committed snapshot from the API (needs `GITHUB_TOKEN`)       |
| `npm run capture:previews` | Screenshot each project's live demo into `public/projects/` (Playwright) |

## Environment variables

| Name                   | Secret | Purpose                                                       |
| ---------------------- | ------ | ------------------------------------------------------------- |
| `GITHUB_TOKEN`         | yes    | Read-only fine-grained token for the GitHub API (server-only) |
| `GITHUB_USERNAME`      | no     | Whose data to show (default `uyenne06`)                       |
| `NEXT_PUBLIC_SITE_URL` | no     | Canonical base URL for metadata, sitemap and Open Graph       |

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — folder structure, data flow, adding a section
- [`docs/github-facts.md`](docs/github-facts.md) — every fact on the site and its source
