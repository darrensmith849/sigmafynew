"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { gradeSipoc } from "@/lib/ai";
import { sendTopicGradedEmail } from "@/lib/email";
import { inngest } from "@/lib/inngest/client";

export interface SipocContent {
  suppliers: string[];
  inputs: string[];
  process: string[];
  outputs: string[];
  customers: string[];
}

/**
 * Save a SIPOC submission. Grading runs async via Inngest when configured;
 * otherwise falls back to inline grading so dev / no-keys still works.
 *
 * Return value semantics:
 *   - `graded: true`  — grading completed inline; the topic_solutions row
 *                       already has the grading column set on return.
 *   - `graded: false` — grading was dispatched to Inngest (or failed
 *                       inline). The grading column will be populated
 *                       async; the page will show it on next refresh.
 */
export async function saveSipoc(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  content: SipocContent;
}): Promise<{ ok: true; graded: boolean; async: boolean }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const path = topicPath(input.phaseSlug, input.sectionSlug, input.topicSlug);

  // 1. Save the submission and grab the project name for downstream use.
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

  // 2. Try Inngest first. If keys are configured, this returns instantly
  //    and the user sees grading on next page load (or via the email).
  if (process.env.INNGEST_EVENT_KEY) {
    try {
      await inngest.send({
        name: "topic.grading.requested",
        data: {
          workspaceId: ctx.workspace.id,
          projectId: input.projectId,
          topicSolutionId: insertedId,
          topicKind: "sipoc",
          topicPath: path,
          submitterUserId: ctx.user.id,
          submitterEmail: ctx.user.email,
          submitterName: ctx.user.fullName,
        },
      });
      revalidatePath(`/projects/${input.projectId}`);
      return { ok: true, graded: false, async: true };
    } catch (err) {
      console.error("[save-sipoc] inngest dispatch failed, falling back to inline:", err);
    }
  }

  // 3. Inline fallback (dev, or Inngest unavailable). Same logic as before.
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
    console.error("[save-sipoc] inline grading failed:", err);
  }

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
  return { ok: true, graded, async: false };
}
