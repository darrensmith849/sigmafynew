import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
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

export default async function WorkspaceDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const admin = await getAdminUser();
  if (!admin) redirect("/sign-in");

  const db = getServiceDb();

  const ws = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.id, params.id))
    .limit(1);
  const workspace = ws[0];
  if (!workspace) notFound();

  const [projects, memberships, recentSubmissions] = await Promise.all([
    db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.workspaceId, workspace.id))
      .orderBy(desc(schema.projects.createdAt)),
    db
      .select({
        id: schema.memberships.id,
        role: schema.memberships.role,
        createdAt: schema.memberships.createdAt,
        userEmail: schema.users.email,
        userFullName: schema.users.fullName,
      })
      .from(schema.memberships)
      .innerJoin(schema.users, eq(schema.memberships.userId, schema.users.id))
      .where(eq(schema.memberships.workspaceId, workspace.id)),
    db
      .select({
        id: schema.topicSolutions.id,
        topicPath: schema.topicSolutions.topicPath,
        status: schema.topicSolutions.status,
        submittedAt: schema.topicSolutions.submittedAt,
        grading: schema.topicSolutions.grading,
        userEmail: schema.users.email,
      })
      .from(schema.topicSolutions)
      .innerJoin(schema.users, eq(schema.topicSolutions.userId, schema.users.id))
      .where(eq(schema.topicSolutions.workspaceId, workspace.id))
      .orderBy(desc(schema.topicSolutions.submittedAt))
      .limit(10),
  ]);

  // Audit: admin viewed this workspace's data.
  await writeAuditLog({
    actorUserId: admin.sigmafyUserId,
    action: "admin.view_workspace",
    targetWorkspaceId: workspace.id,
    targetResource: `workspace:${workspace.slug}`,
  });

  const totalRoiCents = projects.reduce(
    (acc, p) => acc + (p.roiEstimatedZarCents ?? 0),
    0,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between">
        <div>
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-sigmafyBlue-600"
          >
            ← All tenants
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {workspace.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">{workspace.slug}</code>
            {" · "}
            Created {new Date(workspace.createdAt).toLocaleDateString()}
          </p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{memberships.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Annual ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {ZAR.format(totalRoiCents / 100)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Members</h2>
        <Card>
          <CardContent className="grid gap-2 p-4 text-sm">
            {memberships.map((m) => (
              <div key={m.id} className="flex justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
                <span>
                  {m.userFullName ?? m.userEmail}
                  <span className="ml-2 text-xs text-muted-foreground">{m.userEmail}</span>
                </span>
                <span className="rounded-full bg-sigmafyBlue-50 px-2 py-0.5 text-xs font-medium text-sigmafyBlue-700">
                  {m.role}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Card>
          <CardContent className="grid gap-2 p-4 text-sm">
            {projects.length === 0 && (
              <p className="text-muted-foreground">No projects.</p>
            )}
            {projects.map((p) => (
              <div key={p.id} className="flex justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
                <span>
                  {p.name}
                  <span className="ml-2 text-xs text-muted-foreground">{p.status}</span>
                </span>
                <span className="font-medium">
                  {p.roiEstimatedZarCents !== null && p.roiEstimatedZarCents !== undefined
                    ? `${ZAR.format(p.roiEstimatedZarCents / 100)}/yr`
                    : "—"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Recent topic submissions</h2>
        <Card>
          <CardContent className="grid gap-2 p-4 text-sm">
            {recentSubmissions.length === 0 && (
              <p className="text-muted-foreground">No submissions yet.</p>
            )}
            {recentSubmissions.map((s) => {
              const grading = s.grading as { decision?: string; score?: number } | null;
              return (
                <div key={s.id} className="flex justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <span>
                    <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">{s.topicPath}</code>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {s.userEmail} · {new Date(s.submittedAt).toLocaleString()}
                    </span>
                  </span>
                  {grading?.decision && (
                    <span className="text-xs font-medium">
                      {grading.decision} · {grading.score}/100
                    </span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
