/**
 * Maison — proxy.ts (Next.js 16 — replaces middleware.ts)
 *
 * IMPORTANT: In Next.js 16, middleware.ts was renamed to proxy.ts
 * and the exported function must be named `proxy` (not `middleware`).
 *
 * Responsibilities:
 *  1. Auth session verification (Better Auth) — cookie-only check
 *  2. Route protection (redirect unauthenticated users to /auth/sign-in)
 *
 * 2-Layer Auth Pattern (per PROJECT-ARCHITECTURE.md §6.3):
 *  Layer 1 (THIS FILE): Cookie-existence-only optimistic check.
 *    - Uses getSessionCookie() from better-auth/cookies
 *    - NO DB access, NO auth.api.getSession(), NO RBAC role checks
 *    - Edge-compatible (can run on Edge runtime)
 *    - Purpose: fast redirect for unauthenticated users
 *  Layer 2 (Server Component layouts): Full session validation + RBAC.
 *    - (account)/layout.tsx calls auth.api.getSession()
 *    - (admin)/layout.tsx calls auth.api.getSession() + checks role
 *    - Purpose: actual security boundary
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §3.1.
 */

import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes that require ANY authenticated session (cookie existence check only).
// RBAC role checks happen in layout.tsx, NOT here.
const AUTH_REQUIRED_ROUTES = ["/account", "/admin", "/checkout"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication (prefix match)
  const requiresAuth = AUTH_REQUIRED_ROUTES.some((route) => pathname.startsWith(route));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Cookie-existence-only optimistic check (Edge-compatible, no DB access)
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // NOTE: Do NOT do RBAC role checks here. Those happen in layout.tsx.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - Public assets (images, fonts, etc.)
     * - API routes (handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)|api/).*)",
  ],
};
