# @sigmafy/stats-gateway

Server-side gateway between Vercel and the FastAPI stats service. Enforces:

- **Endpoint allowlist** — only stats methods listed in `ENDPOINT_ALLOWLIST` may
  be invoked. Anything else is rejected before the request leaves Vercel.
- **Workspace context** — the calling workspace and user are part of the
  signed request to the stats service.
- **Per-workspace quota** — counted in Upstash Redis (Phase 1).
- **Audit log** — every call (success, blocked, error) is recorded.

Tenant users **never** call the stats service directly. They go through Vercel
route handlers which call the gateway.

## Phase -1

Signature-only. Allowlist is empty. `createStatsGateway().call()` runs the
allowlist + quota checks and then throws `"not implemented in Phase -1"`.

## Phase 1

Add the V1 stats allowlist to `allowlist.ts`:

- `pareto`
- `histogram`
- `i-mr`
- `xbar-r`
- `cp-cpk`
- `t-test-1sample`
- `t-test-2sample`
