import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

/**
 * Phase -1 placeholder.
 *
 * Exists solely to give `drizzle-kit generate` a non-empty schema so the
 * migration tooling can be exercised. Delete in Phase 0A when real schema
 * (workspaces, users, projects, etc.) lands.
 */
export const phaseMinusOneProbe = pgTable("_phase_minus_one_probe", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
