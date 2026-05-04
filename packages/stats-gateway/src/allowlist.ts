/**
 * Allowlist of stats endpoints that tenant users may invoke through the
 * gateway. Adding an endpoint is intentionally a code-review event.
 *
 * Phase 0A starts with `pareto` only — the smallest endpoint that proves
 * the architecture (request/response shape, gateway logging, RLS-scoped
 * audit log).
 *
 * Phase 1 adds the rest of the V1 allowlist (per the brief §5.2):
 *   histogram, i-mr, xbar-r, cp-cpk, t-test-1sample, t-test-2sample.
 */
export type StatsEndpoint = "pareto";

export const ENDPOINT_ALLOWLIST: ReadonlySet<StatsEndpoint> = new Set<StatsEndpoint>([
  "pareto",
]);

export function isAllowed(endpoint: string): endpoint is StatsEndpoint {
  return (ENDPOINT_ALLOWLIST as ReadonlySet<string>).has(endpoint);
}
