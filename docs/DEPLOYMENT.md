# Deployment (Vercel)

The site deploys to Vercel straight from GitHub. Vercel's Git integration is the CI/CD: every push
to `main` builds and ships production, every other branch or pull request gets its own preview URL.
No workflow file is required.

## 1. Create a read-only GitHub token

The token is optional — without it the site renders from the committed snapshot — but with it the
data refreshes every hour.

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens →
   Generate new token**.
2. **Name:** `portfolio-vercel`. **Expiration:** 90 days (or a custom date; set a reminder to
   rotate it).
3. **Resource owner:** your account. **Repository access:** **Public repositories (read-only)**.
4. **Permissions:** leave everything at _No access_. Public repository data, the profile and the
   contribution calendar are readable without extra scopes.
5. **Generate token** and copy it once (GitHub will not show it again). Never commit it or paste
   it into a file other than `.env.local`.

## 2. Import the repository into Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub (Hobby plan is fine for a personal
   portfolio).
2. **Add New… → Project → Import Git Repository.** If `Portfolio` is not listed, choose
   **Adjust GitHub App Permissions** and grant access to `uyenne06/Portfolio` only.
3. **Framework Preset:** Next.js (auto-detected). **Root Directory:** `./`.
   Build command, output directory and install command: keep the defaults.

## 3. Environment variables

Add them in the import screen (or later in **Project → Settings → Environment Variables**).

| Name                   | Value                          | Secret | Environments        |
| ---------------------- | ------------------------------ | ------ | ------------------- |
| `GITHUB_TOKEN`         | the token from step 1          | yes    | Production, Preview |
| `GITHUB_USERNAME`      | `uyenne06`                     | no     | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>` (opt.) | no     | Production          |

- `GITHUB_TOKEN` is read only on the server; it must never get a `NEXT_PUBLIC_` prefix.
- `NEXT_PUBLIC_SITE_URL` can be left empty: the app falls back to Vercel's production domain
  (`VERCEL_PROJECT_PRODUCTION_URL`). Set it when you add a custom domain. `NEXT_PUBLIC_*` values
  are baked in at build time, so changing one needs a redeploy.
- The list matches [`.env.example`](../.env.example).

## 4. Deploy, redeploy, refresh

- **Deploy:** click **Deploy**. The first build takes about a minute; the URL looks like
  `https://<project>.vercel.app` and redirects `/` to `/en`.
- **After changing an environment variable:** **Deployments → ⋯ on the latest → Redeploy**
  (variables apply only to new builds).
- **Data refresh:** pages are prerendered and revalidated at most once an hour
  (`cacheLife('hours')`). To refresh the committed fallback, run `npm run sync:github` locally
  and push.
- **Custom domain (optional):** **Project → Settings → Domains → Add**, follow the DNS
  instructions, then set `NEXT_PUBLIC_SITE_URL` and redeploy.

## 5. Security notes

- **What runs on a server:** Next.js server rendering and the locale proxy. There is no API
  route; every page is prerendered and served from Vercel's CDN, so a flood of requests hits
  cached files, never GitHub — at most one GitHub refresh per hour, whatever the traffic.
- **Secrets:** only `GITHUB_TOKEN`, read-only, scoped to public repositories, with an expiry.
- **Headers:** `next.config.ts` sets anti-clickjacking (`frame-ancestors 'none'`,
  `X-Frame-Options`), `nosniff`, a strict referrer policy and a restrictive `Permissions-Policy`.
  Vercel adds HTTPS and HSTS.
- **DDoS:** Vercel mitigates network- and application-level floods automatically on every plan.
  If the site is ever targeted, enable **Firewall → Attack Challenge Mode** in the project.
  On the Hobby plan, exceeding the free usage pauses the project rather than billing you.

## 6. Troubleshooting

| Symptom                                      | Likely cause / fix                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| Site shows "Snapshot data from …" in Results | `GITHUB_TOKEN` missing, expired or wrong → update it and redeploy             |
| Build log: `GitHub GraphQL responded 401`    | Token expired/revoked; the build still succeeds from the snapshot — rotate it |
| Build log: GraphQL `rate limit` errors       | Too many builds in an hour; wait or rely on the snapshot (build won't fail)   |
| Wrong URLs in sitemap / Open Graph           | Set `NEXT_PUBLIC_SITE_URL` to the real domain and redeploy                    |
| Build fails on type or lint errors           | Run `npm run typecheck && npm run lint && npm run build` locally, fix, push   |
| Push to `main` did not deploy                | Vercel GitHub App lacks access to the repo → Adjust GitHub App Permissions    |
