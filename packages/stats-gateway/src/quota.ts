import type { QuotaResult } from "./types";

/**
 * Workspace-level quota check for a stats endpoint.
 *
 * Phase -1: stubbed to always allow. Phase 1 backs this with Upstash Redis
 * counters per workspace × endpoint × time window.
 */
export async function checkQuota(_workspaceId: string, _endpoint: string): Promise<QuotaResult> {
  return { ok: true, remaining: Number.POSITIVE_INFINITY, resetAt: new Date().toISOString() };
}
