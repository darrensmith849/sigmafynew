"use server";

import { revalidatePath } from "next/cache";
import {
  createStatsGateway,
  createDbStatsLogger,
  type OneSampleTRequest,
  type OneSampleTResponse,
  type TwoSampleTRequest,
  type TwoSampleTResponse,
} from "@sigmafy/stats-gateway";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

export interface OneSampleTContent {
  input: OneSampleTRequest;
  result: OneSampleTResponse;
}
export interface TwoSampleTContent {
  input: TwoSampleTRequest;
  result: TwoSampleTResponse;
}

function makeGateway(workspaceId: string, userId: string) {
  const baseUrl = process.env.STATS_API_BASE_URL;
  if (!baseUrl) throw new Error("STATS_API_BASE_URL missing");
  const db = getAppDb();
  return {
    db,
    gateway: createStatsGateway({
      baseUrl,
      auth: { workspaceId, userId },
      logger: createDbStatsLogger(db),
    }),
  };
}

export async function runOneSampleT(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  request: OneSampleTRequest;
}): Promise<{ ok: true; result: OneSampleTResponse }> {
  const ctx = await requireAuthContext();
  const { db, gateway } = makeGateway(ctx.workspace.id, ctx.user.id);
  const result = await gateway.oneSampleT(input.request);
  const path = topicPath(input.phaseSlug, input.sectionSlug, input.topicSlug);
  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const content: OneSampleTContent = { input: input.request, result };
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

export async function runTwoSampleT(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  request: TwoSampleTRequest;
}): Promise<{ ok: true; result: TwoSampleTResponse }> {
  const ctx = await requireAuthContext();
  const { db, gateway } = makeGateway(ctx.workspace.id, ctx.user.id);
  const result = await gateway.twoSampleT(input.request);
  const path = topicPath(input.phaseSlug, input.sectionSlug, input.topicSlug);
  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const content: TwoSampleTContent = { input: input.request, result };
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
