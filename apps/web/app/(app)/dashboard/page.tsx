import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { schema, withWorkspace } from "@sigmafy/db";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { EmptyState } from "../_components/empty-state";

export const dynamic = "force-dynamic";

const ZAR = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

export default async function DashboardPage() {
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
  const projects = await withWorkspace(db, ctx.workspace.id, async (tx) =>
    tx.select().from(schema.projects).orderBy(schema.projects.createdAt),
  );

  const totalRoiCents = projects.reduce(
    (acc, p) => acc + (p.roiEstimatedZarCents ?? 0),
    0,
  );
  const projectsWithRoi = projects.filter(
    (p) => p.roiEstimatedZarCents !== null && p.roiEstimatedZarCents !== undefined,
  ).length;

  return (
    <main className="mx-auto flex flex-col gap-8 max-w-4xl px-6 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Projects
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back{ctx.user.fullName ? `, ${ctx.user.fullName}` : ""}.
        </p>
      </header>

      <RoiSummary
        totalRoiZarRands={totalRoiCents / 100}
        projectsWithRoi={projectsWithRoi}
        totalProjects={projects.length}
      />

      <section className="grid gap-4">
        {projects.length === 0 ? (
          <EmptyState
            eyebrow="Get started"
            title="No projects yet"
            body="Projects belong to delegates enrolled in a class. Create a class first, then add delegates and they'll each get their own Green Belt project."
            actionHref="/dashboard/classes/new"
            actionLabel="Create a class"
          />
        ) : (
          projects.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/projects/${p.id}` as never} className="hover:text-fg">
                    {p.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {p.description ?? "Green Belt project"}
                </span>
                <span className="flex items-center gap-3">
                  <RoiBadge zarCents={p.roiEstimatedZarCents} />
                  <Link href={`/projects/${p.id}` as never}>
                    <Button variant="ghost" size="sm">Open</Button>
                  </Link>
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}

function RoiSummary(props: {
  totalRoiZarRands: number;
  projectsWithRoi: number;
  totalProjects: number;
}) {
  return (
    <Card className="border-border-subtle bg-surface-3/30">
      <CardHeader>
        <CardTitle>Estimated annual ROI</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {ZAR.format(props.totalRoiZarRands)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aggregate across the workspace.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {props.projectsWithRoi}/{props.totalProjects} project
          {props.totalProjects === 1 ? "" : "s"} with an ROI estimate
        </p>
      </CardContent>
    </Card>
  );
}

function RoiBadge({ zarCents }: { zarCents: number | null | undefined }) {
  if (zarCents === null || zarCents === undefined) {
    return (
      <span className="text-xs text-muted-foreground">No ROI yet</span>
    );
  }
  return (
    <span className="rounded-full bg-surface-3 px-3 py-1 text-xs font-medium text-fg">
      {ZAR.format(zarCents / 100)}/yr
    </span>
  );
}
