"use server";

import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { sendPhaseApprovalRequestedEmail, sendPhaseApprovalDecidedEmail } from "@/lib/email";

/**
 * Submit a phase for sponsor approval.
 *
 * Idempotent: re-submitting a phase already pending is a no-op (returns
 * existing); re-submitting a previously-rejected phase resets it to pending
 * and clears the previous decision. Approved phases cannot be re-submitted.
 *
 * Phase 1 Slice B.4: any workspace member is notified by listing the
 * pending queue. Slice B.5 (or Phase 1 prep) routes specifically to the
 * class-assigned sponsor.
 */
export async function submitPhaseForApproval(input: {
  projectId: string;
  phaseSlug: string;
}): Promise<{ ok: true; status: "pending" | "approved" }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();

  const result = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const existing = await tx
      .select()
      .from(schema.phaseApprovals)
      .where(
        and(
          eq(schema.phaseApprovals.projectId, input.projectId),
          eq(schema.phaseApprovals.phaseSlug, input.phaseSlug),
        ),
      )
      .limit(1);

    if (existing[0]?.status === "approved") {
      return { status: "approved" as const };
    }
    if (existing[0]?.status === "pending") {
      return { status: "pending" as const };
    }

    if (existing[0]) {
      // Re-submit after rejection — reset.
      await tx
        .update(schema.phaseApprovals)
        .set({
          status: "pending",
          submittedByUserId: ctx.user.id,
          submittedAt: new Date(),
          decidedByUserId: null,
          decidedAt: null,
          note: null,
        })
        .where(eq(schema.phaseApprovals.id, existing[0].id));
    } else {
      await tx.insert(schema.phaseApprovals).values({
        workspaceId: ctx.workspace.id,
        projectId: input.projectId,
        phaseSlug: input.phaseSlug,
        submittedByUserId: ctx.user.id,
      });
    }
    return { status: "pending" as const };
  });

  // Email out-of-band (only on real submit, not idempotent no-op).
  if (result.status === "pending") {
    await notifySponsorsOfPendingPhase(ctx.workspace.id, input.projectId, input.phaseSlug);
  }

  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/dashboard/approvals");
  return { ok: true, status: result.status };
}

export async function decidePhaseApproval(input: {
  projectId: string;
  phaseSlug: string;
  decision: "approved" | "rejected";
  note: string;
}): Promise<{ ok: true }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();

  const updated = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const rows = await tx
      .update(schema.phaseApprovals)
      .set({
        status: input.decision,
        decidedByUserId: ctx.user.id,
        decidedAt: new Date(),
        note: input.note.trim() || null,
      })
      .where(
        and(
          eq(schema.phaseApprovals.projectId, input.projectId),
          eq(schema.phaseApprovals.phaseSlug, input.phaseSlug),
          eq(schema.phaseApprovals.status, "pending"),
        ),
      )
      .returning();
    return rows[0];
  });

  if (updated) {
    try {
      await writeAuditLog({
        actorUserId: ctx.user.id,
        action: `phase_approval.${input.decision}`,
        targetWorkspaceId: ctx.workspace.id,
        targetResource: `project:${input.projectId}/phase:${input.phaseSlug}`,
        justification: input.note,
      });
    } catch (err) {
      console.error("[phase-approval] audit-log write failed:", err);
    }

    // Notify the delegate (the project owner). Use service-role for the
    // user-lookup since the workspace context is fine but we want the
    // owner's email regardless of whether they're the actor.
    await notifyDelegateOfDecision(
      ctx.workspace.id,
      input.projectId,
      input.phaseSlug,
      input.decision,
      input.note,
      ctx.user.fullName ?? ctx.user.email,
    );
  }

  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/dashboard/approvals");
  return { ok: true };
}

// ----- helpers -----

async function notifySponsorsOfPendingPhase(
  workspaceId: string,
  projectId: string,
  phaseSlug: string,
): Promise<void> {
  // Use service-role to look up workspace + project + sponsors. We don't
  // want to gate this on RLS (the actor may not see other members' emails).
  const { getServiceDb } = await import("@/lib/db");
  const svc = getServiceDb();

  const project = await svc
    .select({ name: schema.projects.name, ownerEmail: schema.users.email })
    .from(schema.projects)
    .innerJoin(schema.users, eq(schema.projects.ownerUserId, schema.users.id))
    .where(eq(schema.projects.id, projectId))
    .limit(1);
  const ws = await svc
    .select({ name: schema.workspaces.name })
    .from(schema.workspaces)
    .where(eq(schema.workspaces.id, workspaceId))
    .limit(1);

  // Pick sponsors: workspace memberships with role='sponsor' OR 'owner' OR 'admin'.
  const recipients = await svc.execute<{ email: string; full_name: string | null }>(sql`
    SELECT DISTINCT u.email, u.full_name
    FROM ${schema.memberships} m
    JOIN ${schema.users} u ON u.id = m.user_id
    WHERE m.workspace_id = ${workspaceId}
      AND m.role IN ('sponsor','owner','admin')
  `);
  const rows = (recipients.rows ?? recipients) as Array<{ email: string; full_name: string | null }>;

  const projectName = project[0]?.name ?? "a project";
  const workspaceName = ws[0]?.name ?? "a workspace";
  await Promise.all(
    rows.map((r) =>
      sendPhaseApprovalRequestedEmail({
        to: r.email,
        toName: r.full_name ?? undefined,
        workspaceId,
        workspaceName,
        projectId,
        projectName,
        phaseSlug,
      }).catch((err) => console.error("[approval] sponsor notify failed:", err)),
    ),
  );
}

async function notifyDelegateOfDecision(
  workspaceId: string,
  projectId: string,
  phaseSlug: string,
  decision: "approved" | "rejected",
  note: string,
  decidedByName: string,
): Promise<void> {
  const { getServiceDb } = await import("@/lib/db");
  const svc = getServiceDb();
  const rows = await svc
    .select({
      email: schema.users.email,
      fullName: schema.users.fullName,
      projectName: schema.projects.name,
    })
    .from(schema.projects)
    .innerJoin(schema.users, eq(schema.projects.ownerUserId, schema.users.id))
    .where(eq(schema.projects.id, projectId))
    .limit(1);
  const r = rows[0];
  if (!r) return;
  await sendPhaseApprovalDecidedEmail({
    to: r.email,
    toName: r.fullName ?? undefined,
    workspaceId,
    projectId,
    projectName: r.projectName,
    phaseSlug,
    decision,
    note,
    decidedByName,
  }).catch((err) => console.error("[approval] delegate notify failed:", err));
}
