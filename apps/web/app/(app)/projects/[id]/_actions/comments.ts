"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

export async function addTopicComment(input: {
  projectId: string;
  topicPath: string;
  body: string;
}): Promise<{ ok: true }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const body = input.body.trim();
  if (!body) throw new Error("Comment is empty.");
  if (body.length > 4000) throw new Error("Comment is too long (max 4000 chars).");

  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    await tx.insert(schema.topicComments).values({
      workspaceId: ctx.workspace.id,
      projectId: input.projectId,
      topicPath: input.topicPath,
      userId: ctx.user.id,
      body,
    });
  });

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true };
}

export async function deleteTopicComment(input: {
  projectId: string;
  commentId: string;
}): Promise<{ ok: true }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    // Only allow the author to delete their own comment for now. Phase 1
    // Slice B.5 will let admins delete too.
    await tx
      .delete(schema.topicComments)
      .where(
        and(
          eq(schema.topicComments.id, input.commentId),
          eq(schema.topicComments.userId, ctx.user.id),
        ),
      );
  });
  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true };
}
