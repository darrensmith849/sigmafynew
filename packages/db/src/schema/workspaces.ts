import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Workspaces — the tenant boundary. Every other tenant-owned row carries a
 * `workspace_id` that points here.
 *
 * Not RLS-scoped at the row level — workspaces are visible to their members
 * by joining through `memberships`, which IS RLS-scoped. Workspace creation
 * is the only sanctioned bootstrap path that uses the service role.
 */
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
