export { sigmafyMiddleware as default } from "@sigmafy/auth/middleware";

// Same literal-config requirement as apps/web/middleware.ts — re-exporting
// `config` from the package leaves the matcher unset and the middleware
// runs on /_next/static/* (Clerk then 404s every chunk).
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
