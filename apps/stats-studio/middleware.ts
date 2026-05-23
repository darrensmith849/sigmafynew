import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * stats-studio middleware.
 *
 * The shared `@sigmafy/auth/middleware` only allows `/`, sign-in, sign-up,
 * /api/clerk, /api/inngest, and /accept-invite as public paths. Studio
 * adds its marketing surfaces (`/pricing`, `/features`, `/about`) to that
 * list — everything else (catalog, tool runner, runs history) requires
 * a Clerk session.
 */
const isPublic = createRouteMatcher([
  "/",
  "/pricing",
  "/features(.*)",
  "/about",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/clerk(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect();
  }
});

// The matcher must be a statically analyzable literal (Next.js requirement).
// Same pattern as apps/web/middleware.ts; keeps Clerk off static assets.
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
