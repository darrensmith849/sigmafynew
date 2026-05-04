# ADR 0005 — Stats gateway pattern

**Status**: Accepted
**Date**: 2026-05-04

## Context

The Sigmafy stats engine is an existing FastAPI service that exposes many
statistical methods. The brief is explicit: only an allowlisted subset is
callable by tenant users, and tenant users **never** call the stats service
directly. The V1 allowlist is 5–8 methods (Pareto, Histogram, I-MR, X-bar R,
Cp/Cpk, t-tests). The remaining methods may stay deployed but are not
reachable from the product.

## Decision

- All calls to the stats service go through `@sigmafy/stats-gateway` running
  on Vercel.
- `ENDPOINT_ALLOWLIST` is a literal `Set<string>` in
  `packages/stats-gateway/src/allowlist.ts`. Adding an endpoint is intentionally
  a code-review event.
- `createStatsGateway({ baseUrl, signingSecret, auth, logger })` returns
  `{ call(endpoint, init) }`. The implementation:
  1. Rejects non-allowlisted endpoints.
  2. Checks per-workspace × per-endpoint quota (Upstash Redis from Phase 1).
  3. Signs the request with `STATS_API_SIGNING_SECRET` and forwards to the
     FastAPI service.
  4. Logs every call (success, blocked, error) to the audit log.
- App code calls the gateway through Vercel route handlers — never imports the
  stats SDK directly.
- The auto-generated `@sigmafy/stats-client` is consumed only by the gateway,
  never by app code.

## Alternatives considered

- **Direct calls from React Server Components** — easier to write but defeats
  the allowlist purpose; gives client code a path to any stats endpoint.
- **API Gateway-in-front (AWS API Gateway, Cloudflare Worker)** — adds a hop
  with no value Vercel functions can't provide today. Revisit if Vercel-to-Fly
  latency becomes the bottleneck (per the V1 risks register).

## Consequences

- Tenant users get a tightly-scoped surface; new stats methods require explicit
  allowlist + review.
- Latency includes one Vercel hop. Phase 0A measures this; if too slow, an
  edge-deployed gateway is the natural escalation.
- The audit log is mandatory; add `stats_call_log` table in Phase 1 with the
  shape `StatsCallRecord` already defines.
- Apps must enforce the no-direct-import rule. Add an ESLint
  `no-restricted-imports` rule in Phase 0A targeting the `@sigmafy/stats-client`
  package outside `@sigmafy/stats-gateway`.
