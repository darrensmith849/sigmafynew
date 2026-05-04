import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Users — global. One row per Sigmafy user, identified by Clerk user ID.
 *
 * Users belong to many workspaces via `memberships`. Not RLS-scoped at the
 * row level (a user is, definitionally, not tenant data).
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
