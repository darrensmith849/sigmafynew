# Environment Setup

This document walks a fresh contributor (or a fresh AI session) from a clean
checkout to a running `apps/web` and `apps/admin`.

## 1. Prerequisites

| Tool | Version | How |
|---|---|---|
| Node.js | 22 LTS | `nvm install 22 && nvm use` (the repo has a `.nvmrc`) |
| pnpm | 10.x | `corepack enable && corepack prepare pnpm@10.15.0 --activate` |
| Vercel CLI | latest | `npm i -g vercel` (used for `vercel build` parity, not required for local dev) |
| GitHub CLI | latest | `brew install gh` |
| Playwright browsers | bundled | `pnpm --filter @sigmafy/web exec playwright install` (only if you'll run e2e) |

## 2. First-time setup

```bash
git clone <repo-url> sigmafynew
cd sigmafynew
git checkout dev
nvm use
corepack enable
pnpm install --frozen-lockfile
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
# Fill in real values from the secret store. Phase -1 throws "not implemented"
# at runtime so empty values are fine for build/lint/typecheck/test.
```

## 3. Required environment variables

All variables are documented in the per-app `.env.example` files. Summary:

| Variable | Scope | Required at | Notes |
|---|---|---|---|
| `DATABASE_URL` | web, admin | runtime | Neon connection string for the workspace role. |
| `DATABASE_URL_SERVICE` | web, admin | runtime | Neon connection string for the audited service role. |
| `CLERK_PUBLISHABLE_KEY` | web, admin | build + runtime | From Clerk dashboard. |
| `CLERK_SECRET_KEY` | web, admin | runtime | From Clerk dashboard. |
| `ANTHROPIC_API_KEY` | web | runtime | From Anthropic console. |
| `AI_PROVIDER` | web | runtime | Defaults to `claude`. |
| `BILLING_PROVIDER` | web | runtime | Defaults to `paystack`. |
| `PAYSTACK_SECRET_KEY` | web | runtime | From Paystack dashboard. |
| `PAYSTACK_PUBLIC_KEY` | web | build + runtime | From Paystack dashboard. |
| `RESEND_API_KEY` | web | runtime | From Resend dashboard. |
| `EMAIL_FROM` | web | runtime | e.g. `no-reply@sigmafy.co`. |
| `UPSTASH_REDIS_REST_URL` | web | runtime | Upstash Redis (Phase 1+). |
| `UPSTASH_REDIS_REST_TOKEN` | web | runtime | Upstash Redis (Phase 1+). |
| `INNGEST_EVENT_KEY` | web | runtime | Inngest events (Phase 0B+). |
| `INNGEST_SIGNING_KEY` | web | runtime | Inngest signing (Phase 0B+). |
| `BLOB_READ_WRITE_TOKEN` | web | runtime | Vercel Blob (Phase 1+). |
| `PUSHER_APP_ID` | web | runtime | Pusher Channels (Phase 1+). |
| `PUSHER_KEY` | web | build + runtime | Pusher Channels (Phase 1+). |
| `PUSHER_SECRET` | web | runtime | Pusher Channels (Phase 1+). |
| `PUSHER_CLUSTER` | web | runtime | Pusher Channels (Phase 1+). |
| `STATS_API_BASE_URL` | web | runtime | URL of the FastAPI stats service. |
| `STATS_API_SIGNING_SECRET` | web | runtime | Shared HMAC secret with the stats service. |
| `SENTRY_DSN` | web, admin | runtime | Sentry project DSN (Phase 0+). |
| `NEXT_PUBLIC_POSTHOG_KEY` | web | build + runtime | PostHog project key. |
| `NEXT_PUBLIC_POSTHOG_HOST` | web | build + runtime | e.g. `https://eu.i.posthog.com`. |

GitHub Actions also needs:

| Variable | Type | Where |
|---|---|---|
| `TURBO_TOKEN` | secret | Vercel-issued Turbo Remote Cache token. |
| `TURBO_TEAM` | variable | Vercel team slug. |

## 4. Vercel project setup

Two Vercel projects share the monorepo. Each is created **manually in the
Vercel dashboard** by 2KO — Phase -1 does not provision them.

### sigmafy-web

| Setting | Value |
|---|---|
| Repo | this repo |
| Production branch | `main` |
| Preview branches | `dev` (and PR branches) |
| Root Directory | `apps/web` |
| Framework Preset | Next.js |
| Install Command | `cd ../.. && pnpm install --frozen-lockfile` |
| Build Command | `cd ../.. && pnpm turbo run build --filter=@sigmafy/web...` |
| Output Directory | `.next` |
| Node version | 22.x |
| Ignored Build Step | `npx turbo-ignore @sigmafy/web` |

Add all `apps/web/.env.example` keys as Vercel project env vars (Production +
Preview).

### sigmafy-admin

Same as `sigmafy-web` with `web` → `admin` everywhere. Use only the keys from
`apps/admin/.env.example`.

### Remote cache

After creating the projects, link Turborepo to Vercel's Remote Cache so CI and
Vercel builds share artefacts:

```bash
pnpm dlx turbo login
pnpm dlx turbo link
```

Copy `TURBO_TOKEN` and `TURBO_TEAM` into the GitHub repo secrets/variables.

## 5. Local development

```bash
# Run both apps in parallel
pnpm dev

# Or per-app
pnpm --filter @sigmafy/web dev      # http://localhost:3000
pnpm --filter @sigmafy/admin dev    # http://localhost:3001
```

## 6. Database

```bash
# Generate migrations from schema (Phase 0A onwards)
pnpm db:generate

# Apply migrations against DATABASE_URL
pnpm db:migrate
```

In Neon, create one project for Sigmafy, then a database branch per developer
and one for `dev`/`main` previews/production.

## 7. Troubleshooting

- **`Cannot find module '@sigmafy/...'`** — run `pnpm install` from the repo
  root; never inside a single workspace directory.
- **`Invalid hook call` in apps/web** — confirm React versions match across
  packages (`pnpm why react`); workspace `peerDependencies` should pin `^19`.
- **Turbo rebuilds everything every time** — your `.turbo/` cache may be
  corrupted. `rm -rf .turbo` and re-run.
- **Vercel build can't find `pnpm`** — confirm Node version is 22.x in the
  Vercel project settings; Corepack ships with Node 22.
