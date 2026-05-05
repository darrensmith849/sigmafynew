"use server";

import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb } from "@/lib/db";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export type EnrolRole = "delegate" | "trainer" | "sponsor";

export async function createClass(input: {
  name: string;
  description?: string;
  startsOn?: string; // YYYY-MM-DD
  endsOn?: string;
}): Promise<{ ok: true; classId: string; slug: string }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();

  const name = input.name.trim();
  if (!name) throw new Error("Class name is required.");
  let slug = slugify(name);
  if (!slug) slug = "class";
  if (!SLUG_RE.test(slug)) {
    throw new Error("Generated slug is invalid. Use a more standard class name.");
  }

  const classId = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    // De-collide by appending -2, -3 if needed.
    let candidate = slug;
    let suffix = 2;
    while (true) {
      const existing = await tx
        .select({ id: schema.classes.id })
        .from(schema.classes)
        .where(
          and(
            eq(schema.classes.workspaceId, ctx.workspace.id),
            eq(schema.classes.slug, candidate),
          ),
        )
        .limit(1);
      if (!existing[0]) break;
      candidate = `${slug}-${suffix++}`;
      if (suffix > 50) throw new Error("Couldn't pick a unique slug — pick a different name.");
    }
    slug = candidate;

    const ins = await tx
      .insert(schema.classes)
      .values({
        workspaceId: ctx.workspace.id,
        slug,
        name,
        description: input.description?.trim() || null,
        startsOn: input.startsOn || null,
        endsOn: input.endsOn || null,
      })
      .returning({ id: schema.classes.id });
    return ins[0]!.id;
  });

  revalidatePath("/dashboard/classes");
  return { ok: true, classId, slug };
}

/**
 * Enrol an existing workspace member into a class.
 *
 * If `role === "delegate"` and `spawnProject === true`, also creates a Green
 * Belt project for the delegate inside the same workspace and links it via
 * `class_enrolments.project_id`. This is the SSA flow: SSA admin enrols a
 * delegate, project is ready for them when they sign in.
 */
export async function enrolMember(input: {
  classId: string;
  userId: string;
  role: EnrolRole;
  spawnProject?: boolean;
}): Promise<{ ok: true; enrolmentId: string }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const spawn = input.spawnProject ?? input.role === "delegate";

  const enrolmentId = await withWorkspace(db, ctx.workspace.id, async (tx) => {
    // Confirm class belongs to current workspace
    const cls = await tx
      .select({ id: schema.classes.id, name: schema.classes.name })
      .from(schema.classes)
      .where(
        and(
          eq(schema.classes.id, input.classId),
          eq(schema.classes.workspaceId, ctx.workspace.id),
        ),
      )
      .limit(1);
    if (!cls[0]) throw new Error("Class not found in this workspace.");

    // Confirm target user is a member of this workspace
    const memb = await tx
      .select({ id: schema.memberships.id })
      .from(schema.memberships)
      .where(
        and(
          eq(schema.memberships.workspaceId, ctx.workspace.id),
          eq(schema.memberships.userId, input.userId),
        ),
      )
      .limit(1);
    if (!memb[0]) throw new Error("User is not a member of this workspace yet.");

    // Already enrolled?
    const existing = await tx
      .select({ id: schema.classEnrolments.id })
      .from(schema.classEnrolments)
      .where(
        and(
          eq(schema.classEnrolments.classId, input.classId),
          eq(schema.classEnrolments.userId, input.userId),
        ),
      )
      .limit(1);
    if (existing[0]) return existing[0].id;

    // Spawn project if delegate
    let projectId: string | null = null;
    if (spawn && input.role === "delegate") {
      const tplRows = await tx.execute<{ id: string; version: number }>(sql`
        SELECT id, version FROM project_templates
        WHERE workspace_id IS NULL AND slug = 'green-belt'
        ORDER BY version DESC LIMIT 1
      `);
      const tpl = tplRows.rows[0];
      if (tpl) {
        const userRows = await tx
          .select({ fullName: schema.users.fullName, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, input.userId))
          .limit(1);
        const u = userRows[0];
        const projectRows = await tx
          .insert(schema.projects)
          .values({
            workspaceId: ctx.workspace.id,
            templateId: tpl.id,
            templateVersion: tpl.version,
            ownerUserId: input.userId,
            name: `${u?.fullName ?? u?.email ?? "Delegate"} — ${cls[0].name}`,
            description: `Green Belt project for ${cls[0].name}.`,
            status: "active",
          })
          .returning({ id: schema.projects.id });
        projectId = projectRows[0]!.id;
      }
    }

    const ins = await tx
      .insert(schema.classEnrolments)
      .values({
        classId: input.classId,
        userId: input.userId,
        role: input.role,
        projectId,
      })
      .returning({ id: schema.classEnrolments.id });
    return ins[0]!.id;
  });

  revalidatePath("/dashboard/classes");
  revalidatePath(`/dashboard/classes/${input.classId}`);
  return { ok: true, enrolmentId };
}

export async function removeEnrolment(enrolmentId: string, classId: string): Promise<{ ok: true }> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  await withWorkspace(db, ctx.workspace.id, async (tx) => {
    await tx
      .delete(schema.classEnrolments)
      .where(eq(schema.classEnrolments.id, enrolmentId));
  });
  revalidatePath(`/dashboard/classes/${classId}`);
  return { ok: true };
}
