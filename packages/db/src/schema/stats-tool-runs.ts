import { jsonb, pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";
import { statsCallLog } from "./stats-call-log";

/**
 * One Studio invocation of the Sigmafy stats engine. Extends — does not
 * duplicate — `stats_call_log`: the audit row records workspace/user/
 * endpoint/status/latency; this row carries the actual input + output JSON
 * plus the Python X-Request-ID so users can replay or share a run.
 *
 * Studio runs created via `gateway.run(slug, payload)` from
 * `@sigmafy/stats-gateway`. The DMAIC project flow in `apps/web` uses the
 * typed gateway methods and writes `topic_solutions` instead — these two
 * surfaces never share rows.
 *
 * RLS: workspace-scoped via `current_setting('app.current_workspace', true)`.
 * Access only through `withWorkspace()` from `@sigmafy/db`.
 */
export const statsToolRuns = pgTable(
  "stats_tool_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    // Dotted slug from Python catalog, e.g. "control-charts.imr".
    toolSlug: text("tool_slug").notNull(),
    // Category name from the catalog, e.g. "Control Charts". Not enforced.
    toolCategory: text("tool_category"),
    // Whatever the user submitted. Always stored.
    inputJson: jsonb("input_json").notNull(),
    // Python response body. Null when status='failed' (or when truncated; see
    // note below). 256 KB soft cap in app code via truncation flag.
    outputJson: jsonb("output_json"),
    status: text("status", { enum: ["completed", "failed"] }).notNull(),
    // Stable code from Python's structured error envelope, e.g. "value_error".
    errorCode: text("error_code"),
    // Human-readable message from Python's `detail` field.
    errorMessage: text("error_message"),
    // Python's X-Request-ID. UUID format but stored as text — matches the
    // header semantics and avoids cast pain when Python ever returns a
    // non-UUID identifier (logs / tracing systems may rewrite).
    requestId: text("request_id"),
    // Wall-clock duration of the gateway call.
    durationMs: integer("duration_ms"),
    // FK to the audit row. The gateway always writes the audit row first;
    // we link the Studio's lineage row to it so operators can correlate
    // by joining.
    statsCallLogId: uuid("stats_call_log_id").references(() => statsCallLog.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceCreatedIdx: index("stats_tool_runs_workspace_created_idx").on(
      t.workspaceId,
      t.createdAt,
    ),
    userCreatedIdx: index("stats_tool_runs_user_created_idx").on(
      t.userId,
      t.createdAt,
    ),
    toolSlugIdx: index("stats_tool_runs_tool_slug_idx").on(t.toolSlug),
    requestIdIdx: index("stats_tool_runs_request_id_idx").on(t.requestId),
  }),
);

export type StatsToolRun = typeof statsToolRuns.$inferSelect;
export type NewStatsToolRun = typeof statsToolRuns.$inferInsert;
