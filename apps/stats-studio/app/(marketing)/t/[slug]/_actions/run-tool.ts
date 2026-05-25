"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { withWorkspace, schema } from "@sigmafy/db";
import {
  createDbQuotaChecker,
  createDbStatsLogger,
  createStatsGateway,
  fetchCatalog,
  StatsGatewayError,
} from "@sigmafy/stats-gateway";
import { getAppDb } from "@/lib/db";
import { requireAuthContext } from "@/lib/auth";

const STATS_API_BASE_URL = process.env.STATS_API_BASE_URL ?? "https://sigmafy-tools.fly.dev";

// Soft cap on stored output_json — see ADR 0010. Plotly figures can be
// several hundred KB; we keep the immediate response intact but truncate
// on disk so the runs history doesn't bloat.
const MAX_OUTPUT_BYTES = 256 * 1024;

export interface RunToolInput {
  slug: string;
  payload: Record<string, unknown>;
}

export interface RunToolSuccess {
  ok: true;
  runId: string;
  requestId: string | null;
  result: unknown;
}

export interface RunToolFailure {
  ok: false;
  runId: string | null;
  code: string;
  message: string;
  requestId: string | null;
}

export type RunToolResult = RunToolSuccess | RunToolFailure;

/**
 * Run any of the 288 stats-engine tools by slug.
 *
 * Goes through the gateway's generic run() (bypasses the 7-tool typed
 * allowlist — Studio is the catalog-wide surface; see ADR 0010). The
 * generic run() still enforces quota + writes a stats_call_log audit row.
 *
 * After the gateway returns, we insert one row into stats_tool_runs
 * (workspace-scoped via withWorkspace) so the user sees the run in their
 * history. We do NOT wrap the gateway call itself in withWorkspace because
 * the gateway's logger opens its own transaction — see ADR 0010 §
 * "Transaction boundary with the audit logger".
 *
 * Gating model (2026-05-24): the catalogue + every tool page are PUBLIC.
 * Anonymous visitors can land here. We intercept and return
 * `activation_required` instead of throwing, so the client form can
 * render a friendly "Activate to run" CTA rather than an error.
 */
export async function runTool(input: RunToolInput): Promise<RunToolResult> {
  let ctx;
  try {
    ctx = await requireAuthContext();
  } catch (exc) {
    if (
      exc instanceof Error &&
      (exc.message === "not_signed_in" || exc.message === "no_workspace")
    ) {
      return {
        ok: false,
        runId: null,
        code: "activation_required",
        message: "Sign in or activate your workspace to run this tool.",
        requestId: null,
      };
    }
    throw exc;
  }
  const db = getAppDb();

  // Look up the tool in the catalog so we can persist `tool_category` and
  // double-check the slug is something the engine knows about.
  const catalog = await fetchCatalog({ baseUrl: STATS_API_BASE_URL });
  const tool = catalog.bySlug.get(input.slug);
  if (!tool) {
    return {
      ok: false,
      runId: null,
      code: "tool_not_found",
      message: `Tool '${input.slug}' is not in the catalogue.`,
      requestId: null,
    };
  }

  const gateway = createStatsGateway({
    baseUrl: STATS_API_BASE_URL,
    auth: { workspaceId: ctx.workspace.id, userId: ctx.user.id },
    // stats_call_log audit row per call — feeds the quota checker below.
    logger: createDbStatsLogger(db),
    // Per-workspace daily quota enforced from stats_call_log + workspace.quota_tier.
    quotaChecker: createDbQuotaChecker(db),
    signingSecret: process.env.STATS_API_SIGNING_SECRET,
  });

  let runId: string | null = null;
  try {
    const { result, requestId } = await gateway.run(input.slug, input.payload);
    const durationMs = 0; // gateway records actual latency in stats_call_log
    const truncated = byteSize(result) > MAX_OUTPUT_BYTES;
    const persistedOutput = truncated ? { truncated: true } : (result as object);

    runId = await withWorkspace(db, ctx.workspace.id, async (tx) => {
      const inserted = await tx
        .insert(schema.statsToolRuns)
        .values({
          workspaceId: ctx.workspace.id,
          userId: ctx.user.id,
          toolSlug: input.slug,
          toolCategory: tool.category,
          inputJson: input.payload,
          outputJson: persistedOutput as unknown as Record<string, unknown>,
          status: "completed",
          requestId,
          durationMs,
        })
        .returning({ id: schema.statsToolRuns.id });
      return inserted[0]!.id;
    });

    revalidatePath("/runs");
    return { ok: true, runId, requestId, result };
  } catch (exc) {
    const isGatewayErr = exc instanceof StatsGatewayError;
    const code = isGatewayErr ? exc.code : "unknown_error";
    const message = exc instanceof Error ? exc.message : String(exc);
    const requestId = isGatewayErr ? exc.requestId : null;

    // Still persist the failure so the user sees it in history.
    try {
      runId = await withWorkspace(db, ctx.workspace.id, async (tx) => {
        const inserted = await tx
          .insert(schema.statsToolRuns)
          .values({
            workspaceId: ctx.workspace.id,
            userId: ctx.user.id,
            toolSlug: input.slug,
            toolCategory: tool.category,
            inputJson: input.payload,
            outputJson: null,
            status: "failed",
            errorCode: code,
            errorMessage: message,
            requestId,
          })
          .returning({ id: schema.statsToolRuns.id });
        return inserted[0]!.id;
      });
    } catch {
      // Persisting the failure shouldn't itself hide the error from the user
    }

    revalidatePath("/runs");
    return { ok: false, runId, code, message, requestId };
  }
}

function byteSize(obj: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(obj)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

// Drizzle insert payload uses sql template tag implicitly for JSON; this
// keeps `sql` imported so tooling doesn't flag the import unused if we
// ever switch to raw sql here.
void sql;
