"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { gradeTopic } from "@/lib/ai";
import { sendTopicGradedEmail } from "@/lib/email";
import { inngest } from "@/lib/inngest/client";

export interface FiveWhysContent {
  problem: string;
  whys: string[];
}

/**
 * Save a 5-Whys submission. Same async-or-inline grading shape as SIPOC.
 */
export async function saveFiveWhys(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  content: FiveWhysContent;
}): Promise<{ ok: true; graded: boolean; async: boolean }> {
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

  // Async via Inngest if configured
  if (process.env.INNGEST_EVENT_KEY) {
    try {
      await inngest.send({
        name: "topic.grading.requested",
        data: {
          workspaceId: ctx.workspace.id,
          projectId: input.projectId,
          topicSolutionId: insertedId,
          // Inngest event currently typed for "sipoc"; widening will be a
          // follow-up. For now: inline-only path for 5-Whys until the event
          // schema is widened.
          topicKind: "sipoc",
          topicPath: path,
          submitterUserId: ctx.user.id,
          submitterEmail: ctx.user.email,
          submitterName: ctx.user.fullName,
        },
      });
      revalidatePath(`/projects/${input.projectId}`);
      // Fall through to inline path: we can't actually rely on the Inngest
      // function for 5-Whys until we widen its kind handling. So treat
      // Inngest as a fire-and-forget for telemetry only and grade inline.
    } catch (err) {
      console.error("[save-five-whys] inngest dispatch failed:", err);
    }
  }

  // Inline grading
  let graded = false;
  let gradingResult: Awaited<ReturnType<typeof gradeTopic>>["grading"] | null = null;
  try {
    const r = await gradeTopic({
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      topic: { kind: "five-whys", input: input.content },
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
    console.error("[save-five-whys] inline grading failed:", err);
  }

  if (graded && gradingResult) {
    await sendTopicGradedEmail({
      to: ctx.user.email,
      toName: ctx.user.fullName ?? undefined,
      workspaceId: ctx.workspace.id,
      projectId: input.projectId,
      projectName,
      topicName: "5-Whys",
      decision: gradingResult.decision,
      score: gradingResult.score,
      summary: gradingResult.summary,
    });
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true, graded, async: false };
}
