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
git checkout main
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
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | web, admin | build + runtime | From Clerk dashboard → API keys. The `NEXT_PUBLIC_` prefix is required so Clerk's client SDK can read it. |
| `CLERK_SECRET_KEY` | web, admin | runtime | From Clerk dashboard → API keys (server-side only). |
| `OPENAI_API_KEY` | web | runtime | From OpenAI platform dashboard. |
| `AI_PROVIDER` | web | runtime | Defaults to `openai`. |
| `BILLING_PROVIDER` | web | runtime | Defaults to `paystack`. |
| `PAYSTACK_SECRET_KEY` | web | runtime | From Paystack dashboard. |
| `PAYSTACK_PUBLIC_KEY` | web | build + runtime | From Paystack dashboard. |
| `BREVO_API_KEY` | web | runtime | From Brevo (formerly Sendinblue) dashboard → SMTP & API. Sender domain must be DNS-verified before first send. |
| `EMAIL_FROM` | web | runtime | e.g. `no-reply@sigmafy.co`. Must match a Brevo-verified sender. |
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
| Preview branches | PR branches only — `dev` is retired (ADR 0006). |
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

There are **two flavours** of migration in this repo. Use the matching command
for each — mixing them up will either fail or leak privileges.

### 6a. Schema migrations (Drizzle Kit, journaled)

`CREATE TABLE`, `ADD COLUMN`, FK changes — anything Drizzle Kit can derive
from a schema diff. Tracked in `packages/db/migrations/meta/_journal.json`.

```bash
# Generate from packages/db/src/schema/*.ts
pnpm db:generate

# Apply via Drizzle Kit
DATABASE_URL=<service-role connection string> pnpm db:migrate
```

Note: `pnpm db:migrate` runs through Turbo. `DATABASE_URL` must be exported in
the calling shell because Turbo only passes env vars listed in `turbo.json`'s
`globalEnv`. The Drizzle config reads it directly.

### 6b. Hand-written RLS migrations (this repo's convention)

`ENABLE ROW LEVEL SECURITY`, `CREATE POLICY`, role grants — anything Drizzle
Kit can't derive from a schema. These ship as numbered `.sql` files alongside
the Drizzle ones (0001, 0005, 0007, 0009, 0010, …) and are applied
out-of-band via the helper script:

```bash
cd packages/db
export DATABASE_URL=<service-role connection string>
pnpm exec tsx scripts/apply-migration.ts 0010_phase_7_stats_tool_runs.sql
```

The script reads the SQL file, executes it through the Neon serverless
driver as the service role, and prints a verification line for every table
the migration touched (RLS status + policy list). Migrations must use
`IF NOT EXISTS` / `DROP POLICY IF EXISTS` so re-runs are safe.

**Always use the service-role URL** (typically `DATABASE_URL_SERVICE` from
`apps/web/.env.local`). The non-bypass `app_user` doesn't have DDL or GRANT
privileges.

### Neon branching

Create one project for Sigmafy, then a database branch per developer
and one for `main` (production). Reinstate a separate `dev` branch when the
dev/PR flow is reinstated before Phase 1 (ADR 0006).

## 7. Troubleshooting

- **`Cannot find module '@sigmafy/...'`** — run `pnpm install` from the repo
  root; never inside a single workspace directory.
- **`Invalid hook call` in apps/web** — confirm React versions match across
  packages (`pnpm why react`); workspace `peerDependencies` should pin `^19`.
- **Turbo rebuilds everything every time** — your `.turbo/` cache may be
  corrupted. `rm -rf .turbo` and re-run.
- **Vercel build can't find `pnpm`** — confirm Node version is 22.x in the
  Vercel project settings; Corepack ships with Node 22.
