import Link from "next/link";
import type { schema } from "@sigmafy/db";

/**
 * Inline audit receipt for one stats engine call the agent made.
 *
 * Shown beneath the assistant message that issued the call. Surfaces
 * the procedure name + a few highlight values from the output JSON so
 * the user can sanity-check the model's interpretation against the
 * actual numbers. Clicking opens the full /runs/[id] detail.
 *
 * This is the thing that makes the agent's answer audit-defensible:
 * an FDA/IATF/ISO auditor can trace any quantitative claim back to a
 * `stats_tool_runs` row carrying the JSON input + JSON output that
 * actually executed against the Python engine.
 */
export function ToolRunReceipt({ run }: { run: schema.StatsToolRun }) {
  const highlights = extractHighlights(run.outputJson);
  const isFailure = run.status === "failed";

  return (
    <Link
      href={`/runs/${run.id}`}
      className={
        isFailure
          ? "block rounded-md border border-danger/40 bg-danger/5 px-3 py-2 hover:border-danger"
          : "block rounded-md border border-border-subtle bg-bg-elev px-3 py-2 hover:border-accent"
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span
            className={
              isFailure
                ? "rounded-sm bg-danger/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-danger"
                : "rounded-sm bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent"
            }
          >
            {isFailure ? "failed" : "receipt"}
          </span>
          <span className="font-mono text-xs text-fg">{run.toolSlug}</span>
        </div>
        <span className="text-xs text-muted">view →</span>
      </div>
      {!isFailure && highlights.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {highlights.map(({ key, value }) => (
            <li key={key} className="font-mono">
              <span className="text-muted/70">{key}</span>={" "}
              <span className="text-fg">{value}</span>
            </li>
          ))}
        </ul>
      )}
      {isFailure && run.errorMessage && (
        <p className="mt-1 text-xs text-danger">{run.errorMessage}</p>
      )}
    </Link>
  );
}

/**
 * Pick a few well-known headline fields from the output JSON to show
 * inline. Walks one level deep — most stats-engine outputs have the
 * key results at the top of the object.
 */
function extractHighlights(
  output: unknown,
): { key: string; value: string }[] {
  if (!output || typeof output !== "object") return [];
  const obj = output as Record<string, unknown>;
  const HEADLINE_KEYS = [
    "p_value",
    "cpk",
    "cp",
    "ppk",
    "pp",
    "chi2_statistic",
    "reliability",
    "z_interference",
    "t_statistic",
    "f_statistic",
    "ad_statistic",
    "mean",
    "median",
    "verdict",
    "best_fit",
    "n",
    "df",
    "process_z",
    "ppm",
    "dpu",
    "dpmo",
    "required_sample_size",
    "reject_h0",
  ];
  const out: { key: string; value: string }[] = [];
  for (const k of HEADLINE_KEYS) {
    if (k in obj) {
      const v = obj[k];
      if (v === null || v === undefined) continue;
      out.push({ key: k, value: formatValue(v) });
      if (out.length >= 5) break;
    }
  }
  return out;
}

function formatValue(v: unknown): string {
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return String(v);
    if (Math.abs(v) < 0.0001 && v !== 0) return v.toExponential(3);
    if (Math.abs(v) < 100) return v.toFixed(4).replace(/\.?0+$/, "");
    return v.toFixed(2);
  }
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "string") return v.length > 30 ? v.slice(0, 27) + "…" : v;
  return JSON.stringify(v).slice(0, 30);
}
