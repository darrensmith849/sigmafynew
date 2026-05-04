import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { workspaces } from "./workspaces";

/**
 * Cross-tenant audit log. Captures every service-role bypass, admin
 * impersonation, and other sensitive actions per §8 of the master plan.
 *
 * Not RLS-scoped — this table is service-role only. App code never reads
 * or writes here; only the audited admin paths and migration scripts do.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    targetWorkspaceId: uuid("target_workspace_id").references(() => workspaces.id),
    targetResource: text("target_resource"),
    justification: text("justification"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    actorCreatedIdx: index("audit_log_actor_created_idx").on(t.actorUserId, t.createdAt),
  }),
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
