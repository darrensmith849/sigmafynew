import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { projects } from "./projects";
import { users } from "./users";

/**
 * One approval row per (project, phase). UPSERTed when the delegate submits
 * a phase for sponsor sign-off; mutated by the sponsor on approve/reject.
 *
 * `phase_slug` is the dotted phase identifier from the template
 * (e.g. "define", "measure", "analyse", "improve", "control",
 * "executive-summary").
 *
 * Phase 1 Slice B.4: any workspace member can approve. Slice B.5 (or
 * Phase 1 prep) gates by role + class-assigned sponsor.
 */
export const phaseApprovals = pgTable(
  "phase_approvals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    phaseSlug: text("phase_slug").notNull(),
    status: text("status", {
      enum: ["pending", "approved", "rejected"],
    })
      .notNull()
      .default("pending"),
    submittedByUserId: uuid("submitted_by_user_id")
      .notNull()
      .references(() => users.id),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    decidedByUserId: uuid("decided_by_user_id").references(() => users.id),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    note: text("note"),
  },
  (t) => ({
    projectPhaseUnique: index("phase_approvals_project_phase_unique").on(
      t.projectId,
      t.phaseSlug,
    ),
    workspaceStatusIdx: index("phase_approvals_workspace_status_idx").on(
      t.workspaceId,
      t.status,
    ),
  }),
);

export type PhaseApproval = typeof phaseApprovals.$inferSelect;
export type NewPhaseApproval = typeof phaseApprovals.$inferInsert;
