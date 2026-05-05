export { sigmafyMiddleware as default } from "@sigmafy/auth/middleware";

// Next.js requires `config` to be a statically analyzable literal export in
// middleware.ts at the app level — re-exporting from another package leaves
// the matcher unset, so the middleware runs on EVERY path (including
// /_next/static/chunks/*), and Clerk's protect-rewrite ends up 404-ing all
// static assets. Keep this in sync with `sigmafyMiddlewareConfig` in
// packages/auth/src/middleware.ts.
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
