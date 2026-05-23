/**
 * DB-backed quota checker for the stats gateway.
 *
 * Reads the workspace's `quota_tier` and counts today's `stats_call_log`
 * rows. No new counter table — we already record every call, so the audit
 * trail is the source of truth.
 *
 * The window is "calendar day UTC". A user's quota resets at midnight UTC.
 * Sliding-window or per-minute limits are a future option; for V1 a daily
 * counter matches how operators reason about abuse ("X did Y runs today").
 */
import { sql } from "drizzle-orm";
import type { SigmafyDb } from "@sigmafy/db";
import type { QuotaChecker, QuotaResult } from "./types";

export const DEFAULT_TIER_LIMITS: Record<string, number | null> = {
  free: 100,
  starter: 1000,
  pro: 10000,
  internal: null, // unlimited
};

export interface DbQuotaCheckerOptions {
  /** Override per-tier daily limits. null = unlimited for that tier. */
  tiers?: Record<string, number | null>;
  /** Fallback when the workspace row has an unknown tier. Default 'free'. */
  fallbackTier?: string;
}

/**
 * Build a QuotaChecker that uses the given DB connection.
 *
 * Pass via `createStatsGateway({ ..., quotaChecker: createDbQuotaChecker(db) })`.
 *
 * The check must NOT count rows with status='blocked' — those represent
 * earlier quota rejections and would compound on themselves.
 */
export function createDbQuotaChecker(
  db: SigmafyDb,
  options: DbQuotaCheckerOptions = {},
): QuotaChecker {
  const tiers = options.tiers ?? DEFAULT_TIER_LIMITS;
  const fallback = options.fallbackTier ?? "free";

  return {
    async check(workspaceId: string, _endpoint: string): Promise<QuotaResult> {
      // 1. Look up the workspace's tier.
      const tierRows = await db.execute<{ quota_tier: string }>(sql`
        SELECT quota_tier FROM workspaces WHERE id = ${workspaceId}
      `);
      const tier = tierRows.rows[0]?.quota_tier ?? fallback;
      const limit = tier in tiers ? tiers[tier]! : tiers[fallback]!;

      const resetAt = nextMidnightUtc();

      if (limit === null) {
        return {
          ok: true,
          remaining: Number.POSITIVE_INFINITY,
          resetAt,
        };
      }

      // 2. Count today's accepted runs from stats_call_log. Excluding
      //    status='blocked' avoids compounding rejection counts; including
      //    'error' is deliberate (abusive callers can hammer with bad
      //    inputs and we still want to rate-limit them).
      const countRows = await db.execute<{ count: string }>(sql`
        SELECT COUNT(*)::text AS count
        FROM stats_call_log
        WHERE workspace_id = ${workspaceId}
          AND status <> 'blocked'
          AND occurred_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
      `);
      const used = parseInt(countRows.rows[0]?.count ?? "0", 10);
      const remaining = Math.max(0, limit - used);

      return {
        ok: used < limit,
        remaining,
        resetAt,
      };
    },
  };
}

function nextMidnightUtc(): string {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}
