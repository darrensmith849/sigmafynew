"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { gradeSipoc } from "@/lib/ai";
import { sendTopicGradedEmail } from "@/lib/email";

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
 * Phase 0B: grading + email both happen synchronously in the request.
 * Phase 0B Slice 4 moves grading + email to Inngest so the request returns
 * instantly and grading + delivery land as background events.
 *
 * The grading is best-effort: if OpenAI fails, the submission still saves
 * and we return `graded: false`. The email is also best-effort.
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

  // 1. Save the submission and look up the project name (single tx).
  const { insertedId, projectName } = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const projectRows = await tx
      .select({ name: schema.projects.name })
      .from(schema.projects)
      .where(eq(schema.projects.id, input.projectId))
      .limit(1);
    const project = projectRows[0];

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
    return { insertedId: rows[0]!.id, projectName: project?.name ?? "Project" };
  });

  // 2. Grade (best-effort).
  let graded = false;
  let gradingResult: Awaited<ReturnType<typeof gradeSipoc>>["grading"] | null = null;
  try {
    const r = await gradeSipoc({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      content: input.content,
    });
    gradingResult = r.grading;
    await withWorkspace(db, ctx.workspace.id, async (tx) => {
      await tx
        .update(schema.topicSolutions)
        .set({ grading: gradingResult })
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

  // 3. Email (best-effort, only if grading succeeded — nothing meaningful to
  //    say to the user yet otherwise).
  if (graded && gradingResult) {
    await sendTopicGradedEmail({
      to: ctx.user.email,
      toName: ctx.user.fullName ?? undefined,
      workspaceId: ctx.workspace.id,
      projectId: input.projectId,
      projectName,
      topicName: "SIPOC",
      decision: gradingResult.decision,
      score: gradingResult.score,
      summary: gradingResult.summary,
    });
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true, graded };
}
