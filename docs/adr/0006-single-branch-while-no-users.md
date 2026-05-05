# ADR 0006 — Single-branch flow while no live users

- **Status**: Accepted
- **Date**: 2026-05-05

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

## Reversion plan (Phase 1)

Before the SSA pilot:
1. Recreate or unfreeze `dev`.
2. Restore the PR-required-to-merge-`main` rule in CLAUDE.md and §11.1.
3. Update `.github/workflows/ci.yml` to run on PRs to `main` and pushes to
   `dev` (mirrors the original Phase -1 setup).
4. Configure Vercel preview deploys from `dev`.
5. Update this ADR's status from "Accepted" to "Superseded by Phase 1
   reinstatement."
