"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export type OverrideDecision = "approved" | "approved_with_notes" | "needs_revision";

export interface OverridePayload {
  decision: OverrideDecision;
  note: string;
  overriddenBy: { userId: string; email: string; role: string };
  overriddenAt: string;
}

/**
 * Set or clear the trainer/sponsor/admin override on a topic solution.
 *
 * Pass `decision: null` to clear an existing override (restores AI-grading
 * visibility).
 *
 * Phase 1A: anyone in the workspace can override their own / others' work.
 * Phase 1 Slice B introduces sponsor / trainer role gating; until then the
 * override audit trail captures who did it for review.
 *
 * Master plan §10 / §15 — override is a default UX, not edge-case.
 */
export async function overrideTopicGrading(input: {
  projectId: string;
  topicSolutionId: string;
  decision: OverrideDecision | null;
  note: string;
}): Promise<{ ok: true }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();

  const overridePayload: OverridePayload | null =
    input.decision === null
      ? null
      : {
          decision: input.decision,
          note: input.note.trim(),
          overriddenBy: {
            userId: ctx.user.id,
            email: ctx.user.email,
            role: ctx.role,
          },
          overriddenAt: new Date().toISOString(),
        };

  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    await tx
      .update(schema.topicSolutions)
      .set({ gradingOverride: overridePayload })
      .where(
        and(
          eq(schema.topicSolutions.id, input.topicSolutionId),
          eq(schema.topicSolutions.workspaceId, ctx.workspace.id),
        ),
      );
  });

  // Audit trail (best-effort — failures don't roll back the override).
  try {
    await writeAuditLog({
      actorUserId: ctx.user.id,
      action: input.decision === null ? "override.cleared" : "override.set",
      targetWorkspaceId: ctx.workspace.id,
      targetResource: `topic_solution:${input.topicSolutionId}`,
      justification: input.decision === null ? undefined : input.note,
    });
  } catch (err) {
    console.error("[override-grading] audit-log write failed:", err);
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true };
}
