"use server";

import { randomBytes } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { sendWorkspaceInvitationEmail } from "@/lib/email";

export type InviteRole = "owner" | "admin" | "sponsor" | "trainer" | "delegate";

const INVITE_VALID_DAYS = 14;

/**
 * Invite a user by email to the current workspace.
 *
 * Phase 1 Slice B.2: anyone in the workspace can invite. Slice B.3 gates
 * by role (owner/admin only). Until then the audit_log captures every
 * invite for review.
 *
 * Idempotent for the same email + workspace + status='pending': returns
 * the existing invitation rather than creating a duplicate. This means
 * the inviter can re-trigger the email by submitting the same form.
 */
export async function inviteToWorkspace(input: {
  email: string;
  role: InviteRole;
}): Promise<{ ok: true; existed: boolean }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    throw new Error("Invalid email address.");
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_VALID_DAYS * 24 * 60 * 60 * 1000);

  const { invitation, existed } = await withWorkspace(
    db,
    ctx.workspace.id,
    async (tx) => {
      // Reuse a still-pending invitation rather than create a duplicate.
      const existing = await tx
        .select()
        .from(schema.workspaceInvitations)
        .where(
          and(
            eq(schema.workspaceInvitations.workspaceId, ctx.workspace.id),
            eq(schema.workspaceInvitations.email, email),
            eq(schema.workspaceInvitations.status, "pending"),
          ),
        )
        .limit(1);
      if (existing[0]) {
        return { invitation: existing[0], existed: true };
      }

      const ins = await tx
        .insert(schema.workspaceInvitations)
        .values({
          workspaceId: ctx.workspace.id,
          email,
          role: input.role,
          invitedByUserId: ctx.user.id,
          token,
          expiresAt,
        })
        .returning();
      return { invitation: ins[0]!, existed: false };
    },
  );

  await sendWorkspaceInvitationEmail({
    to: email,
    inviterName: ctx.user.fullName ?? ctx.user.email,
    workspaceName: ctx.workspace.name,
    workspaceId: ctx.workspace.id,
    role: input.role,
    token: invitation.token,
  });

  revalidatePath("/dashboard/members");
  return { ok: true, existed };
}

export async function cancelInvitation(invitationId: string): Promise<{ ok: true }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    await tx
      .update(schema.workspaceInvitations)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(schema.workspaceInvitations.id, invitationId),
          eq(schema.workspaceInvitations.workspaceId, ctx.workspace.id),
          eq(schema.workspaceInvitations.status, "pending"),
        ),
      );
  });
  revalidatePath("/dashboard/members");
  return { ok: true };
}
