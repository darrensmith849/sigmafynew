import Link from "next/link";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { schema, withWorkspace } from "@sigmafy/db";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ClassRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  starts_on: string | null;
  ends_on: string | null;
  member_count: number;
  delegate_count: number;
}

export default async function ClassesPage() {
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
  const classes = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const result = await tx.execute<ClassRow & Record<string, unknown>>(sql`
      SELECT
        c.id, c.slug, c.name, c.description, c.starts_on, c.ends_on,
        COALESCE((SELECT COUNT(*) FROM ${schema.classEnrolments} e WHERE e.class_id = c.id), 0)::int AS member_count,
        COALESCE((SELECT COUNT(*) FROM ${schema.classEnrolments} e WHERE e.class_id = c.id AND e.role = 'delegate'), 0)::int AS delegate_count
      FROM ${schema.classes} c
      WHERE c.workspace_id::text = current_setting('app.current_workspace', true)
      ORDER BY c.created_at DESC
    `);
    return (result.rows ?? result) as ClassRow[];
  });

  return (
    <main className="mx-auto flex flex-col gap-8 max-w-4xl px-6 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Classes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Group delegates into a cohort with shared start/end dates and a
            shared trainer + sponsor.
          </p>
        </div>
        <Link href="/dashboard/classes/new">
          <Button>New class</Button>
        </Link>
      </header>

      <section className="grid gap-3">
        {classes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No classes yet. <Link href="/dashboard/classes/new" className="font-medium text-sigmafyBlue-600 hover:underline">Create your first class</Link>.
            </CardContent>
          </Card>
        ) : (
          classes.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle>
                  <Link
                    href={`/dashboard/classes/${c.id}` as never}
                    className="hover:text-sigmafyBlue-600"
                  >
                    {c.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1 text-sm text-muted-foreground sm:flex sm:items-center sm:justify-between">
                <span>
                  <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">{c.slug}</code>
                  {" · "}
                  {c.delegate_count} delegate{c.delegate_count === 1 ? "" : "s"}
                  {" · "}
                  {c.member_count} total member{c.member_count === 1 ? "" : "s"}
                </span>
                <span className="text-xs">
                  {c.starts_on && c.ends_on
                    ? `${new Date(c.starts_on).toLocaleDateString()} → ${new Date(c.ends_on).toLocaleDateString()}`
                    : c.starts_on
                      ? `from ${new Date(c.starts_on).toLocaleDateString()}`
                      : "no schedule yet"}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
