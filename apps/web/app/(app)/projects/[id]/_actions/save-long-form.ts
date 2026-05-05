"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { gradeTopic } from "@/lib/ai";
import { sendTopicGradedEmail } from "@/lib/email";

export interface LongFormContent {
  answer: string;
}

/**
 * Save a long-form (single-textarea) topic submission.
 *
 * The grading prompt needs the topic name + brief in addition to the
 * answer; the caller passes them through so the prompt can grade against
 * the topic's specific brief.
 */
export async function saveLongForm(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  topicName: string;
  topicBrief: string;
  content: LongFormContent;
}): Promise<{ ok: true; graded: boolean }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const path = topicPath(input.phaseSlug, input.sectionSlug, input.topicSlug);

  const { insertedId, projectName } = await withWorkspace(
    db,
    ctx.workspace.id,
    async (tx) => {
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
    },
  );

  let graded = false;
  let gradingResult: Awaited<ReturnType<typeof gradeTopic>>["grading"] | null = null;
  try {
    const r = await gradeTopic({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      topic: {
        kind: "long-form",
        input: {
          topicName: input.topicName,
          topicBrief: input.topicBrief,
          answer: input.content.answer,
        },
      },
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
    console.error("[save-long-form] inline grading failed:", err);
  }

  if (graded && gradingResult) {
    await sendTopicGradedEmail({
      to: ctx.user.email,
      toName: ctx.user.fullName ?? undefined,
      workspaceId: ctx.workspace.id,
      projectId: input.projectId,
      projectName,
      topicName: input.topicName,
      decision: gradingResult.decision,
      score: gradingResult.score,
      summary: gradingResult.summary,
    });
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true, graded };
}
