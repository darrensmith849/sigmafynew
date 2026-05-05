import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Default Sigmafy middleware: protects every route except marketing, auth
 * pages, and Clerk's own webhook routes.
 *
 * Apps that need different protection rules can compose their own middleware
 * that calls `clerkMiddleware()` directly.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/clerk(.*)",
  "/api/inngest(.*)", // signature-verified by Inngest SDK; no Clerk auth.
  "/accept-invite(.*)", // public landing — page itself prompts sign-in.
]);

export const sigmafyMiddleware = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const sigmafyMiddlewareConfig = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
