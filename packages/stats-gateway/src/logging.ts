import type { GatewayLogger, StatsCallRecord } from "./types";

/**
 * Default logger — writes to stdout.
 *
 * Phase 0A swaps this for one that persists to the `stats_call_log` table via
 * the service-role db client. Phase -1 is console.log so the shape can be
 * exercised in tests.
 */
export const consoleStatsLogger: GatewayLogger = {
  log(record: StatsCallRecord): void {
    console.log("[stats-gateway]", JSON.stringify(record));
  },
};
