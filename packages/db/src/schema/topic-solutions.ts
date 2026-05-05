import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { projects } from "./projects";
import { users } from "./users";

/**
 * A delegate's submission against a topic in their project.
 *
 * `topic_path` is the dotted address into the template definition,
 * e.g. "define.charter.charter", "define.charter.sipoc", "define.charter.pareto".
 *
 * `content` shape depends on topic kind. Examples:
 *   sipoc:  { suppliers: [...], inputs: [...], process: [...], outputs: [...], customers: [...] }
 *   pareto: { input: { labels: [...], counts: [...] }, result: { total, sorted, cumulative } }
 *   charter: { problem, goal, scope, baseline, target, ... } (read-only in Phase 0A)
 *
 * `grading` is set by the AI grading flow in Phase 0B+. Shape varies by topic
 * kind but always includes { promptId, promptVersion, modelId, gradedAt, ... }.
 *
 * Multiple solutions per topic are allowed (the latest is treated as current).
 */
export const topicSolutions = pgTable(
  "topic_solutions",
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
    content: jsonb("content").notNull(),
    grading: jsonb("grading"),
    /**
     * Trainer / sponsor / admin override of AI grading.
     *
     * Shape:
     * {
     *   decision: "approved" | "approved_with_notes" | "needs_revision",
     *   note: string,
     *   overriddenBy: { userId, email, role },
     *   overriddenAt: ISO 8601
     * }
     *
     * When set, this takes precedence over `grading` in the UI.
     * Clearing the override (set to null) restores AI grading visibility.
     *
     * Master plan §10 / §15: trainer/sponsor/admin override of AI feedback
     * must be the default UX, not an edge case.
     */
    gradingOverride: jsonb("grading_override"),
    status: text("status", {
      enum: ["draft", "submitted", "approved", "rejected"],
    })
      .notNull()
      .default("draft"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    projectTopicIdx: index("topic_solutions_project_topic_idx").on(t.projectId, t.topicPath),
  }),
);

export type TopicSolution = typeof topicSolutions.$inferSelect;
export type NewTopicSolution = typeof topicSolutions.$inferInsert;
