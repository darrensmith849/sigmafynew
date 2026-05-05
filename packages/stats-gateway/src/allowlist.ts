/**
 * Allowlist of stats endpoints that tenant users may invoke through the
 * gateway. Adding an endpoint is intentionally a code-review event.
 *
 * Phase 0A: pareto.
 * Phase 1 Slice C.2: histogram.
 * Phase 1 Slice C.3: imr-chart, xbar-r-chart.
 * Phase 1 Slice C.4: capability, one-sample-t, two-sample-t — completes the
 *                    V1 allowlist (master plan §5.2).
 */
export type StatsEndpoint =
  | "pareto"
  | "histogram"
  | "imr-chart"
  | "xbar-r-chart"
  | "capability"
  | "one-sample-t"
  | "two-sample-t";

export const ENDPOINT_ALLOWLIST: ReadonlySet<StatsEndpoint> = new Set<StatsEndpoint>([
  "pareto",
  "histogram",
  "imr-chart",
  "xbar-r-chart",
  "capability",
  "one-sample-t",
  "two-sample-t",
]);

export function isAllowed(endpoint: string): endpoint is StatsEndpoint {
  return (ENDPOINT_ALLOWLIST as ReadonlySet<string>).has(endpoint);
}
