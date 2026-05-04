# Sigmafy — agent orientation

This file is loaded into every Claude Code session in this repo. Read it at the
start of every session and follow the protocol below.

## What Sigmafy is

A Six Sigma & Lean SaaS platform built by 2KO Pty Ltd. Six Sigma South Africa
(SSA) is the first live tenant. V1's success is "SSA can run one real Green Belt
cohort end-to-end inside Sigmafy." The full master build plan governs scope,
phases, and rules — treat it as the source of truth.

## At the start of every session

1. `git checkout dev && git pull --rebase origin dev`
2. Read `docs/build-state.md` — what works, what's stubbed, known issues.
3. Read `docs/phase-log.md` — most recent phase and open questions.
4. Identify the active phase. **State the phase before implementing changes.**
5. Run quick health checks relevant to the area you'll touch.

## Branch and commit rules

- All implementation work goes to `dev`. **Never push directly to `main`.**
- Pull latest before every commit too: `git pull --rebase origin dev`.
- Resolve merge conflicts deliberately. If unsure, stop and report the files.
- Never force push. Never `--no-verify`.
- Commit messages: `phase-x: concise description`.

## Phase rules

- Implement only the current approved phase scope.
- Update `docs/phase-log.md` after meaningful changes.
- Keep `docs/build-state.md` in sync with reality.
- Add or update tests for core flows.
- All reusable UI lives in `packages/ui`. Do not style screens ad hoc.
- Do not add out-of-scope features "because they're easy".

## Hard rules from the brief

- **Tenant isolation**: every tenant table has RLS. App code accesses tenant
  data only through `withWorkspace()` from `@sigmafy/db`.
- **Service-role bypass**: only from `apps/admin`, `apps/*\/jobs`, or migration
  scripts, with written justification and an audit-log entry.
- **AI calls**: only through `@sigmafy/ai` (`createAiClient`). Never import
  `@anthropic-ai/sdk` from app code.
- **Billing**: only through `@sigmafy/billing` (`createBillingClient`). Never
  import the Paystack SDK from app code.
- **Stats**: only through `@sigmafy/stats-gateway`. Allowlist additions are a
  code-review event.
- **Trainer/sponsor/admin override of AI feedback** must be the default UX.

## At the end of every phase

Produce a Phase Completion Report (template in `docs/phase-log.md`) that
includes: branch, commits, what was built, checks run, known issues,
recommended next phase, and why. **Never end a phase with just "done".**
Always recommend the next concrete phase.

## Pull-latest workflow

```bash
git status
git checkout dev
git pull --rebase origin dev
pnpm install
pnpm lint
pnpm test
```

Before commit:

```bash
git status
git pull --rebase origin dev
# Resolve conflicts if any
pnpm lint
pnpm test
pnpm build
git add <files>
git commit -m "phase-x: concise description"
git push origin dev
```
