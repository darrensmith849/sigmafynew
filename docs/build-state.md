# Build State

Source-of-truth snapshot of where the build is right now. Update this after
every meaningful implementation session.

## Current phase

**Phase -1 — Empty Repo Bootstrap**: complete (pending verification run).

**Next phase**: Phase 0A — Architecture Proof.

## What works

- Monorepo (pnpm workspace + Turborepo) installs and resolves cleanly.
- Both Next.js 15 apps boot to placeholder pages with shared `@sigmafy/ui` styling:
  - `apps/web` on port 3000 — marketing at `/`, dashboard at `/dashboard`.
  - `apps/admin` on port 3001 — single placeholder page.
- All 9 packages compile under TypeScript strict + `noUncheckedIndexedAccess`.
- Tailwind 4 with shared preset and CSS-variable tokens (Sigmafy blue + neutral ramp).
- `packages/db` has the Neon serverless client wired (no real DB yet) and the
  RLS-first contracts (`withWorkspace`, `WorkspaceScopedRepository`,
  `service-role` audit banner) in place as signatures.
- `packages/stats-gateway` has the empty allowlist + gateway skeleton.
- `packages/ai`, `packages/billing`, `packages/emails` have provider abstractions
  with shell adapters that throw `"not implemented in Phase -1"`.
- CI workflow runs `lint`, `typecheck`, `test`, `build` on PRs to `dev`/`main`
  and pushes to `dev`, with concurrency cancellation and Turbo Remote Cache.

## What's stubbed

Every runtime adapter throws `"not implemented in Phase -1"` until wired:

- `@sigmafy/auth` — `getCurrentUser()`, `requireAuthContext()`.
- `@sigmafy/db` — `withWorkspace()` (Neon client itself works).
- `@sigmafy/billing` — every Paystack adapter method.
- `@sigmafy/ai` — Claude `complete()` / `stream()`.
- `@sigmafy/emails` — `sendEmail()`.
- `@sigmafy/stats-gateway` — `call()` after the allowlist + quota check.

## Known issues / deferred items

- Vercel projects (`sigmafy-web`, `sigmafy-admin`) must be created manually in
  the Vercel dashboard. See `docs/environment-setup.md` §4.
- `TURBO_TOKEN` (secret) and `TURBO_TEAM` (variable) must be added manually to
  the GitHub repo for Remote Cache to work.
- Playwright is not in CI yet — added in Phase 0 once routes are real.
- No actual database, AI, billing, or email services are wired. Real env values
  are not committed and not required to build.
- `apps/stats-api` is a placeholder; the existing FastAPI service folds in
  during Phase 0A.

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

All commands must exit 0 (or render the expected placeholder page in the case
of `dev`).
