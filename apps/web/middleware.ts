import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * apps/web middleware — composes Clerk's `clerkMiddleware` inline so the
 * public-route matcher can include the surface-only White Belt funnel
 * preview prototype.
 *
 * The shared `@sigmafy/auth/middleware` is deliberately not modified; admin
 * and any future app continue to inherit the standard public set there.
 * This file mirrors that set and adds one prototype path. Keep this list in
 * sync with `packages/auth/src/middleware.ts` if shared public paths
 * change.
 *
 * `config` must be a statically analyzable literal export at the app level
 * — Next.js cannot read it through a re-export — so it stays inline.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/clerk(.*)",
  "/api/inngest(.*)",
  "/accept-invite(.*)",
  "/white-belt-funnel-preview(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
