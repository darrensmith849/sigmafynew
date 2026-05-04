import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";

/**
 * Audit log of every stats-gateway call. Tenant-scoped under RLS so
 * delegates only see their own workspace's calls; cross-tenant analytics
 * happen via the service-role connection.
 */
export const statsCallLog = pgTable(
  "stats_call_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    endpoint: text("endpoint").notNull(),
    status: text("status", { enum: ["ok", "blocked", "error"] }).notNull(),
    latencyMs: integer("latency_ms").notNull(),
    errorMessage: text("error_message"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceOccurredIdx: index("stats_call_log_workspace_occurred_idx").on(
      t.workspaceId,
      t.occurredAt,
    ),
  }),
);

export type StatsCallLogEntry = typeof statsCallLog.$inferSelect;
export type NewStatsCallLogEntry = typeof statsCallLog.$inferInsert;
