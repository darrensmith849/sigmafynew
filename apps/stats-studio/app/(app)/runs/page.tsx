import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { withWorkspace, schema } from "@sigmafy/db";
import { Card, Chip, Eyebrow } from "@sigmafy/ui";
import { getAppDb } from "@/lib/db";
import { requireAuthContext } from "@/lib/auth";

export const metadata = { title: "My runs — Sigmafy Statistics Studio" };

const PAGE_SIZE = 50;

export default async function RunsPage() {
  const ctx = await requireAuthContext();
  const db = getAppDb();

  const rows = await withWorkspace(db, ctx.workspace.id, async (tx) =>
    tx
      .select()
      .from(schema.statsToolRuns)
      .where(eq(schema.statsToolRuns.workspaceId, ctx.workspace.id))
      .orderBy(desc(schema.statsToolRuns.createdAt))
      .limit(PAGE_SIZE),
  );

  return (
    <section className="mx-auto max-w-shell px-5 py-10 sm:px-8 lg:py-14">
      <Eyebrow>My runs</Eyebrow>
      <h1 className="h-display-md mt-2 text-fg">Recent statistical analyses</h1>
      <p className="t-lede mt-3 max-w-2xl text-muted">
        Every run from your workspace, latest first. Click a row to re-open the result.
      </p>

      {rows.length === 0 ? (
        <Card className="mt-8 p-8 text-center">
          <p className="text-sm text-muted">
            No runs yet.{" "}
            <Link href="/catalog" className="text-accent hover:underline">
              Pick a tool from the catalogue
            </Link>{" "}
            to get started.
          </p>
        </Card>
      ) : (
        <div className="mt-8 overflow-hidden rounded-card border border-border-subtle">
          <table className="w-full text-sm">
            <thead className="bg-surface-1 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-muted">When</th>
                <th className="px-4 py-2 font-medium text-muted">Tool</th>
                <th className="px-4 py-2 font-medium text-muted">Status</th>
                <th className="px-4 py-2 font-medium text-muted">Duration</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border-subtle/50 hover:bg-surface-1">
                  <td className="px-4 py-2">
                    <Link
                      href={`/runs/${r.id}` as never}
                      className="block text-xs text-muted hover:text-fg"
                    >
                      {r.createdAt.toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/runs/${r.id}` as never}
                      className="block font-mono text-xs text-fg hover:text-accent"
                    >
                      {r.toolSlug}
                    </Link>
                    {r.toolCategory && (
                      <div className="text-[10px] text-muted">{r.toolCategory}</div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Chip
                      className={
                        r.status === "completed"
                          ? "bg-surface-2 text-xs text-fg"
                          : "bg-surface-2 text-xs text-muted"
                      }
                    >
                      {r.status}
                    </Chip>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted">
                    {r.durationMs != null ? `${r.durationMs} ms` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
