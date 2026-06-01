import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * apps/web middleware.
 *
 * Two independent halves:
 *
 * 1. `/white-belt-funnel-preview(.*)` — the surface-only prototype. Bypasses
 *    Clerk entirely (Clerk is never invoked for this path, so the prototype
 *    works on Preview deployments that don't have Clerk env vars).
 *    Optional token gate via the `WHITE_BELT_FUNNEL_PREVIEW_TOKEN` env var:
 *      - If env unset → route is open (local dev convenience).
 *      - If env set → request must carry the `preview-access` cookie OR an
 *        `?access=<token>` query param. Valid query params trigger a cookie
 *        set + redirect to a clean URL so subsequent tab navigation works
 *        without re-sending the token.
 *
 * 2. Every other route — handled by Clerk exactly as before. Public set
 *    mirrors `@sigmafy/auth/middleware`. The shared middleware is not
 *    modified.
 */

const isPrototypeRoute = createRouteMatcher([
  "/white-belt-funnel-preview(.*)",
]);

const isClerkPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/clerk(.*)",
  "/api/inngest(.*)",
  "/accept-invite(.*)",
]);

const PREVIEW_COOKIE = "preview-access";
const PREVIEW_PATH = "/white-belt-funnel-preview";

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isClerkPublic(req)) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (isPrototypeRoute(req)) {
    return handlePrototypeRoute(req);
  }
  return clerkHandler(req, ev);
}

function handlePrototypeRoute(req: NextRequest) {
  const expected = process.env.WHITE_BELT_FUNNEL_PREVIEW_TOKEN?.trim();

  // No token configured → fully open (development convenience).
  if (!expected) {
    return NextResponse.next();
  }

  // Cookie already set with the matching token → allow.
  const cookieToken = req.cookies.get(PREVIEW_COOKIE)?.value;
  if (cookieToken && cookieToken === expected) {
    return NextResponse.next();
  }

  // URL token matches → set cookie and redirect to a clean URL so the
  // token isn't carried in subsequent tab links.
  const urlToken = req.nextUrl.searchParams.get("access");
  if (urlToken && urlToken === expected) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("access");
    const res = NextResponse.redirect(url);
    res.cookies.set(PREVIEW_COOKIE, expected, {
      httpOnly: true,
      sameSite: "lax",
      path: PREVIEW_PATH,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: req.nextUrl.protocol === "https:",
    });
    return res;
  }

  // No valid token → let the page render the access gate.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
