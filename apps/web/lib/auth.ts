import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@sigmafy/auth/server";
import { schema } from "@sigmafy/db";
import type { SigmafyAuthContext } from "@sigmafy/auth";
import { getServiceDb } from "./db";

/**
 * Hydrate the active workspace + role for the current request.
 *
 * Phase 0A: every Sigmafy user is in exactly one workspace (created on signup).
 * Phase 0B: this becomes route-aware (subdomain or path prefix selects the workspace).
 *
 * Uses the service-role DB to look up the user + membership across workspaces.
 * Justification: bootstrap path — the user's workspace context isn't known yet,
 * so RLS doesn't have a workspace to scope by. The lookup is bounded by the
 * authenticated Clerk user id.
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

  // Find the user's workspace (Phase 0A: pick first; Phase 0B: route-aware)
  const memberships = await svc
    .select({
      workspace: schema.workspaces,
      role: schema.memberships.role,
    })
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
 * Bootstrap a new user: create the Sigmafy user row, create their personal
 * workspace, attach an "owner" membership, and create one starter Green Belt
 * project from the system template.
 *
 * Service-role justified: workspace doesn't exist yet, so RLS cannot scope it.
 * Idempotent: safe to call from a sign-up callback that may fire twice.
 */
export async function bootstrapUserAndWorkspace(): Promise<SigmafyAuthContext> {
  const clerkUser = await getCurrentUser();
  if (!clerkUser) throw new Error("not_signed_in");

  const svc = getServiceDb();

  // Upsert user
  const existingUser = await svc
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkUserId, clerkUser.id))
    .limit(1);
  let userId: string;
  if (existingUser[0]) {
    userId = existingUser[0].id;
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

  // Check existing membership
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

  // Create workspace from a derived slug (suffix with id chars to avoid collisions)
  const baseSlug = (clerkUser.email.split("@")[0] ?? "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "user";
  const slug = `${baseSlug}-${userId.slice(0, 6)}`;
  const wsName = clerkUser.fullName ? `${clerkUser.fullName}'s Workspace` : "My Workspace";
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

  // Find the system Green Belt template
  const tplRows = await svc.execute<{ id: string; version: number }>(sql`
    SELECT id, version FROM project_templates
    WHERE workspace_id IS NULL AND slug = 'green-belt'
    ORDER BY version DESC LIMIT 1
  `);
  const tpl = tplRows.rows[0];
  if (!tpl) throw new Error("green-belt template missing — run pnpm db:seed");

  // Spawn a starter project
  await svc.insert(schema.projects).values({
    workspaceId: workspace.id,
    templateId: tpl.id,
    templateVersion: tpl.version,
    ownerUserId: userId,
    name: "My First Green Belt Project",
    description: "Starter project. Edit or replace once you're ready.",
    status: "active",
  });

  return {
    user: { id: userId, email: clerkUser.email, fullName: clerkUser.fullName },
    workspace: { id: workspace.id, slug: workspace.slug, name: workspace.name },
    role: "owner",
  };
}
