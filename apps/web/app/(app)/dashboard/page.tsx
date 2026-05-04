import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { schema, withWorkspace } from "@sigmafy/db";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

export const dynamic = "force-dynamic";

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
        <UserButton />
      </header>

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
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{p.description ?? "Green Belt project"}</span>
                <Link href={`/projects/${p.id}` as never}>
                  <Button variant="ghost" size="sm">Open</Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
