import type {
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
} from "@sigmafy/stats-client";

export interface StatsCallRecord {
  workspaceId: string;
  userId: string;
  endpoint: string;
  status: "ok" | "blocked" | "error";
  latencyMs: number;
  errorMessage?: string;
  occurredAt: string;
}

export interface QuotaResult {
  ok: boolean;
  remaining: number;
  resetAt: string;
}

export interface GatewayLogger {
  log(record: StatsCallRecord): void | Promise<void>;
}

export interface GatewayAuth {
  workspaceId: string;
  userId: string;
}

export interface GatewayOptions {
  baseUrl: string;
  /** HMAC secret added in Phase 1. Ignored for now (FastAPI service has no auth). */
  signingSecret?: string;
  auth: GatewayAuth;
  logger: GatewayLogger;
}

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
};
