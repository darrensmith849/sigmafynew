import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@sigmafy/ui";
import { schema } from "@sigmafy/db";
import { getAdminUser } from "@/lib/admin-auth";
import { getServiceDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/sign-in");

  const db = getServiceDb();
  const entries = await db
    .select({
      id: schema.auditLog.id,
      action: schema.auditLog.action,
      targetResource: schema.auditLog.targetResource,
      justification: schema.auditLog.justification,
      ip: schema.auditLog.ip,
      createdAt: schema.auditLog.createdAt,
      actorEmail: schema.users.email,
      targetWorkspaceSlug: schema.workspaces.slug,
    })
    .from(schema.auditLog)
    .leftJoin(schema.users, eq(schema.auditLog.actorUserId, schema.users.id))
    .leftJoin(
      schema.workspaces,
      eq(schema.auditLog.targetWorkspaceId, schema.workspaces.id),
    )
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(100);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-12">
      <header>
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-sigmafyBlue-600"
        >
          ← All tenants
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Audit log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last 100 service-role and admin events. Read-only.
        </p>
      </header>

      <Card>
        <CardContent className="grid gap-2 p-4 text-sm">
          {entries.length === 0 && (
            <p className="text-muted-foreground">No audit entries yet.</p>
          )}
          {entries.map((e) => (
            <div
              key={e.id}
              className="grid gap-1 border-b border-border/40 pb-2 last:border-0 last:pb-0"
            >
              <div className="flex justify-between">
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-foreground">
                  {e.action}
                </code>
                <span className="text-xs text-muted-foreground">
                  {new Date(e.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                actor: {e.actorEmail ?? "(system)"}
                {e.targetWorkspaceSlug && (
                  <> · target: <code>{e.targetWorkspaceSlug}</code></>
                )}
                {e.targetResource && <> · resource: {e.targetResource}</>}
                {e.ip && <> · ip: {e.ip}</>}
                {e.justification && <> · note: {e.justification}</>}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
