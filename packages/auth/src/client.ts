"use client";

import { useUser } from "@clerk/nextjs";
import type { SigmafyUser } from "./types";

/**
 * Client-side hook for the current user. Returns null while loading or if
 * not signed in.
 */
export function useCurrentUser(): SigmafyUser | null {
  const { user, isLoaded, isSignedIn } = useUser();
  if (!isLoaded || !isSignedIn || !user) return null;
  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress
    ?? "";
  return {
    id: user.id,
    email,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
  };
}
