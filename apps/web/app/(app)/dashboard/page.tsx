import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { schema, withWorkspace } from "@sigmafy/db";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-sigmafyBlue-500">
            {ctx.workspace.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back{ctx.user.fullName ? `, ${ctx.user.fullName}` : ""}.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/members"
            className="text-sm font-medium text-muted-foreground hover:text-sigmafyBlue-600"
          >
            Members
          </Link>
          <UserButton />
        </div>
      </header>

      <RoiSummary
        totalRoiZarRands={totalRoiCents / 100}
        projectsWithRoi={projectsWithRoi}
        totalProjects={projects.length}
      />

      <section className="grid gap-4">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No projects yet.
            </CardContent>
          </Card>
        ) : (
          projects.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/projects/${p.id}` as never} className="hover:text-sigmafyBlue-600">
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
    <Card className="border-sigmafyBlue-100 bg-sigmafyBlue-50/30">
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
    <span className="rounded-full bg-sigmafyBlue-50 px-3 py-1 text-xs font-medium text-sigmafyBlue-700">
      {ZAR.format(zarCents / 100)}/yr
    </span>
  );
}
