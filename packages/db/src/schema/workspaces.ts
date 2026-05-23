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
  /**
   * Per-workspace daily quota tier for the Sigmafy stats engine.
   *   free     → 100 runs / UTC day
   *   starter  → 1 000 runs / day
   *   pro      → 10 000 runs / day
   *   internal → unlimited
   *
   * Limits live in TypeScript (packages/stats-gateway/src/db-quota.ts) so
   * they tune without a migration. The DB enforces the enum set via the
   * workspaces_quota_tier_check CHECK constraint (see migration 0011).
   */
  quotaTier: text("quota_tier", { enum: ["free", "starter", "pro", "internal"] })
    .notNull()
    .default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
