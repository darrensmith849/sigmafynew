/**
 * Workspace-context middleware factory for Next.js App Router.
 *
 * Phase 0A: resolves workspace from subdomain/session, sets request context,
 * fails closed on missing/invalid workspace. Phase -1 exports a no-op so app
 * code can wire it without behaviour change.
 */
export function createSigmafyMiddleware() {
  return function middleware(): Response | undefined {
    return undefined;
  };
}
