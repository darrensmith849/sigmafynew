"use server";

import { revalidatePath } from "next/cache";
import {
  createStatsGateway,
  createDbStatsLogger,
  type CapabilityRequest,
  type CapabilityResponse,
} from "@sigmafy/stats-gateway";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

export interface CapabilityTopicContent {
  input: CapabilityRequest;
  result: CapabilityResponse;
}

export async function runCapability(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  request: CapabilityRequest;
}): Promise<{ ok: true; result: CapabilityResponse }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const baseUrl = process.env.STATS_API_BASE_URL;
  if (!baseUrl) throw new Error("STATS_API_BASE_URL missing");

  const gateway = createStatsGateway({
    baseUrl,
    auth: { workspaceId: ctx.workspace.id, userId: ctx.user.id },
    logger: createDbStatsLogger(db),
  });
  const result = await gateway.capability(input.request);

  const path = topicPath(input.phaseSlug, input.sectionSlug, input.topicSlug);
  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const content: CapabilityTopicContent = { input: input.request, result };
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
