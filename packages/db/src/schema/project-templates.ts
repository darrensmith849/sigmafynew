import { pgTable, uuid, text, integer, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

/**
 * Project templates define DMAIC structure (phases → sections → topics) used
 * to spawn projects.
 *
 * `workspace_id IS NULL` ⇒ system template (the canonical Green Belt template
 * lives here). `workspace_id IS NOT NULL` ⇒ tenant-customised template
 * (deferred past V1 per the brief).
 *
 * RLS lets every workspace read system templates plus its own.
 */
export const projectTemplates = pgTable(
  "project_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    version: integer("version").notNull().default(1),
    /**
     * Definition shape (TypeScript types in @sigmafy/db/src/types.ts):
     * { phases: Array<{ slug, name, sections: Array<{ slug, name, topics: Array<{ slug, name, kind, description? }> }> }> }
     */
    definition: jsonb("definition").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceSlugVersionUnique: uniqueIndex("project_templates_workspace_slug_version_unique").on(
      t.workspaceId,
      t.slug,
      t.version,
    ),
  }),
);

export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type NewProjectTemplate = typeof projectTemplates.$inferInsert;
