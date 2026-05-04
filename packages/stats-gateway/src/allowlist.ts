/**
 * Allowlist of stats endpoints that tenant users may invoke through the
 * gateway.
 *
 * Anything not in this set is rejected before the request leaves Vercel,
 * regardless of what the FastAPI service exposes. Adding an endpoint is
 * intentionally a code-review event.
 *
 * Phase -1: empty. Phase 1 starts with the V1 allowlist (Pareto, Histogram,
 * I-MR, X-bar R, Cp/Cpk, 1-sample t-test, 2-sample t-test).
 */
export const ENDPOINT_ALLOWLIST: ReadonlySet<string> = new Set<string>();

export function isAllowed(endpoint: string): boolean {
  return ENDPOINT_ALLOWLIST.has(endpoint);
}
