# Build State

Source-of-truth snapshot of where the build is right now. Update this after
every meaningful implementation session.

## Current phase

**Phase 0A — Architecture Proof**: code complete on `main` (commit `13ca4ab`,
merged via `ef637d3`). **Pending live signup verification with Clerk keys**
before the Phase 0A Completion Report can be written.

**Next phase after 0A close**: Phase 0B — Product Proof.

## Direction shifts (2026-05-05)

- **Branch flow**: `dev` retired while there are zero live users. All work
  pushes directly to `main`. Reverts to dev/PR flow before Phase 1 SSA pilot
  (ADR 0006).
- **AI provider**: default adapter swapped from Anthropic Claude to OpenAI in
  `@sigmafy/ai` (ADR 0007). Abstraction surface unchanged.
- **Email provider**: default adapter swapped from Resend to Brevo in
  `@sigmafy/emails` (ADR 0008). React Email components retained.

## What works

- Phase -1 monorepo + Phase 0A architecture all green: 24/24 turbo tasks
  pass on `pnpm turbo run lint typecheck test build`.
- **DB & RLS** — provably sound. 4/4 integration tests on live Neon:
  no-context fail-closed, per-tenant scoping, cross-tenant insert rejection,
  malformed UUID rejection. Real schema (workspaces, users, memberships,
  projects, project_templates, topic_solutions, stats_call_log, audit_log)
  with RLS policies. `app_user` Postgres role has no BYPASSRLS;
  `withWorkspace(db, ws, fn)` is the only sanctioned data seam.
- **Stats gateway** — Pareto allowlisted; 2/2 integration tests against
  live Fly.io. Type-system blocks calls to non-allowlisted endpoints.
  `createDbStatsLogger` persists every call into `stats_call_log` under the
  workspace context.
- **Auth** — `@sigmafy/auth` wraps Clerk (Next 15). `bootstrapUserAndWorkspace`
  creates user + personal workspace + owner membership + starter Green Belt
  project on first login (idempotent, audited service-role usage).
- **DMAIC UI** — marketing landing, sign-in/sign-up via Clerk components,
  `/dashboard` lists projects RLS-scoped, `/projects/[id]` with phase nav and
  three topic kinds wired (Charter view, SIPOC editor + save, Pareto form +
  gateway call + result table).
- Both Next.js 15 apps boot to placeholder pages with shared `@sigmafy/ui`.
  - `apps/web` on port 3000 — marketing at `/`, dashboard at `/dashboard`.
  - `apps/admin` on port 3001 — single placeholder page.
- Tailwind 4 with shared preset and CSS-variable tokens (Sigmafy blue + neutral ramp).
- CI workflow runs `lint`, `typecheck`, `test`, `build` on PRs and pushes to
  `main`, with concurrency cancellation and Turbo Remote Cache.

## What's stubbed (fails loudly)

- `@sigmafy/billing` — every Paystack adapter method throws.
- `@sigmafy/ai` — OpenAI adapter complete/stream throw "not wired in 0A"
  (lands in Phase 0B).
- `@sigmafy/emails` — `sendEmail()` throws "not wired in 0A" (Brevo lands
  in Phase 0B).

## Live deployments

| App | Project | URL | Status |
|---|---|---|---|
| web | `pumpbots-projects/sigmafy-web` | https://web-seven-gold-84.vercel.app | Production |
| admin | `pumpbots-projects/sigmafy-admin` | https://sigmafy-admin.vercel.app | Production |

After the direction-shift commit pushes to `main`, both Vercel projects
auto-deploy production. Phase-0a app routes are wired but signup will return
401 until Clerk keys are populated in Vercel project envs.

## Known issues / deferred items

- **Pending Clerk keys** to seal Phase 0A: live signup → SIPOC submit →
  Pareto run on the production URL.
- **Single-branch risk**: every commit to `main` ships to production. Fine
  for now (no users), but reinstate dev/PR flow before Phase 1 (ADR 0006).
- `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable) must be added manually
  to the GitHub repo for Remote Cache to work.
- Playwright is not in CI yet — added in Phase 0B once routes are real and
  signup is verified.
- `apps/stats-api` is a placeholder; the existing FastAPI service stays on
  Fly.io and is consumed by `@sigmafy/stats-gateway`.

## How to verify locally

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
pnpm --filter @sigmafy/web dev      # visit http://localhost:3000
pnpm --filter @sigmafy/admin dev    # visit http://localhost:3001
vercel build --cwd apps/web         # parity with Vercel deploy
vercel build --cwd apps/admin
```

All commands must exit 0.
