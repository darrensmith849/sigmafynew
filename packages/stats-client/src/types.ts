import type { components } from "./generated/api";

export type ParetoRequest = components["schemas"]["ParetoRequest"];

/**
 * Server returns a Plotly figure plus computed arrays. The OpenAPI doc types
 * the response as `unknown`, so we declare the shape we actually rely on.
 * (We pull the figure as opaque JSON for now — Phase 0A renders sorted
 * counts + cumulative percent in the UI, not the Plotly chart.)
 */
export interface ParetoResponse {
  total: number;
  labels_sorted: string[];
  counts_sorted: number[];
  cumulative_percent: number[];
  figure?: unknown;
}

export interface StatsClientError extends Error {
  statusCode: number;
  endpoint: string;
}
