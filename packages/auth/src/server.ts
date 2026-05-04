import type { SigmafyAuthContext, SigmafyUser } from "./types";

const PHASE_MINUS_ONE = "auth not implemented in Phase -1 — see docs/phase-log.md";

/**
 * Resolve the current authenticated user from server context (cookies/session).
 *
 * Throws "not implemented" until Phase 0A wires Clerk.
 */
export async function getCurrentUser(): Promise<SigmafyUser> {
  throw new Error(PHASE_MINUS_ONE);
}

/**
 * Resolve the full Sigmafy auth context (user + workspace + role).
 *
 * Throws "not implemented" until Phase 0A wires Clerk.
 */
export async function requireAuthContext(): Promise<SigmafyAuthContext> {
  throw new Error(PHASE_MINUS_ONE);
}
