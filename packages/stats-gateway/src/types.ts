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
  CapabilityRequest,
  CapabilityResponse,
  OneSampleTRequest,
  OneSampleTResponse,
  TwoSampleTRequest,
  TwoSampleTResponse,
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

/**
 * Pluggable quota checker. When `GatewayOptions.quotaChecker` is
 * unset, the gateway falls back to the no-op `checkQuota()` in
 * ./quota.ts — preserves backwards compatibility with callers that
 * haven't wired the DB-backed checker yet. Production callers
 * should inject `createDbQuotaChecker(db)` from ./db-quota.
 */
export interface QuotaChecker {
  check(workspaceId: string, endpoint: string): Promise<QuotaResult>;
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
  /** Optional DB-backed quota checker; defaults to always-allow. */
  quotaChecker?: QuotaChecker;
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
  CapabilityRequest,
  CapabilityResponse,
  OneSampleTRequest,
  OneSampleTResponse,
  TwoSampleTRequest,
  TwoSampleTResponse,
};
