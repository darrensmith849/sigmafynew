"use server";

import { revalidatePath } from "next/cache";
import {
  createStatsGateway,
  createDbStatsLogger,
  type HistogramRequest,
  type HistogramResponse,
} from "@sigmafy/stats-gateway";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

export interface HistogramTopicContent {
  input: HistogramRequest;
  result: HistogramResponse & { summary: HistogramSummary };
}

export interface HistogramSummary {
  n: number;
  mean: number;
  min: number;
  max: number;
  stdev: number;
}

export async function runHistogram(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  request: HistogramRequest;
}): Promise<{ ok: true; result: HistogramResponse & { summary: HistogramSummary } }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();

  const baseUrl = process.env.STATS_API_BASE_URL;
  if (!baseUrl) throw new Error("STATS_API_BASE_URL missing");

  const gateway = createStatsGateway({
    baseUrl,
    auth: { workspaceId: ctx.workspace.id, userId: ctx.user.id },
    logger: createDbStatsLogger(db),
  });

  const remote = await gateway.histogram(input.request);
  const summary = computeSummary(input.request.data);
  const result = { ...remote, summary };

  const path = topicPath(input.phaseSlug, input.sectionSlug, input.topicSlug);
  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const content: HistogramTopicContent = { input: input.request, result };
    await tx.insert(schema.topicSolutions).values({
      workspaceId: ctx.workspace.id,
      projectId: input.projectId,
      topicPath: path,
      userId: ctx.user.id,
      content,
      status: "submitted",
    });
  });

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true, result };
}

function computeSummary(data: number[]): HistogramSummary {
  const n = data.length;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const variance = data.reduce((acc, x) => acc + (x - mean) ** 2, 0) / Math.max(1, n - 1);
  const stdev = Math.sqrt(variance);
  return { n, mean, min, max, stdev };
}
