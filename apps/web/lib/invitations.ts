import { eq, and } from "drizzle-orm";
import { schema } from "@sigmafy/db";
import { getCurrentUser } from "@sigmafy/auth/server";
import { getServiceDb } from "./db";
import { writeAuditLog } from "./audit";

export type AcceptResult =
  | { ok: true; workspaceId: string; workspaceSlug: string; workspaceName: string }
  | { ok: false; reason: "not_signed_in" | "not_found" | "expired" | "wrong_email" | "already_member" };

/**
 * Redeem an invitation token.
 *
 * Service-role used because the accepting user has no workspace context
 * yet (just like bootstrap). Audit-logged. Idempotent — calling twice
 * with the same token returns the same workspace context the second
 * time without duplicating the membership.
 */
export async function acceptInvitation(token: string): Promise<AcceptResult> {
  const clerkUser = await getCurrentUser();
  if (!clerkUser) return { ok: false, reason: "not_signed_in" };

  const svc = getServiceDb();

  // Find or create the Sigmafy users row for the accepting user.
  const userRows = await svc
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkUserId, clerkUser.id))
    .limit(1);
  let userId = userRows[0]?.id;
  if (!userId) {
    const ins = await svc
      .insert(schema.users)
      .values({
        clerkUserId: clerkUser.id,
        email: clerkUser.email,
        fullName: clerkUser.fullName,
      })
      .returning();
    userId = ins[0]!.id;
  }

  const invRows = await svc
    .select()
    .from(schema.workspaceInvitations)
    .where(eq(schema.workspaceInvitations.token, token))
    .limit(1);
  const inv = invRows[0];
  if (!inv) return { ok: false, reason: "not_found" };

  // Email must match the invited address (case-insensitive).
  if (inv.email.toLowerCase() !== clerkUser.email.toLowerCase()) {
    return { ok: false, reason: "wrong_email" };
  }

  // Already-accepted token: idempotent — return the workspace.
  if (inv.status === "accepted") {
    const wsRows = await svc
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, inv.workspaceId))
      .limit(1);
    const ws = wsRows[0];
    if (!ws) return { ok: false, reason: "not_found" };
    return { ok: true, workspaceId: ws.id, workspaceSlug: ws.slug, workspaceName: ws.name };
  }

  // Cancelled / expired.
  if (inv.status !== "pending") return { ok: false, reason: "expired" };
  if (inv.expiresAt < new Date()) {
    await svc
      .update(schema.workspaceInvitations)
      .set({ status: "expired" })
      .where(eq(schema.workspaceInvitations.id, inv.id));
    return { ok: false, reason: "expired" };
  }

  // Check existing membership; if already a member, mark accepted and return.
  const existingMembership = await svc
    .select()
    .from(schema.memberships)
    .where(
      and(
        eq(schema.memberships.workspaceId, inv.workspaceId),
        eq(schema.memberships.userId, userId),
      ),
    )
    .limit(1);

  if (!existingMembership[0]) {
    await svc.insert(schema.memberships).values({
      workspaceId: inv.workspaceId,
      userId,
      role: inv.role,
    });
  }

  await svc
    .update(schema.workspaceInvitations)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
      acceptedByUserId: userId,
    })
    .where(eq(schema.workspaceInvitations.id, inv.id));

  // Audit
  try {
    await writeAuditLog({
      actorUserId: userId,
      action: "invitation.accepted",
      targetWorkspaceId: inv.workspaceId,
      targetResource: `invitation:${inv.id}`,
      justification: `accepted invitation as ${inv.role}; invited by ${inv.invitedByUserId}`,
    });
  } catch (err) {
    console.error("[invitations] audit-log write failed:", err);
  }

  const wsRows = await svc
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.id, inv.workspaceId))
    .limit(1);
  const ws = wsRows[0];
  if (!ws) return { ok: false, reason: "not_found" };

  if (existingMembership[0]) {
    return { ok: true, workspaceId: ws.id, workspaceSlug: ws.slug, workspaceName: ws.name };
  }

  return { ok: true, workspaceId: ws.id, workspaceSlug: ws.slug, workspaceName: ws.name };
}
