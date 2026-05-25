import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { withWorkspace, schema } from "@sigmafy/db";
import { Card, Chip, Eyebrow } from "@sigmafy/ui";
import { getAppDb } from "@/lib/db";
import { requireAuthContext } from "@/lib/auth";
// PlotlyChart now lives under the public (marketing) tool runner path
// because the catalogue + tool runner were opened to anonymous browsing
// in the 2026-05-24 refactor. Run history is still authenticated.
import { PlotlyChart } from "../../../(marketing)/t/[slug]/_components/plotly-chart";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireAuthContext();
  const db = getAppDb();

  const rows = await withWorkspace(db, ctx.workspace.id, async (tx) =>
    tx
      .select()
      .from(schema.statsToolRuns)
      .where(
        and(
          eq(schema.statsToolRuns.id, id),
          eq(schema.statsToolRuns.workspaceId, ctx.workspace.id),
        ),
      )
      .limit(1),
  );
  const run = rows[0];
  if (!run) notFound();

  const output = run.outputJson as Record<string, unknown> | null;
  const figure =
    output && typeof output === "object"
      ? ((output.figure as { data?: unknown[]; layout?: Record<string, unknown> } | undefined) ??
        (output.data && output.layout
          ? (output as { data?: unknown[]; layout?: Record<string, unknown> })
          : undefined))
      : undefined;

  return (
    <section className="mx-auto max-w-shell px-5 py-10 sm:px-8 lg:py-14">
      <nav className="mb-5 text-sm text-muted">
        <Link href="/runs" className="hover:text-fg">
          ← My runs
        </Link>
      </nav>

      <Eyebrow>{run.toolCategory ?? "Tool run"}</Eyebrow>
      <h1 className="h-display-md mt-2 text-fg font-mono">{run.toolSlug}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        <Chip className="bg-surface-2 text-xs">{run.status}</Chip>
        <span>{run.createdAt.toLocaleString()}</span>
        {run.durationMs != null && <span>{run.durationMs} ms</span>}
        {run.requestId && (
          <span>
            request_id: <code>{run.requestId}</code>
          </span>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {run.status === "failed" && (
          <Card className="border-border-strong bg-surface-1 p-5">
            <h3 className="text-sm font-semibold text-fg">Error</h3>
            <p className="mt-1 text-sm text-muted">{run.errorMessage}</p>
            <p className="mt-2 text-xs text-muted">
              code: <code>{run.errorCode}</code>
            </p>
          </Card>
        )}

        {figure && (
          <Card className="p-5">
            <PlotlyChart figure={figure} />
          </Card>
        )}

        <details className="text-xs text-muted">
          <summary className="cursor-pointer hover:text-fg">Input payload</summary>
          <pre className="mt-2 overflow-auto rounded-md bg-surface-1 p-3">
            {JSON.stringify(run.inputJson, null, 2)}
          </pre>
        </details>

        {output && (
          <details className="text-xs text-muted">
            <summary className="cursor-pointer hover:text-fg">Output payload</summary>
            <pre className="mt-2 overflow-auto rounded-md bg-surface-1 p-3">
              {JSON.stringify(output, null, 2)}
            </pre>
          </details>
        )}

        <div className="pt-3">
          <Link
            href={`/t/${run.toolSlug}` as never}
            className="text-sm text-accent hover:underline"
          >
            Run this tool again →
          </Link>
        </div>
      </div>
    </section>
  );
}
