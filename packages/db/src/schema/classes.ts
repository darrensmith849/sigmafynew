import { pgTable, uuid, text, timestamp, date, index } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";
import { projects } from "./projects";

/**
 * A training class / cohort.
 *
 * Belongs to a workspace (e.g. SSA). Members are added via class_enrolments.
 * Each delegate enrolment optionally points to a project that's their work
 * inside the class.
 *
 * Slice B.1: schema only. UI in B.1.c.
 */
export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    startsOn: date("starts_on"),
    endsOn: date("ends_on"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceSlugUnique: index("classes_workspace_slug_unique").on(t.workspaceId, t.slug),
  }),
);

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

/**
 * A user enrolled in a class. The role here mirrors the workspace role at
 * enrolment time but is independently editable per class — e.g. a trainer
 * across two classes can be a "delegate" in one and a "trainer" in the
 * other.
 *
 * `projectId` is the delegate's project for this class — nullable so the
 * row can exist before the project is spawned.
 */
export const classEnrolments = pgTable(
  "class_enrolments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", {
      enum: ["trainer", "sponsor", "delegate"],
    }).notNull(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    classUserUnique: index("class_enrolments_class_user_unique").on(t.classId, t.userId),
  }),
);

export type ClassEnrolment = typeof classEnrolments.$inferSelect;
export type NewClassEnrolment = typeof classEnrolments.$inferInsert;
