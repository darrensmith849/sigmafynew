# @sigmafy/auth

Auth abstraction wrapping Clerk. Apps depend on this package — never on the
Clerk SDK directly — so the seam stays swappable.

## Phase -1

Signature-only. `getCurrentUser()` and `requireAuthContext()` throw
`"not implemented in Phase -1"`. The middleware factory returns a no-op.

## Phase 0A (next)

Wire Clerk: `ClerkProvider`, `clerkMiddleware()`, JWT-to-`SigmafyAuthContext`
mapping, workspace-org binding, the five Sigmafy roles.
