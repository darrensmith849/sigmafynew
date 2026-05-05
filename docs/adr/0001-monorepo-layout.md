# ADR 0001 — Monorepo layout (pnpm + Turborepo)

**Status**: Accepted
**Date**: 2026-05-04

## Context

Sigmafy ships at least two Next.js apps (`web`, `admin`), one Python service
(`stats-api`, folded in later), and a growing set of shared TypeScript packages
(`ui`, `auth`, `db`, `billing`, `stats-client`, `stats-gateway`, `ai`, `emails`,
`config`). The brief locks Vercel as the deploy target and assumes multiple
people will work on the repo concurrently.

## Decision

- Single Git repo, pnpm workspace, Turborepo for task orchestration.
- Layout: `apps/*` for runnable apps, `packages/*` for shared libraries.
- Per-app Vercel projects with `Root Directory` pointing into `apps/<name>`.
- Turborepo Remote Cache shared between local, CI, and Vercel.
- ~~All work pushed to `dev`; `main` is release-only with branch protection.~~
  **Superseded 2026-05-05 by ADR 0006**: while there are zero live users, all
  work pushes directly to `main`. Reinstate dev/PR flow before Phase 1.

## Alternatives considered

- **Nx** — more powerful, but heavier ceremony and steeper learning curve. Turbo
  fits the "thin orchestration layer over pnpm scripts" mental model the team
  needs in V1.
- **Polyrepo** — would force shared packages into npm publishing, which is
  premature for a private codebase with a small team.

## Consequences

- All TypeScript dependencies between apps and packages are workspace-relative
  (`workspace:*`), so version drift is impossible.
- Vercel can deploy each app independently while reusing the build cache.
- A new package costs ~15 minutes (config, tsconfig, eslint, README).
- We accept Turborepo as a long-term dependency; its task-graph semantics shape
  how scripts are written across the repo.
