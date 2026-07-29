/**
 * Maison — Server-side tRPC callers for React Server Components.
 *
 * Calls tRPC procedures directly in-process (zero HTTP round-trip).
 * Used by Server Components: `const data = await api().products.list(...)`.
 *
 * Two callers are exported:
 *
 *   • `api()`        — session-aware. Reads `headers()` so the context
 *                      carries the request's session (for protected/admin
 *                      procedures). Because it calls `next/headers`, any
 *                      route that uses it is forced dynamic (ƒ) by Next.js
 *                      and opted out of static generation. Use it only on
 *                      pages that genuinely need a session (account, admin,
 *                      cart/checkout, any protected procedure).
 *
 *   • `apiPublic()`  — session-free. Builds the context with an empty
 *                      request, so context.session is `null`. Because it
 *                      does NOT call `next/headers`, pages that use it can
 *                      be prerendered static (○). Use it for public,
 *                      cacheable content (homepage product grid, collection
 *                      lists, PDP, PLP, search) where only `publicProcedure`
 *                      is invoked. A null session is exactly correct there —
 *                      `publicProcedure` never reads `ctx.session`.
 *
 * This mirrors the Stillwater reference's split between `apiCaller()`
 * (headers-bound, dynamic) and direct-DB queries for static marketing
 * routes (see Stillwater ADR V16-1 + the `index-routes-no-apiCaller`
 * regression tests). Maison reuses the same `appRouter` for both callers
 * so there is ZERO duplicated query/shaping logic — only the transport
 * context differs.
 *
 * Pattern source: nextjs16-react19-tailwind4-better-auth-monorepo skill
 * (apps/web/src/lib/trpc/server.ts, Stillwater reference).
 */

import 'server-only';
import { headers } from 'next/headers';

import { appRouter, createContext } from '@maison/api';

const TRPC_ENDPOINT = 'http://localhost:3000/api/trpc';

/**
 * Build a tRPC caller with the current request's headers and session.
 * The caller mirrors the HTTP route's createContext so RSC and client
 * procedures see identical context (db + session + req).
 *
 * Side effect: calls `next/headers` → opts the calling route out of
 * static generation (forced dynamic). Only use where a session is needed.
 */
export async function api() {
  const heads = new Headers(await headers());
  const req = new Request(TRPC_ENDPOINT, { headers: heads });
  const ctx = await createContext({ req });
  return appRouter.createCaller(ctx);
}

/**
 * Build a session-free tRPC caller for public procedures only.
 *
 * `context.session` will be `null` — correct for `publicProcedure`, which
 * never reads it. Because this does NOT call `next/headers`, the calling
 * route can be prerendered static by Next.js.
 *
 * Use ONLY with `publicProcedure` procedures; `protectedProcedure`/
 * `adminProcedure` will throw `UNAUTHORIZED` by design (they require a
 * session — use `api()` for those, on a route group guarded by `proxy.ts` +
 * an auth-checking layout).
 */
export async function apiPublic() {
  const req = new Request(TRPC_ENDPOINT);
  const ctx = await createContext({ req });
  return appRouter.createCaller(ctx);
}
