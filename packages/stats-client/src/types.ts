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

/** I-MR (Individuals + Moving Range) control chart. */
export interface IMRRequest {
  data: number[];
}

export interface IMRControlChart {
  data: Array<number | null>;
  center_line: number;
  ucl: number;
  lcl: number;
  sigma?: number;
}

export interface IMRResponse {
  individuals: IMRControlChart;
  moving_range: IMRControlChart;
  nelson_rules?: unknown;
  n_observations: number;
}

/** X-bar / R chart on equal-sized subgroups. */
export interface XbarRRequest {
  subgroups: number[][];
}

export interface XbarRControlChart {
  data: number[];
  center_line: number;
  ucl: number;
  lcl: number;
}

export interface XbarRResponse {
  x_bar: XbarRControlChart;
  r_chart: XbarRControlChart;
  nelson_rules?: unknown;
  subgroup_size: number;
  n_subgroups: number;
}

export interface StatsClientError extends Error {
  statusCode: number;
  endpoint: string;
}
