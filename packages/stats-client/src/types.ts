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

/** Capability analysis (Cp / Cpk / Pp / Ppk). */
export interface CapabilityRequest {
  data: number[];
  lsl?: number | null;
  usl?: number | null;
  subgroup_size?: number;
}

export interface CapabilityResponse {
  n: number;
  mean: number;
  std_within: number;
  std_overall: number;
  cp: number | null;
  cpk: number | null;
  cpu: number | null;
  cpl: number | null;
  pp: number | null;
  ppk: number | null;
  ppu: number | null;
  ppl: number | null;
  yield_percent: number;
  ppm: number;
  z_upper: number | null;
  z_lower: number | null;
}

/** 1-sample t-test. */
export interface OneSampleTRequest {
  data: number[];
  hypothesized_mean: number;
  alternative?: "two-sided" | "less" | "greater";
}

export interface OneSampleTResponse {
  test: string;
  t_statistic: number;
  p_value: number;
  df: number;
  mean: number;
  hypothesized_mean: number;
  alternative: string;
  ci_95: [number, number];
  n: number;
  std_dev: number;
  se_mean: number;
}

/** 2-sample t-test. */
export interface TwoSampleTRequest {
  data1: number[];
  data2: number[];
  equal_var?: boolean;
  alternative?: "two-sided" | "less" | "greater";
}

export interface TwoSampleTResponse {
  test: string;
  t_statistic: number;
  p_value: number;
  mean_1: number;
  mean_2: number;
  difference: number;
  std_1: number;
  std_2: number;
  n_1: number;
  n_2: number;
  equal_var: boolean;
  alternative: string;
}

export interface StatsClientError extends Error {
  statusCode: number;
  endpoint: string;
}
