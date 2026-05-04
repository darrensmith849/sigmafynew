/**
 * Provider-agnostic shapes returned by @sigmafy/auth helpers.
 *
 * The brief locks Clerk as the V1 auth provider, but app code should depend on
 * these shapes — not on Clerk types — so the seam stays swappable.
 */

export type SigmafyRole = "owner" | "admin" | "sponsor" | "trainer" | "delegate";

export interface SigmafyUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface SigmafyWorkspace {
  id: string;
  slug: string;
  name: string;
}

export interface SigmafyMembership {
  workspace: SigmafyWorkspace;
  role: SigmafyRole;
}

export interface SigmafyAuthContext {
  user: SigmafyUser;
  workspace: SigmafyWorkspace;
  role: SigmafyRole;
}
