# ADR 0010 — Stats Studio: standalone statistics surface beside the SSA pilot

**Status**: Accepted
**Date**: 2026-05-22

## Context

`sigmafynew` ships two product surfaces against the same Python stats engine
(`sigmafy-tools.fly.dev`):

1. **`apps/web` (sigmafy-web)** — the SSA Six-Sigma SaaS. Stats appear inside
   project topics (Pareto, Histogram, I-MR, X-bar/R, Capability, 1-sample t,
   2-sample t). Restricted to a 7-tool allowlist enforced in
   `@sigmafy/stats-gateway`. ADR 0005 set this pattern.
2. **`apps/stats-studio` (NEW, this ADR)** — a standalone "plug-and-play
   statistics app" exposing all 288 Python tools as a self-service catalog,
   deployed at `stats.sigmafy.co`.

The user product brief asks for both surfaces in parallel: SSA continues with
the constrained DMAIC flow, while a wider audience can access the full
statistical catalog without spinning up a project.

## Decision

Add `apps/stats-studio` as a second Next.js app in the monorepo:

- **Workspace-scoped, Clerk-authenticated.** Each user gets a workspace on
  first sign-in (no starter Green Belt project — `apps/web`'s bootstrap
  helper is refactored to take a `createStarterProject` flag).
- **Public marketing at `/`** (no auth); auth-gated app under `/(app)/catalog`,
  `/(app)/t/[slug]`, `/(app)/runs`.
- **Generic catalog-driven UI** that renders any of the 288 tools by reading
  field definitions from the Python `/tools` endpoint. A "Raw JSON" escape
  hatch on every tool page guarantees usability on day one even for tools
  whose schemas the generic form can't render cleanly.
- **Recharts + lazy-loaded Plotly** for chart rendering. Recharts handles the
  common cases (line/bar/scatter); Plotly's ~3 MB bundle ships as an async
  chunk loaded only when needed.
- **`stats_tool_runs` table with RLS**, extending the existing `stats_call_log`
  audit trail via a foreign-key reference (one row per Studio invocation;
  carries input/output JSON plus the Python `X-Request-ID`).

### Allowlist bypass — explicit deviation from ADR 0005 / CLAUDE.md

ADR 0005 established the gateway allowlist pattern (`isAllowed(endpoint)`) and
CLAUDE.md §Hard rules says **"Stats: only through `@sigmafy/stats-gateway`.
Allowlist additions are a code-review event."**

The standalone Studio cannot live inside a 7-tool gate — its product premise is
catalog-wide access. The resolution:

- The **typed `gateway.{pareto,histogram,imr,…}` methods** keep the
  `ENDPOINT_ALLOWLIST` check unchanged. Existing `apps/web` (SSA pilot) code
  paths are untouched — every existing project-topic call still goes through
  the same 7-tool gate.
- A **new `gateway.run(slug, payload)` method** (shipped in commit `8bc0ba7`,
  2026-05-22) bypasses the typed allowlist but still enforces the same
  quota + audit-log pipeline. Studio uses this method exclusively.
- The allowlist therefore continues to perform its original function for the
  DMAIC flow (Phase 1 product-scope guard), while the Studio surface gets the
  catalog-wide access its product brief requires.

This ADR is the "code-review event" that the gateway hard rule requires.
Approved by the product owner (Darren Smith) on 2026-05-22.

## Alternatives considered

- **Expand the typed allowlist to all 288 tools.** Removes the gate entirely,
  including for the SSA pilot path. Rejected — the SSA scope guard
  protects pilot users from a runaway feature surface, and the existing 7
  endpoints have bespoke UI in `apps/web` that doesn't generalise.
- **Build the Studio inside `apps/web` as a parallel route group.**
  Rejected — mixes the SSA tenant model with the standalone offering,
  complicates Vercel deploys, and makes future divergent UX choices
  (pricing, marketing, branding) hard to ship independently.
- **Build the Studio as a third-party consumer of the public API** (no
  Sigmafy auth, no workspace, no `stats_tool_runs`). Rejected — runs are
  valuable lineage we want to keep on-platform; bypassing the gateway
  forfeits the audit log and quota enforcement we already built.

## Consequences

**Positive**

- Two product surfaces, one Python engine, one set of audit/quota/RLS rules.
- Adding a tool to Studio requires zero allowlist changes — Python's `/tools`
  catalog drives everything.
- The SSA pilot's risk posture is unchanged.

**Negative / risks**

- The 7-tool allowlist is no longer a global guard. Operators need to know
  which surface they're looking at when reading the audit log
  (`stats_call_log.endpoint` for SSA path vs Studio's dotted slugs from the
  generic runner).
- Two parallel surfaces inevitably drift in chrome, navigation, and brand. A
  refresh of the shared `@sigmafy/ui` primitives may be needed once both have
  been live long enough to see overlap.
- The `quota.ts` stub at `packages/stats-gateway/src/quota.ts:9` (always
  returns `ok: true`) is now load-bearing. Block the public `stats.sigmafy.co`
  URL until Upstash Redis quota counters land.

## Implementation

See `/Users/darrensmith/.claude/plans/yes-please-write-the-humble-pebble.md`
§ Phase 7 for the full sub-phase breakdown.

## References

- ADR 0003 — RLS from day one
- ADR 0005 — Stats gateway pattern (this ADR explicitly modifies the
  allowlist hard rule for the Studio path only)
- ADR 0006 — Single branch while no users (still in force; Phase 7 lands on
  `main`)
- `/Users/darrensmith/.claude/plans/yes-please-write-the-humble-pebble.md`
  § Phase 7 — sub-phase breakdown and verification.
