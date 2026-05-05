"use server";

import { randomBytes } from "node:crypto";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { schema, withWorkspace } from "@sigmafy/db";
import { requireAuthContext } from "@/lib/auth";
import { getAppDb, getServiceDb } from "@/lib/db";
import { sendWorkspaceInvitationEmail } from "@/lib/email";
import type { InviteRole } from "./invite";

const INVITE_VALID_DAYS = 14;

export interface BulkInviteRow {
  email: string;
  role: InviteRole;
}

export type BulkInviteRowResult =
  | { email: string; status: "invited" | "reused" }
  | { email: string; status: "already_member" }
  | { email: string; status: "error"; error: string };

/**
 * Bulk-invite N members from a parsed CSV.
 *
 * Steps:
 *   1. De-dup by email (lowercased) within the input.
 *   2. For each row: skip if user is already a workspace member;
 *      reuse existing pending invitation token; otherwise create new.
 *   3. Send all invitation emails in parallel.
 *
 * Returns a per-row result so the UI can show what succeeded / was
 * skipped / failed.
 */
export async function bulkInvite(rows: BulkInviteRow[]): Promise<{
  ok: true;
  results: BulkInviteRowResult[];
}> {
  const ctx = await requireAuthContext();
  const db = getAppDb();
  const svc = getServiceDb();

  // De-dup + normalise
  const seen = new Set<string>();
  const cleaned: BulkInviteRow[] = [];
  const results: BulkInviteRowResult[] = [];
  for (const r of rows) {
    const email = r.email.trim().toLowerCase();
    if (!email.includes("@")) {
      results.push({ email: r.email, status: "error", error: "invalid email" });
      continue;
    }
    if (seen.has(email)) {
      results.push({ email, status: "error", error: "duplicate row" });
      continue;
    }
    seen.add(email);
    cleaned.push({ email, role: r.role });
  }

  // Find which emails are already workspace members (service-role lookup
  // since the membership rows reference users we may not be able to read
  // by email under app_user RLS scoping).
  const allEmails = cleaned.map((r) => r.email);
  const existingMembers = allEmails.length
    ? await svc
        .select({ email: schema.users.email })
        .from(schema.memberships)
        .innerJoin(schema.users, eq(schema.memberships.userId, schema.users.id))
        .where(
          and(
            eq(schema.memberships.workspaceId, ctx.workspace.id),
            inArray(schema.users.email, allEmails),
          ),
        )
    : [];
  const memberEmails = new Set(existingMembers.map((m) => m.email.toLowerCase()));

  // Per row: skip-if-member, otherwise upsert invitation.
  const toEmail: Array<{
    email: string;
    role: InviteRole;
    token: string;
  }> = [];
  for (const r of cleaned) {
    if (memberEmails.has(r.email)) {
      results.push({ email: r.email, status: "already_member" });
      continue;
    }
    const token = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + INVITE_VALID_DAYS * 24 * 60 * 60 * 1000);

    try {
      const res = await withWorkspace(db, ctx.workspace.id, async (tx) => {
        const existing = await tx
          .select()
          .from(schema.workspaceInvitations)
          .where(
            and(
              eq(schema.workspaceInvitations.workspaceId, ctx.workspace.id),
              eq(schema.workspaceInvitations.email, r.email),
              eq(schema.workspaceInvitations.status, "pending"),
            ),
          )
          .limit(1);
        if (existing[0]) {
          return { row: existing[0], existed: true as const };
        }
        const ins = await tx
          .insert(schema.workspaceInvitations)
          .values({
            workspaceId: ctx.workspace.id,
            email: r.email,
            role: r.role,
            invitedByUserId: ctx.user.id,
            token,
            expiresAt,
          })
          .returning();
        return { row: ins[0]!, existed: false as const };
      });
      results.push({
        email: r.email,
        status: res.existed ? "reused" : "invited",
      });
      toEmail.push({ email: r.email, role: r.role, token: res.row.token });
    } catch (err) {
      results.push({
        email: r.email,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Send emails in parallel
  await Promise.all(
    toEmail.map((t) =>
      sendWorkspaceInvitationEmail({
        to: t.email,
        inviterName: ctx.user.fullName ?? ctx.user.email,
        workspaceName: ctx.workspace.name,
        workspaceId: ctx.workspace.id,
        role: t.role,
        token: t.token,
      }),
    ),
  );

  revalidatePath("/dashboard/members");
  return { ok: true, results };
}
