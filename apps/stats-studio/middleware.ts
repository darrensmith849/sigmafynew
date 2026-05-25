import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * stats-studio middleware.
 *
 * UX intent (see ADR 0010 + 2026-05-24 product decision): the catalogue
 * and every individual tool page are PUBLIC. Anyone can browse all 288
 * tools, fill in inputs, see the example data — gating only kicks in
 * when they hit "Run analysis" (the server action returns an
 * `activation_required` code which the form surfaces as a friendly
 * "Activate to run" CTA).
 *
 * Only the personal `/runs` history (and run detail pages) require a
 * Clerk session, because that data is scoped to a specific workspace.
 */
const isPublic = createRouteMatcher([
  "/",
  "/pricing",
  "/features(.*)",
  "/about",
  "/catalog",
  "/t(.*)",
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
