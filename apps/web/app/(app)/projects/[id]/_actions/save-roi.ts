"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

/**
 * Save the project's estimated annual ROI in ZAR.
 *
 * Internally stored as cents (BIGINT) to avoid float drift. Caller passes
 * rands as a number; we round to nearest cent.
 *
 * `null` clears the estimate.
 */
export async function saveProjectRoi(input: {
  projectId: string;
  zarRands: number | null;
}): Promise<{ ok: true }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();

  const cents =
    input.zarRands === null || Number.isNaN(input.zarRands)
      ? null
      : Math.round(input.zarRands * 100);

  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    await tx
      .update(schema.projects)
      .set({ roiEstimatedZarCents: cents })
      .where(
        and(
          eq(schema.projects.id, input.projectId),
          eq(schema.projects.workspaceId, ctx.workspace.id),
        ),
      );
  });

  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
