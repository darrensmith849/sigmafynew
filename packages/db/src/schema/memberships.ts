import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";

/**
 * Memberships — the (workspace × user × role) join. Tenant-scoped: RLS
 * limits visibility to memberships in the active workspace.
 *
 * Roles per the brief: owner, admin, sponsor, trainer, delegate.
 */
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "admin", "sponsor", "trainer", "delegate"] }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceUserUnique: uniqueIndex("memberships_workspace_user_unique").on(
      t.workspaceId,
      t.userId,
    ),
  }),
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
