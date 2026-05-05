import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { projects } from "./projects";
import { users } from "./users";

/**
 * Comment thread on a single topic within a project.
 *
 * Anyone in the workspace can post; intended use is trainers / sponsors
 * leaving notes for the delegate, or delegates asking questions back.
 *
 * `topic_path` matches `topic_solutions.topic_path` (dotted phase.section.topic).
 */
export const topicComments = pgTable(
  "topic_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    topicPath: text("topic_path").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    projectTopicIdx: index("topic_comments_project_topic_idx").on(t.projectId, t.topicPath),
  }),
);

export type TopicComment = typeof topicComments.$inferSelect;
export type NewTopicComment = typeof topicComments.$inferInsert;
