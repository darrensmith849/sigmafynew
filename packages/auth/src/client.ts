"use client";

import type { SigmafyUser } from "./types";

/**
 * Client-side hook for the current user.
 *
 * Returns null in Phase -1 — Clerk is wired in Phase 0A.
 */
export function useCurrentUser(): SigmafyUser | null {
  return null;
}
