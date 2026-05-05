import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { schema, withWorkspace } from "@sigmafy/db";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { DecidePhaseForm } from "./_components/decide-phase-form";
import { EmptyState } from "../../_components/empty-state";

export const dynamic = "force-dynamic";

const PHASE_LABELS: Record<string, string> = {
  define: "Define",
  measure: "Measure",
  analyse: "Analyse",
  improve: "Improve",
  control: "Control",
  "executive-summary": "Executive Summary",
};

export default async function ApprovalsPage() {
  let ctx;
  try {
    ctx = await bootstrapUserAndWorkspace();
  } catch (err) {
    if (err instanceof Error && err.message === "not_signed_in") {
      redirect("/sign-in");
    }
    throw err;
  }

  const db = getAppDb();
  const pending = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    return await tx
      .select({
        id: schema.phaseApprovals.id,
        projectId: schema.phaseApprovals.projectId,
        phaseSlug: schema.phaseApprovals.phaseSlug,
        submittedAt: schema.phaseApprovals.submittedAt,
        projectName: schema.projects.name,
        ownerEmail: schema.users.email,
        ownerFullName: schema.users.fullName,
      })
      .from(schema.phaseApprovals)
      .innerJoin(schema.projects, eq(schema.phaseApprovals.projectId, schema.projects.id))
      .innerJoin(schema.users, eq(schema.projects.ownerUserId, schema.users.id))
      .where(
        and(
          eq(schema.phaseApprovals.workspaceId, ctx.workspace.id),
          eq(schema.phaseApprovals.status, "pending"),
        ),
      )
      .orderBy(desc(schema.phaseApprovals.submittedAt));
  });

  return (
    <main className="mx-auto flex flex-col gap-8 max-w-4xl px-6 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Pending phase approvals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Phases delegates have submitted for sponsor review. Approve or send
          back with notes.
        </p>
      </header>

      <section className="grid gap-3">
        {pending.length === 0 ? (
          <EmptyState
            eyebrow="All clear"
            title="All caught up"
            body="No phases are waiting for sponsor review right now. When a delegate submits a DMAIC phase, it will appear here for you to approve or send back with notes."
          />
        ) : (
          pending.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>
                  <Link
                    href={`/projects/${p.projectId}?phase=${p.phaseSlug}` as never}
                    className="hover:text-fg"
                  >
                    {p.projectName} — {PHASE_LABELS[p.phaseSlug] ?? p.phaseSlug}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <p className="text-muted-foreground">
                  Submitted by {p.ownerFullName ?? p.ownerEmail} ({p.ownerEmail}) ·
                  {" "}
                  {new Date(p.submittedAt).toLocaleString()}
                </p>
                <DecidePhaseForm projectId={p.projectId} phaseSlug={p.phaseSlug} />
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
