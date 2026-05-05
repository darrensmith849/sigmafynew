# ADR 0006 — Single-branch flow while no live users

- **Status**: ✅ **Superseded** by Phase 1 Slice D.4 reversion (2026-05-05).
  Documented for the historical record.
- **Date opened**: 2026-05-05
- **Date closed**: 2026-05-05 — dev/PR flow reinstated.

## Context

The master build plan §11.1 originally required all implementation work on
`dev` and prohibited direct pushes to `main`. That rule assumes (a) multiple
people pushing concurrently and (b) production traffic on `main` that must be
protected from broken commits.

At Phase 0A close, neither holds:

- 2KO is the only person committing to the repo.
- `main` deploys via Vercel, but there are zero live users — the production
  URL is effectively a staging URL.
- Every dev-then-PR-then-merge cycle adds friction without buying anything.

## Decision

While there are zero live users, push all work directly to `main`. Treat
`main` as the single working branch. The `dev` branch is retired and left
in place as a stale snapshot.

This is a temporary policy. **Reinstate the dev/PR flow before Phase 1
launch** — at that point real SSA delegates start signing in, every commit to
`main` becomes a production deploy with users on it, and the
"single-branch-with-direct-push" risk profile changes overnight.

## Consequences

Positive:
- Less ceremony per change. Faster iteration during 0A close and 0B.
- One source of truth for the working tree.
- No accidental drift between `dev` and `main`.

Negative / risks:
- A bad commit ships straight to the production Vercel deploy.
- No PR-based code review checkpoint.
- Loss of the dev preview channel for sharing in-progress work.

Controls:
- Pre-push lint/typecheck/test/build is mandatory (CLAUDE.md).
- CI runs on every push to `main`; rollback path is `git revert` + push.
- Master build plan §18 risks table tracks this as **Single-branch risk**
  with the Phase-1 reversion gate as control.

## Reversion plan (Phase 1) — ✅ executed in Slice D.4 on 2026-05-05

1. ✅ Recreate `dev` branch from `main`.
2. ✅ Restore PR-required-to-merge-`main` rule in `CLAUDE.md` §11.1
   (master plan + README also updated).
3. ✅ Update `.github/workflows/ci.yml` to run on PRs to `main` + `dev`
   and pushes to both branches.
4. 🟡 Vercel preview deploys from `dev` — Vercel GitHub App connection
   is a 2KO-side click-through (Vercel project settings → Git). Once
   connected, every push to `dev` produces a preview URL and every merge
   to `main` triggers production.
5. ✅ This ADR marked Superseded above.

## Lessons captured

- The single-branch policy saved real time during 0A/0B/most-of-1.
  Approximately 25 commits shipped with no PR ceremony.
- The risk it traded against (broken commit shipping to prod) didn't
  materialise — pre-push `pnpm turbo run lint typecheck test build` was
  enforced via CLAUDE.md and CI; no production-breaking commit reached
  `main`.
- The reversion is cheap because we never deleted `dev` (left as a stale
  snapshot per ADR text). Recreating it is a `git branch dev main` away.
