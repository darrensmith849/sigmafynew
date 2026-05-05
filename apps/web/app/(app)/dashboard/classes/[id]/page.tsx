import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { schema, withWorkspace } from "@sigmafy/db";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { EnrolMemberForm } from "../_components/enrol-member-form";
import { RemoveEnrolmentButton } from "../_components/remove-enrolment-button";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

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
  const data = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const cls = await tx
      .select()
      .from(schema.classes)
      .where(
        and(
          eq(schema.classes.id, params.id),
          eq(schema.classes.workspaceId, ctx.workspace.id),
        ),
      )
      .limit(1);
    if (!cls[0]) return null;

    const enrolments = await tx
      .select({
        id: schema.classEnrolments.id,
        role: schema.classEnrolments.role,
        enrolledAt: schema.classEnrolments.enrolledAt,
        userId: schema.classEnrolments.userId,
        userEmail: schema.users.email,
        userFullName: schema.users.fullName,
        projectId: schema.classEnrolments.projectId,
      })
      .from(schema.classEnrolments)
      .innerJoin(schema.users, eq(schema.classEnrolments.userId, schema.users.id))
      .where(eq(schema.classEnrolments.classId, params.id))
      .orderBy(desc(schema.classEnrolments.enrolledAt));

    const enrolledUserIds = new Set(enrolments.map((e) => e.userId));
    const allMembers = await tx
      .select({
        userId: schema.memberships.userId,
        email: schema.users.email,
        fullName: schema.users.fullName,
        role: schema.memberships.role,
      })
      .from(schema.memberships)
      .innerJoin(schema.users, eq(schema.memberships.userId, schema.users.id))
      .where(eq(schema.memberships.workspaceId, ctx.workspace.id));
    const eligible = allMembers.filter((m) => !enrolledUserIds.has(m.userId));

    return { cls: cls[0], enrolments, eligible };
  });

  if (!data) notFound();
  const { cls, enrolments, eligible } = data;

  const delegates = enrolments.filter((e) => e.role === "delegate");
  const trainers = enrolments.filter((e) => e.role === "trainer");
  const sponsors = enrolments.filter((e) => e.role === "sponsor");

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header>
        <Link
          href="/dashboard/classes"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-sigmafyBlue-600"
        >
          ← Classes
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {cls.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">{cls.slug}</code>
          {cls.startsOn && cls.endsOn && (
            <>
              {" · "}
              {new Date(cls.startsOn).toLocaleDateString()} →{" "}
              {new Date(cls.endsOn).toLocaleDateString()}
            </>
          )}
        </p>
        {cls.description && (
          <p className="mt-3 max-w-2xl text-sm text-foreground">{cls.description}</p>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Enrol a workspace member</CardTitle>
        </CardHeader>
        <CardContent>
          {eligible.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every workspace member is already enrolled.
              {" "}
              <Link
                href="/dashboard/members"
                className="font-medium text-sigmafyBlue-600 hover:underline"
              >
                Invite more members
              </Link>{" "}
              first.
            </p>
          ) : (
            <EnrolMemberForm
              classId={cls.id}
              eligible={eligible.map((m) => ({
                userId: m.userId,
                email: m.email,
                fullName: m.fullName,
                role: m.role,
              }))}
            />
          )}
        </CardContent>
      </Card>

      <RosterSection title="Delegates" enrolments={delegates} classId={cls.id} />
      <RosterSection title="Trainers" enrolments={trainers} classId={cls.id} />
      <RosterSection title="Sponsors" enrolments={sponsors} classId={cls.id} />
    </main>
  );
}

function RosterSection(props: {
  title: string;
  classId: string;
  enrolments: Array<{
    id: string;
    role: string;
    userEmail: string;
    userFullName: string | null;
    projectId: string | null;
  }>;
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">
        {props.title}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          ({props.enrolments.length})
        </span>
      </h2>
      <Card>
        <CardContent className="grid gap-2 p-4 text-sm">
          {props.enrolments.length === 0 ? (
            <p className="text-muted-foreground">None enrolled yet.</p>
          ) : (
            props.enrolments.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <span className="font-medium">{e.userFullName ?? e.userEmail}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{e.userEmail}</span>
                  {e.projectId && (
                    <Link
                      href={`/projects/${e.projectId}`}
                      className="ml-3 text-xs font-medium text-sigmafyBlue-600 hover:underline"
                    >
                      project
                    </Link>
                  )}
                </div>
                <RemoveEnrolmentButton enrolmentId={e.id} classId={props.classId} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
