"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { gradeTopic } from "@/lib/ai";
import { sendTopicGradedEmail } from "@/lib/email";

export interface FishboneCategoryContent {
  name: string;
  causes: string[];
}

export interface FishboneContent {
  problem: string;
  categories: FishboneCategoryContent[];
}

export async function saveFishbone(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  content: FishboneContent;
}): Promise<{ ok: true; graded: boolean }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const path = topicPath(input.phaseSlug, input.sectionSlug, input.topicSlug);

  const cleaned: FishboneContent = {
    problem: input.content.problem.trim(),
    categories: input.content.categories.map((cat) => ({
      name: cat.name.trim(),
      causes: cat.causes.map((c) => c.trim()).filter(Boolean),
    })),
  };

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
          content: cleaned,
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
      topic: { kind: "fishbone", input: cleaned },
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
    console.error("[save-fishbone] inline grading failed:", err);
  }

  if (graded && gradingResult) {
    await sendTopicGradedEmail({
      to: ctx.user.email,
      toName: ctx.user.fullName ?? undefined,
      workspaceId: ctx.workspace.id,
      projectId: input.projectId,
      projectName,
      topicName: "Fishbone",
      decision: gradingResult.decision,
      score: gradingResult.score,
      summary: gradingResult.summary,
    });
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true, graded };
}
