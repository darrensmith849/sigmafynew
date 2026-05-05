import { eq } from "drizzle-orm";
import { getCurrentUser } from "@sigmafy/auth/server";
import { schema } from "@sigmafy/db";
import { getServiceDb } from "./db";

export interface AdminUser {
  /** Clerk user id. */
  clerkUserId: string;
  /** Sigmafy users.id (auto-created if missing). */
  sigmafyUserId: string;
  email: string;
  fullName: string | null;
}

function adminAllowlist(): string[] {
  const raw = process.env.SIGMAFY_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Resolve the current admin user, or null if the caller isn't authenticated
 * as an admin.
 *
 * Phase 0B: `SIGMAFY_ADMIN_EMAILS` env var (comma-separated). Real Clerk
 * organisation roles in Phase 1.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const clerk = await getCurrentUser();
  if (!clerk) return null;

  const allow = adminAllowlist();
  if (!allow.includes(clerk.email.toLowerCase())) return null;

  // Ensure a Sigmafy users row exists for the admin (service-role).
  const svc = getServiceDb();
  const rows = await svc
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkUserId, clerk.id))
    .limit(1);
  let sigmafyUserId = rows[0]?.id;
  if (!sigmafyUserId) {
    const ins = await svc
      .insert(schema.users)
      .values({
        clerkUserId: clerk.id,
        email: clerk.email,
        fullName: clerk.fullName,
      })
      .returning();
    sigmafyUserId = ins[0]!.id;
  }

  return {
    clerkUserId: clerk.id,
    sigmafyUserId,
    email: clerk.email,
    fullName: clerk.fullName,
  };
}

/** Throws if caller isn't an admin. */
export async function requireAdmin(): Promise<AdminUser> {
  const a = await getAdminUser();
  if (!a) throw new Error("not_admin");
  return a;
}
