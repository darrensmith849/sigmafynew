import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";
import { users } from "./users";

/**
 * Email-based invitations to join a workspace.
 *
 * Flow:
 *   1. Workspace owner / admin creates a row with email + role + signed
 *      `token`. Status starts as `pending`.
 *   2. Brevo sends an email with `https://app/accept-invite/{token}`.
 *   3. Recipient signs in (or signs up with the same email) and visits
 *      the URL. The route flips status to `accepted` and creates the
 *      membership.
 *   4. Token expires after 14 days (status flips to `expired` lazily on
 *      next visit).
 *   5. Issuer can `cancel` while pending.
 *
 * Token is the only authentication. It must be unguessable. Generated
 * with crypto.randomBytes(24).toString("base64url") at the call site.
 */
export const workspaceInvitations = pgTable(
  "workspace_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role", {
      enum: ["owner", "admin", "sponsor", "trainer", "delegate"],
    }).notNull(),
    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => users.id),
    status: text("status", {
      enum: ["pending", "accepted", "cancelled", "expired"],
    })
      .notNull()
      .default("pending"),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedByUserId: uuid("accepted_by_user_id").references(() => users.id),
  },
  (t) => ({
    workspaceStatusIdx: index("workspace_invitations_workspace_status_idx").on(
      t.workspaceId,
      t.status,
    ),
    emailIdx: index("workspace_invitations_email_idx").on(t.email),
  }),
);

export type WorkspaceInvitation = typeof workspaceInvitations.$inferSelect;
export type NewWorkspaceInvitation = typeof workspaceInvitations.$inferInsert;
