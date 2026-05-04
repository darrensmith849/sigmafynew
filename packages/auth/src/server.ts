import { auth, currentUser } from "@clerk/nextjs/server";
import type { SigmafyAuthContext, SigmafyUser } from "./types";

/**
 * Resolve the current authenticated user from Clerk session cookies.
 *
 * Returns null if no user is signed in. Throws on Clerk SDK config errors
 * (missing keys, etc.) — those are deployment problems, not request problems.
 */
export async function getCurrentUser(): Promise<SigmafyUser | null> {
  const u = await currentUser();
  if (!u) return null;
  const email = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress
    ?? u.emailAddresses[0]?.emailAddress
    ?? "";
  return {
    id: u.id, // Clerk user id; mapped to Sigmafy users.clerk_user_id
    email,
    fullName: [u.firstName, u.lastName].filter(Boolean).join(" ") || null,
  };
}

/**
 * Resolve the active Sigmafy user. Throws if not signed in.
 */
export async function requireUser(): Promise<SigmafyUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("not_signed_in");
  return user;
}

/**
 * Resolve user + workspace + role for the current request.
 *
 * Phase 0A picks the user's most-recent membership when multiple workspaces
 * exist. Phase 0B will switch this to the explicit workspace from the route
 * (subdomain or path prefix).
 */
export async function requireAuthContext(): Promise<SigmafyAuthContext> {
  const a = await auth();
  if (!a.userId) throw new Error("not_signed_in");
  // Resolution against the DB happens in app code via @sigmafy/db lookups —
  // this package stays Clerk-only and doesn't pull in the DB layer.
  // Apps wrap this with their own helper that hydrates workspace + role.
  throw new Error(
    "requireAuthContext: hydrate workspace+role in app code via @sigmafy/db lookup — see apps/web/lib/auth.ts",
  );
}
