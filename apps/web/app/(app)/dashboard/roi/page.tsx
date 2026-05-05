import Link from "next/link";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { schema, withWorkspace } from "@sigmafy/db";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const ZAR = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

const PHASE_ORDER = ["define", "measure", "analyse", "improve", "control", "executive-summary"];
const PHASE_LABEL: Record<string, string> = {
  define: "Define",
  measure: "Measure",
  analyse: "Analyse",
  improve: "Improve",
  control: "Control",
  "executive-summary": "Exec",
};

interface DelegateRow extends Record<string, unknown> {
  class_id: string | null;
  class_name: string | null;
  user_id: string;
  user_email: string;
  user_full_name: string | null;
  project_id: string | null;
  project_name: string | null;
  roi_cents: number | string | null;
}

interface ApprovalRow extends Record<string, unknown> {
  project_id: string;
  phase_slug: string;
  status: "pending" | "approved" | "rejected";
}

export default async function RoiPage() {
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
  const { delegateRows, approvalRows, classMeta, unassignedProjects } = await withWorkspace(
    db,
    ctx.workspace.id,
    async (tx) => {
      // Delegates enrolled in classes (joined to project + ROI)
      const delegates = await tx.execute<DelegateRow>(sql`
        SELECT
          c.id   AS class_id,
          c.name AS class_name,
          ce.user_id,
          u.email      AS user_email,
          u.full_name  AS user_full_name,
          ce.project_id,
          p.name             AS project_name,
          p.roi_estimated_zar_cents AS roi_cents
        FROM ${schema.classEnrolments} ce
        JOIN ${schema.classes} c ON c.id = ce.class_id
        JOIN ${schema.users} u ON u.id = ce.user_id
        LEFT JOIN ${schema.projects} p ON p.id = ce.project_id
        WHERE ce.role = 'delegate'
          AND c.workspace_id::text = current_setting('app.current_workspace', true)
        ORDER BY c.created_at DESC, u.email ASC
      `);

      // Class metadata for ordering / showing classes with no delegates yet
      const classes = await tx.execute<{
        id: string;
        name: string;
        starts_on: string | null;
        ends_on: string | null;
        delegate_count: number;
      } & Record<string, unknown>>(sql`
        SELECT
          c.id, c.name, c.starts_on, c.ends_on,
          COALESCE((SELECT COUNT(*) FROM ${schema.classEnrolments} e WHERE e.class_id = c.id AND e.role='delegate'), 0)::int AS delegate_count
        FROM ${schema.classes} c
        WHERE c.workspace_id::text = current_setting('app.current_workspace', true)
        ORDER BY c.created_at DESC
      `);

      // Phase approvals across the workspace
      const approvals = await tx.execute<ApprovalRow>(sql`
        SELECT project_id, phase_slug, status
        FROM ${schema.phaseApprovals}
        WHERE workspace_id::text = current_setting('app.current_workspace', true)
      `);

      // Projects in the workspace not linked to any class_enrolment
      const unassigned = await tx.execute<{
        id: string;
        name: string;
        owner_email: string;
        owner_full_name: string | null;
        roi_cents: number | string | null;
      } & Record<string, unknown>>(sql`
        SELECT
          p.id, p.name,
          u.email     AS owner_email,
          u.full_name AS owner_full_name,
          p.roi_estimated_zar_cents AS roi_cents
        FROM ${schema.projects} p
        JOIN ${schema.users} u ON u.id = p.owner_user_id
        WHERE p.workspace_id::text = current_setting('app.current_workspace', true)
          AND NOT EXISTS (
            SELECT 1 FROM ${schema.classEnrolments} ce WHERE ce.project_id = p.id
          )
        ORDER BY p.created_at DESC
      `);

      return {
        delegateRows: (delegates.rows ?? delegates) as DelegateRow[],
        approvalRows: (approvals.rows ?? approvals) as ApprovalRow[],
        classMeta: (classes.rows ?? classes) as Array<{
          id: string;
          name: string;
          starts_on: string | null;
          ends_on: string | null;
          delegate_count: number;
        }>,
        unassignedProjects: (unassigned.rows ?? unassigned) as Array<{
          id: string;
          name: string;
          owner_email: string;
          owner_full_name: string | null;
          roi_cents: number | string | null;
        }>,
      };
    },
  );

  // Build approval counts per project
  const approvedCount = new Map<string, Set<string>>();
  const pendingCount = new Map<string, Set<string>>();
  for (const a of approvalRows) {
    const map = a.status === "approved" ? approvedCount : a.status === "pending" ? pendingCount : null;
    if (!map) continue;
    if (!map.has(a.project_id)) map.set(a.project_id, new Set());
    map.get(a.project_id)!.add(a.phase_slug);
  }

  // Group delegates by class
  const delegatesByClass = new Map<string, DelegateRow[]>();
  for (const d of delegateRows) {
    const id = d.class_id ?? "_none";
    if (!delegatesByClass.has(id)) delegatesByClass.set(id, []);
    delegatesByClass.get(id)!.push(d);
  }

  const grandTotalCents =
    delegateRows.reduce((acc, d) => acc + Number(d.roi_cents ?? 0), 0) +
    unassignedProjects.reduce((acc, p) => acc + Number(p.roi_cents ?? 0), 0);

  return (
    <main className="mx-auto flex flex-col gap-8 max-w-5xl px-6 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          ROI dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estimated annual savings rolled up by class. Sponsors and admins see
          delegate progress alongside ROI.
        </p>
      </header>

      <Card className="border-sigmafyBlue-100 bg-sigmafyBlue-50/30">
        <CardHeader>
          <CardTitle>Workspace total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tracking-tight">
            {ZAR.format(grandTotalCents / 100)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            aggregated estimated annual ROI across every project in {ctx.workspace.name}
          </p>
        </CardContent>
      </Card>

      {classMeta.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No classes yet.{" "}
            <Link
              href="/dashboard/classes/new"
              className="font-medium text-sigmafyBlue-600 hover:underline"
            >
              Create your first class
            </Link>{" "}
            to start tracking cohort ROI.
          </CardContent>
        </Card>
      )}

      {classMeta.map((cls) => {
        const delegates = delegatesByClass.get(cls.id) ?? [];
        const classCents = delegates.reduce((acc, d) => acc + Number(d.roi_cents ?? 0), 0);
        return (
          <section key={cls.id} className="grid gap-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  <Link
                    href={`/dashboard/classes/${cls.id}` as never}
                    className="hover:text-sigmafyBlue-600"
                  >
                    {cls.name}
                  </Link>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {cls.delegate_count} delegate{cls.delegate_count === 1 ? "" : "s"}
                  {cls.starts_on && cls.ends_on && (
                    <>
                      {" · "}
                      {new Date(cls.starts_on).toLocaleDateString()} →{" "}
                      {new Date(cls.ends_on).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                {ZAR.format(classCents / 100)}
              </p>
            </div>
            <Card>
              <CardContent className="grid gap-2 p-4 text-sm">
                {delegates.length === 0 ? (
                  <p className="text-muted-foreground">No delegates enrolled yet.</p>
                ) : (
                  delegates.map((d) => (
                    <DelegateRow
                      key={d.user_id}
                      delegate={d}
                      approvedPhases={
                        d.project_id ? approvedCount.get(d.project_id) ?? new Set() : new Set()
                      }
                      pendingPhases={
                        d.project_id ? pendingCount.get(d.project_id) ?? new Set() : new Set()
                      }
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        );
      })}

      {unassignedProjects.length > 0 && (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Unassigned projects</h2>
          <Card>
            <CardContent className="grid gap-2 p-4 text-sm">
              {unassignedProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/projects/${p.id}` as never}
                      className="font-medium hover:text-sigmafyBlue-600"
                    >
                      {p.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.owner_full_name ?? p.owner_email}
                    </span>
                  </div>
                  <span className="font-medium">
                    {p.roi_cents
                      ? `${ZAR.format(Number(p.roi_cents) / 100)}/yr`
                      : "—"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}

function DelegateRow(props: {
  delegate: DelegateRow;
  approvedPhases: Set<string>;
  pendingPhases: Set<string>;
}) {
  const d = props.delegate;
  return (
    <div className="grid gap-2 border-b border-border/40 pb-3 last:border-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-medium">{d.user_full_name ?? d.user_email}</span>
          <span className="ml-2 text-xs text-muted-foreground">{d.user_email}</span>
          {d.project_id && (
            <Link
              href={`/projects/${d.project_id}` as never}
              className="ml-3 text-xs font-medium text-sigmafyBlue-600 hover:underline"
            >
              project →
            </Link>
          )}
        </div>
        <span className="text-sm font-medium">
          {d.roi_cents
            ? `${ZAR.format(Number(d.roi_cents) / 100)}/yr`
            : <span className="text-muted-foreground font-normal">No ROI yet</span>}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {PHASE_ORDER.map((phase) => {
          const approved = props.approvedPhases.has(phase);
          const pending = props.pendingPhases.has(phase);
          const cls = approved
            ? "bg-green-100 text-green-800 border-green-200"
            : pending
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-neutral-50 text-muted-foreground border-border";
          return (
            <span
              key={phase}
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
              title={
                approved ? "Approved" : pending ? "Pending sponsor review" : "Not submitted"
              }
            >
              {PHASE_LABEL[phase] ?? phase}
            </span>
          );
        })}
      </div>
    </div>
  );
}
