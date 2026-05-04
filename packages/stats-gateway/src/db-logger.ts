import { schema, withWorkspace, type SigmafyDb } from "@sigmafy/db";
import type { GatewayLogger, StatsCallRecord } from "./types";

/**
 * Persists every gateway call to the `stats_call_log` table under the
 * caller's workspace context, so RLS scopes audit reads naturally.
 *
 * The stats_call_log INSERT happens inside `withWorkspace()` so the row is
 * tagged with the right workspace_id and the policy passes the WITH CHECK.
 */
export function createDbStatsLogger(db: SigmafyDb): GatewayLogger {
  return {
    async log(record: StatsCallRecord): Promise<void> {
      await withWorkspace(db, record.workspaceId, async (tx) => {
        await tx.insert(schema.statsCallLog).values({
          workspaceId: record.workspaceId,
          userId: record.userId,
          endpoint: record.endpoint,
          status: record.status,
          latencyMs: record.latencyMs,
          errorMessage: record.errorMessage,
          occurredAt: new Date(record.occurredAt),
        });
      });
    },
  };
}
