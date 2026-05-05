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

/**
 * Histogram request — array of numeric observations.
 * The Fly.io service requires `data.length >= 2`.
 */
export interface HistogramRequest {
  data: number[];
  title?: string | null;
  x_label?: string | null;
  y_label?: string | null;
}

/** The service returns a Plotly figure. We treat it as opaque JSON. */
export interface HistogramResponse {
  figure: unknown;
}

export interface StatsClientError extends Error {
  statusCode: number;
  endpoint: string;
}
