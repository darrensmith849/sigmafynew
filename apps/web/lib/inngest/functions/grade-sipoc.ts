import { eq, and } from "drizzle-orm";
import { schema, withWorkspace } from "@sigmafy/db";
import { inngest } from "../client";
import { getAppDb } from "../../db";
import { gradeSipoc } from "../../ai";
import { sendTopicGradedEmail } from "../../email";

/**
 * Async SIPOC grading.
 *
 * Trigger: `topic.grading.requested` event with `topicKind === "sipoc"`.
 *
 * Steps (each `step.run` is a durable, retried unit):
 *   1. Load the submission (under workspace context).
 *   2. Call OpenAI for the grading.
 *   3. Persist the grading onto the topic_solutions row.
 *   4. Send the topic-graded email.
 *
 * On any step failure Inngest retries with exponential backoff. Idempotent
 * by topic_solutions.id — re-grading the same row overwrites the grading
 * column (acceptable; latest grading wins).
 */
export const gradeSipocFn = inngest.createFunction(
  {
    id: "grade-sipoc",
    name: "Grade SIPOC submission",
    retries: 3,
    concurrency: { limit: 10 },
  },
  { event: "topic.grading.requested" },
  async ({ event, step }) => {
    if (event.data.topicKind !== "sipoc") return { skipped: true };

    const { workspaceId, projectId, topicSolutionId, submitterUserId, submitterEmail, submitterName } =
      event.data;
    const db = getAppDb();

    const submission = await step.run("load-submission", async () => {
      return await withWorkspace(db, workspaceId, async (tx) => {
        const rows = await tx
          .select({
            id: schema.topicSolutions.id,
            content: schema.topicSolutions.content,
          })
          .from(schema.topicSolutions)
          .where(
            and(
              eq(schema.topicSolutions.id, topicSolutionId),
              eq(schema.topicSolutions.workspaceId, workspaceId),
            ),
          )
          .limit(1);
        return rows[0];
      });
    });
    if (!submission) return { error: "topic_solution_not_found" };

    const projectName = await step.run("load-project-name", async () => {
      return await withWorkspace(db, workspaceId, async (tx) => {
        const rows = await tx
          .select({ name: schema.projects.name })
          .from(schema.projects)
          .where(eq(schema.projects.id, projectId))
          .limit(1);
        return rows[0]?.name ?? "Project";
      });
    });

    const grading = await step.run("call-openai", async () => {
      const r = await gradeSipoc({
        workspaceId,
        userId: submitterUserId,
        content: submission.content as Parameters<typeof gradeSipoc>[0]["content"],
      });
      return r.grading;
    });

    await step.run("persist-grading", async () => {
      await withWorkspace(db, workspaceId, async (tx) => {
        await tx
          .update(schema.topicSolutions)
          .set({ grading })
          .where(
            and(
              eq(schema.topicSolutions.id, topicSolutionId),
              eq(schema.topicSolutions.workspaceId, workspaceId),
            ),
          );
      });
    });

    await step.run("send-email", async () => {
      await sendTopicGradedEmail({
        to: submitterEmail,
        toName: submitterName ?? undefined,
        workspaceId,
        projectId,
        projectName,
        topicName: "SIPOC",
        decision: grading.decision,
        score: grading.score,
        summary: grading.summary,
      });
    });

    return { ok: true, score: grading.score, decision: grading.decision };
  },
);
