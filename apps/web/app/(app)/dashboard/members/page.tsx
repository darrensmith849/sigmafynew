import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, desc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@sigmafy/ui";
import { schema, withWorkspace } from "@sigmafy/db";
import { bootstrapUserAndWorkspace } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { InviteForm } from "./_components/invite-form";
import { CancelInviteButton } from "./_components/cancel-invite-button";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
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
  const { members, pending } = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    const m = await tx
      .select({
        membershipId: schema.memberships.id,
        userId: schema.memberships.userId,
        role: schema.memberships.role,
        joinedAt: schema.memberships.createdAt,
        email: schema.users.email,
        fullName: schema.users.fullName,
      })
      .from(schema.memberships)
      .innerJoin(schema.users, eq(schema.memberships.userId, schema.users.id))
      .where(eq(schema.memberships.workspaceId, ctx.workspace.id))
      .orderBy(desc(schema.memberships.createdAt));

    const p = await tx
      .select()
      .from(schema.workspaceInvitations)
      .where(
        and(
          eq(schema.workspaceInvitations.workspaceId, ctx.workspace.id),
          eq(schema.workspaceInvitations.status, "pending"),
        ),
      )
      .orderBy(desc(schema.workspaceInvitations.createdAt));
    return { members: m, pending: p };
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header>
        <Link
          href="/dashboard"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-sigmafyBlue-600"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {ctx.workspace.name} members
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite trainers, sponsors and delegates by email. They join as
          soon as they accept the invitation.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Invite a new member</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteForm />
        </CardContent>
      </Card>

      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 p-4 text-sm">
            {pending.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <span className="font-medium">{inv.email}</span>
                  <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                    {inv.role}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    invited {new Date(inv.createdAt).toLocaleDateString()} · expires{" "}
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <CancelInviteButton invitationId={inv.id} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Members <span className="text-sm font-normal text-muted-foreground">({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 p-4 text-sm">
          {members.map((m) => (
            <div
              key={m.membershipId}
              className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0"
            >
              <div>
                <span className="font-medium">{m.fullName ?? m.email}</span>
                <span className="ml-2 text-xs text-muted-foreground">{m.email}</span>
              </div>
              <span className="rounded-full bg-sigmafyBlue-50 px-2 py-0.5 text-xs font-medium text-sigmafyBlue-700">
                {m.role}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
