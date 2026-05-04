"use server";

import { revalidatePath } from "next/cache";
import { schema, withWorkspace, topicPath } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

export interface SipocContent {
  suppliers: string[];
  inputs: string[];
  process: string[];
  outputs: string[];
  customers: string[];
}

export async function saveSipoc(input: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topicSlug: string;
  content: SipocContent;
}): Promise<{ ok: true }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const path = topicPath(input.phaseSlug, input.sectionSlug, input.topicSlug);

  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    await tx.insert(schema.topicSolutions).values({
      workspaceId: ctx.workspace.id,
      projectId: input.projectId,
      topicPath: path,
      userId: ctx.user.id,
      content: input.content,
      status: "submitted",
    });
  });

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true };
}
