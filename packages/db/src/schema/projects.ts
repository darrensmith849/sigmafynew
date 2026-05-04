import { pgTable, uuid, text, integer, bigint, timestamp } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";
import { projectTemplates } from "./project-templates";

/**
 * A delegate's improvement project. Tenant-scoped under RLS.
 *
 * `template_version` is captured at creation time so structural changes to the
 * template don't reshape live projects.
 *
 * `roi_estimated_zar_cents` stores ZAR in minor units (cents) to dodge float drift.
 */
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  templateId: uuid("template_id")
    .notNull()
    .references(() => projectTemplates.id),
  templateVersion: integer("template_version").notNull(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id),
  sponsorUserId: uuid("sponsor_user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["draft", "active", "completed", "archived"],
  })
    .notNull()
    .default("draft"),
  roiEstimatedZarCents: bigint("roi_estimated_zar_cents", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
