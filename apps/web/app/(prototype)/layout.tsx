import type { ReactNode } from "react";

/**
 * Minimal layout for the `(prototype)` route group. The root layout already
 * wraps everything in ClerkProvider and loads the design tokens — this
 * group just passes through so prototype pages can render unauthenticated.
 */
export default function PrototypeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
