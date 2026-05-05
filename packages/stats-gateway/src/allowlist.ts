/**
 * Allowlist of stats endpoints that tenant users may invoke through the
 * gateway. Adding an endpoint is intentionally a code-review event.
 *
 * Phase 0A started with `pareto` only — the smallest endpoint that proved
 * the architecture (request/response shape, gateway logging, RLS-scoped
 * audit log).
 *
 * Phase 1 expands to the V1 allowlist (master plan §5.2). Slice C.2 adds
 * histogram. C.3 adds the control charts (i-mr, xbar-r). C.4 adds
 * capability + t-tests.
 */
export type StatsEndpoint =
  | "pareto"
  | "histogram";

export const ENDPOINT_ALLOWLIST: ReadonlySet<StatsEndpoint> = new Set<StatsEndpoint>([
  "pareto",
  "histogram",
]);

export function isAllowed(endpoint: string): endpoint is StatsEndpoint {
  return (ENDPOINT_ALLOWLIST as ReadonlySet<string>).has(endpoint);
}
