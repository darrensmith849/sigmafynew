"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

/**
 * Toggle a project between active and completed.
 *
 * `completed` flips projects.status. Audit-logged.
 *
 * Phase 1 Slice D.1: any workspace member can mark a project complete.
 * Slice D polish gates this to the project owner + sponsor + admins.
 */
export async function setProjectStatus(input: {
  projectId: string;
  status: "active" | "completed" | "archived";
}): Promise<{ ok: true }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    await tx
      .update(schema.projects)
      .set({ status: input.status })
      .where(
        and(
          eq(schema.projects.id, input.projectId),
          eq(schema.projects.workspaceId, ctx.workspace.id),
        ),
      );
  });
  try {
    await writeAuditLog({
      actorUserId: ctx.user.id,
      action: `project.set_status.${input.status}`,
      targetWorkspaceId: ctx.workspace.id,
      targetResource: `project:${input.projectId}`,
    });
  } catch (err) {
    console.error("[complete-project] audit-log write failed:", err);
  }
  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
