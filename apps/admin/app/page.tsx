import Link from "next/link";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { schema } from "@sigmafy/db";
import { getAdminUser } from "@/lib/admin-auth";
import { getServiceDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ZAR = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

interface WorkspaceRow extends Record<string, unknown> {
  id: string;
  slug: string;
  name: string;
  created_at: Date;
  member_count: number;
  project_count: number;
  total_roi_cents: number | string;
}

export default async function AdminHome() {
  const admin = await getAdminUser();
  if (!admin) redirect("/sign-in");

  const db = getServiceDb();
  const result = await db.execute<WorkspaceRow>(sql`
    SELECT
      w.id,
      w.slug,
      w.name,
      w.created_at,
      COALESCE((SELECT COUNT(*) FROM ${schema.memberships} m WHERE m.workspace_id = w.id), 0)::int AS member_count,
      COALESCE((SELECT COUNT(*) FROM ${schema.projects} p WHERE p.workspace_id = w.id), 0)::int AS project_count,
      COALESCE((SELECT SUM(roi_estimated_zar_cents) FROM ${schema.projects} p WHERE p.workspace_id = w.id), 0)::bigint AS total_roi_cents
    FROM ${schema.workspaces} w
    ORDER BY w.created_at DESC
  `);
  const rows = (result.rows ?? result) as WorkspaceRow[];

  // Audit: admin viewed the tenant directory.
  await writeAuditLog({
    actorUserId: admin.sigmafyUserId,
    action: "admin.list_workspaces",
    targetResource: "workspace_directory",
  });

  const totalRoiCents = rows.reduce((acc, w) => acc + Number(w.total_roi_cents ?? 0), 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-sigmafyBlue-500">
            Sigmafy Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Tenants
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {admin.email}. Every workspace view is audit-logged.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/audit-log"
            className="text-sm font-medium text-muted-foreground hover:text-sigmafyBlue-600"
          >
            Audit log
          </Link>
          <UserButton />
        </div>
      </header>

      <Card className="border-sigmafyBlue-100 bg-sigmafyBlue-50/30">
        <CardHeader>
          <CardTitle>Platform totals</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {rows.length}
            </p>
            <p className="text-xs text-muted-foreground">workspaces</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {ZAR.format(totalRoiCents / 100)}
            </p>
            <p className="text-xs text-muted-foreground">aggregate estimated annual ROI</p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-3">
        {rows.map((w) => (
          <Card key={w.id}>
            <CardHeader>
              <CardTitle>
                <Link
                  href={`/workspaces/${w.id}` as never}
                  className="hover:text-sigmafyBlue-600"
                >
                  {w.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm text-muted-foreground sm:flex sm:items-center sm:justify-between">
              <span>
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">{w.slug}</code>{" "}
                · {w.member_count} member{w.member_count === 1 ? "" : "s"} ·{" "}
                {w.project_count} project{w.project_count === 1 ? "" : "s"}
              </span>
              <span className="font-medium text-foreground">
                {Number(w.total_roi_cents ?? 0) > 0
                  ? `${ZAR.format(Number(w.total_roi_cents) / 100)}/yr`
                  : "No ROI estimate"}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
