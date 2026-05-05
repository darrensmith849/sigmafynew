/**
 * Public surface of @sigmafy/stats-client.
 *
 * This package is consumed exclusively by @sigmafy/stats-gateway.
 * App code calls the gateway, never this module directly.
 */
export type { components, paths, operations } from "./generated/api";
export type {
  ParetoRequest,
  ParetoResponse,
  HistogramRequest,
  HistogramResponse,
  IMRRequest,
  IMRResponse,
  IMRControlChart,
  XbarRRequest,
  XbarRResponse,
  XbarRControlChart,
  StatsClientError,
} from "./types";
export { paretoCall } from "./pareto";
export { histogramCall } from "./histogram";
export { imrCall } from "./imr";
export { xbarRCall } from "./xbar-r";
