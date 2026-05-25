"use client";

import Link from "next/link";
import { Button, Card } from "@sigmafy/ui";
import type { CatalogTool } from "@sigmafy/stats-gateway";
import type { RunToolResult } from "../_actions/run-tool";
import { PlotlyChart } from "./plotly-chart";

export function ToolResult({
  result,
  tool: _tool,
}: {
  result: RunToolResult;
  tool: CatalogTool;
}) {
  if (!result.ok) {
    // Special case: anonymous user hit "Run". Show a friendly gate, not an error.
    if (result.code === "activation_required") {
      return (
        <Card className="p-6">
          <h3 className="text-base font-semibold text-fg">Activate to run</h3>
          <p className="mt-2 text-sm text-muted">
            You can browse the full catalogue and explore every tool freely.
            To actually run an analysis and save results to your workspace,
            activate a free Sigmafy Studio account.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/sign-up">Activate — free during beta</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted">
            Free during beta. Every run is logged to your private workspace
            with a unique request ID you can trace back to the stats engine.
          </p>
        </Card>
      );
    }

    return (
      <Card className="border-border-strong bg-surface-1 p-5">
        <h3 className="text-sm font-semibold text-fg">Error</h3>
        <p className="mt-1 text-sm text-muted">{result.message}</p>
        <p className="mt-2 text-xs text-muted">
          code: <code>{result.code}</code>
          {result.requestId && (
            <>
              {" · "}request_id: <code>{result.requestId}</code>
            </>
          )}
        </p>
      </Card>
    );
  }

  const body = result.result as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return (
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-fg">Result</h3>
        <pre className="mt-3 overflow-auto text-xs">{JSON.stringify(body, null, 2)}</pre>
      </Card>
    );
  }

  // Detect a Plotly figure either as `body.figure` or as a top-level
  // {data, layout} shape (the Python /api/v1/graph/* endpoints return
  // the latter form).
  const figure = (body.figure as { data?: unknown[]; layout?: unknown } | undefined) ??
    (body.data && body.layout ? (body as { data?: unknown[]; layout?: unknown }) : undefined);

  // Scalar fields = the small numeric / string things worth showing in a
  // table. Skip arrays/objects bigger than ~12 entries (they belong in
  // the raw-JSON dump or are part of the figure already).
  const scalars: Array<[string, unknown]> = [];
  for (const [key, val] of Object.entries(body)) {
    if (key === "figure" || key === "data" || key === "layout") continue;
    if (val === null || typeof val !== "object") {
      scalars.push([key, val]);
    } else if (Array.isArray(val) && val.length <= 12) {
      scalars.push([key, val]);
    }
  }

  return (
    <div className="space-y-4">
      {figure && (
        <Card className="p-5">
          <PlotlyChart figure={figure as { data?: unknown[]; layout?: Record<string, unknown> }} />
        </Card>
      )}

      {scalars.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-fg">Results</h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {scalars.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-border-subtle/50 py-1">
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="text-xs font-mono text-fg">{formatValue(v)}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      <details className="text-xs text-muted">
        <summary className="cursor-pointer hover:text-fg">Run details</summary>
        <div className="mt-2 space-y-1">
          <div>
            run_id: <code>{result.runId}</code>
          </div>
          {result.requestId && (
            <div>
              request_id: <code>{result.requestId}</code>
            </div>
          )}
        </div>
      </details>

      <details className="text-xs text-muted">
        <summary className="cursor-pointer hover:text-fg">Raw JSON response</summary>
        <pre className="mt-2 overflow-auto rounded-md bg-surface-1 p-3">
          {JSON.stringify(body, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return String(v);
    if (Math.abs(v) >= 1e6 || (Math.abs(v) < 1e-3 && v !== 0)) {
      return v.toExponential(4);
    }
    return v.toFixed(Math.abs(v) < 1 ? 6 : 4).replace(/\.?0+$/, "");
  }
  if (Array.isArray(v)) {
    return v.length <= 6 ? JSON.stringify(v) : `[…${v.length} items]`;
  }
  return JSON.stringify(v);
}
