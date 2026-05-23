import { eq } from "drizzle-orm";
import { getCurrentUser } from "@sigmafy/auth/server";
import { schema } from "@sigmafy/db";
import type { SigmafyAuthContext } from "@sigmafy/auth";
import { getServiceDb } from "./db";

/**
 * Hydrate { user, workspace, role } for the current Clerk session.
 *
 * Service-role lookup justified by ADR 0003: workspace context isn't known
 * yet, so RLS can't scope. Scope is bounded by the authenticated Clerk id.
 *
 * Throws `not_signed_in` if the request isn't authenticated, or
 * `no_workspace` if the user exists but has no membership yet (the
 * caller should bootstrap, then retry).
 */
export async function requireAuthContext(): Promise<SigmafyAuthContext> {
  const clerkUser = await getCurrentUser();
  if (!clerkUser) throw new Error("not_signed_in");

  const svc = getServiceDb();

  // Find or create the Sigmafy user row
  const userRows = await svc
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkUserId, clerkUser.id))
    .limit(1);
  let user = userRows[0];
  if (!user) {
    const inserted = await svc
      .insert(schema.users)
      .values({
        clerkUserId: clerkUser.id,
        email: clerkUser.email,
        fullName: clerkUser.fullName,
      })
      .returning();
    user = inserted[0]!;
  }

  const memberships = await svc
    .select({ workspace: schema.workspaces, role: schema.memberships.role })
    .from(schema.memberships)
    .innerJoin(schema.workspaces, eq(schema.memberships.workspaceId, schema.workspaces.id))
    .where(eq(schema.memberships.userId, user.id))
    .limit(1);

  const m = memberships[0];
  if (!m) throw new Error("no_workspace");

  return {
    user: { id: user.id, email: user.email, fullName: user.fullName },
    workspace: { id: m.workspace.id, slug: m.workspace.slug, name: m.workspace.name },
    role: m.role as SigmafyAuthContext["role"],
  };
}

/**
 * stats-studio's narrower first-login bootstrap. Creates user + workspace
 * + owner membership and nothing else — no starter project, no welcome
 * email, no AI templates. The full apps/web variant
 * (bootstrapUserAndWorkspace) does all of those for the SSA pilot's needs;
 * Studio users don't want a Green Belt project they didn't ask for.
 *
 * Idempotent — returns existing context if the user already has a workspace.
 */
export async function bootstrapStudioUser(): Promise<SigmafyAuthContext> {
  const clerkUser = await getCurrentUser();
  if (!clerkUser) throw new Error("not_signed_in");

  const svc = getServiceDb();

  // Upsert user
  const existing = await svc
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkUserId, clerkUser.id))
    .limit(1);
  let userId: string;
  if (existing[0]) {
    userId = existing[0].id;
  } else {
    const ins = await svc
      .insert(schema.users)
      .values({
        clerkUserId: clerkUser.id,
        email: clerkUser.email,
        fullName: clerkUser.fullName,
      })
      .returning();
    userId = ins[0]!.id;
  }

  // Already has a workspace?
  const existingMembership = await svc
    .select({ workspace: schema.workspaces, role: schema.memberships.role })
    .from(schema.memberships)
    .innerJoin(schema.workspaces, eq(schema.memberships.workspaceId, schema.workspaces.id))
    .where(eq(schema.memberships.userId, userId))
    .limit(1);
  if (existingMembership[0]) {
    const m = existingMembership[0];
    return {
      user: { id: userId, email: clerkUser.email, fullName: clerkUser.fullName },
      workspace: { id: m.workspace.id, slug: m.workspace.slug, name: m.workspace.name },
      role: m.role as SigmafyAuthContext["role"],
    };
  }

  // Create personal workspace
  const baseSlug =
    (clerkUser.email.split("@")[0] ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "user";
  const slug = `${baseSlug}-${userId.slice(0, 6)}`;
  const wsName = clerkUser.fullName ? `${clerkUser.fullName}'s Studio` : "Personal Studio";
  const wsRows = await svc
    .insert(schema.workspaces)
    .values({ slug, name: wsName })
    .returning();
  const workspace = wsRows[0]!;

  await svc.insert(schema.memberships).values({
    workspaceId: workspace.id,
    userId,
    role: "owner",
  });

  return {
    user: { id: userId, email: clerkUser.email, fullName: clerkUser.fullName },
    workspace: { id: workspace.id, slug: workspace.slug, name: workspace.name },
    role: "owner",
  };
}
