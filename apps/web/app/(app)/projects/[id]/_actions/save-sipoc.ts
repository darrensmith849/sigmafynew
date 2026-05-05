"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { gradeSipoc } from "@/lib/ai";

export interface SipocContent {
  suppliers: string[];
  inputs: string[];
  process: string[];
  outputs: string[];
  customers: string[];
}

/**
 * Save a SIPOC submission and run AI grading inline.
 *
 * Phase 0B: grading happens synchronously in the request. Phase 0B Slice 4
 * moves this to an Inngest job so the request returns instantly and grading
 * lands as a background event. For now the user waits ~3-8 seconds.
 *
 * The grading is best-effort: if OpenAI fails, the submission still saves and
 * we return `graded: false`. The user can re-submit to retry grading.
 */
export async function saveSipoc(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  content: SipocContent;
}): Promise<{ ok: true; graded: boolean }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const path = topicPath(input.phaseSlug, input.sectionSlug, input.topicSlug);

  // 1. Save the submission (always succeeds independently of grading)
  const insertedId = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const rows = await tx
      .insert(schema.topicSolutions)
      .values({
        workspaceId: ctx.workspace.id,
        projectId: input.projectId,
        topicPath: path,
        userId: ctx.user.id,
        content: input.content,
        status: "submitted",
      })
      .returning({ id: schema.topicSolutions.id });
    return rows[0]!.id;
  });

  // 2. Try to grade (best-effort; failures don't block save)
  let graded = false;
  try {
    const { grading } = await gradeSipoc({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      content: input.content,
    });
    await withWorkspace(db, ctx.workspace.id, async (tx) => {
      await tx
        .update(schema.topicSolutions)
        .set({ grading })
        .where(
          and(
            eq(schema.topicSolutions.id, insertedId),
            eq(schema.topicSolutions.workspaceId, ctx.workspace.id),
          ),
        );
    });
    graded = true;
  } catch (err) {
    console.error("[save-sipoc] grading failed (continuing):", err);
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true, graded };
}
