DELIVER — Complete Handoff 
 
### Files changed (7 total) 
 
``` 
  apps/web/src/lib/trpc/server.ts                           ← +apiPublic() + docs 
  apps/web/src/app/(shop)/page.tsx                          ← api() → apiPublic() 
  apps/web/src/app/(shop)/products/page.tsx                 ← api() → apiPublic() 
  apps/web/src/app/(shop)/products/[slug]/page.tsx          ← api() → apiPublic() + ClientOnly wraps 
  apps/web/src/app/(shop)/collections/page.tsx              ← api() → apiPublic() 
  apps/web/src/app/(shop)/search/page.tsx                   ← api() → apiPublic() 
  apps/web/src/components/shop/ClientOnly.tsx               ← prior remediation (reformatted) 
  apps/web/src/components/shop/ProductCard.tsx              ← prior remediation (reformatted) 
``` 
 
### What each issue became 
 
┌───────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────┬────────────────────────────────────┐ 
│ Issue                                         │ Root cause                                                                           │ Fix                                                        │ Verified                           │ 
├───────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────────┤ 
│ #1 Prettier gate                              │ Formatting drift on 2 files (prior remediation)                                      │ prettier --write on 2 files (formatting-only)              │ ✅ prettier --check green          │ 
├───────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────────┤ 
│ #2 Homepage DYNAMIC_SERVER_USAGE + empty      │ api() called next/headers → / forced ƒ Dynamic → static probe got empty grid         │ apiPublic() — session-free caller (no headers()) → / is    │ ✅ [home] warning gone; ○ in route │ 
│ prerender                                     │                                                                                      │ now ○ Static                                               │ table                              │ 
├───────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────────┤ 
│ #3 UNAUTHORIZED logs on /account, /admin      │ By design (defense-in-depth: protectedProcedure throws when no session; layouts      │ No fix needed — documented as expected                     │ ✅ No change (correct)             │ 
│                                               │ redirect real users)                                                                 │                                                            │                                    │ 
└───────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┴────────────────────────────────────┘ 
 
### Verification (all gates green) 
 
┌──────────────────────────────────────────┬────────────────────────────────────────────────────┐ 
│ Gate                                     │ Result                                             │ 
├──────────────────────────────────────────┼────────────────────────────────────────────────────┤ 
│ prettier --check (8 files)               │ ✅ All formatted                                   │ 
├──────────────────────────────────────────┼────────────────────────────────────────────────────┤ 
│ pnpm check-types (monorepo, 10 packages) │ ✅ 10/10                                           │ 
├──────────────────────────────────────────┼────────────────────────────────────────────────────┤ 
│ pnpm lint (web)                          │ ✅ 0 errors                                        │ 
├──────────────────────────────────────────┼────────────────────────────────────────────────────┤ 
│ pnpm build (clean, no cache, exit code)  │ ✅ exit 0, 37/37 pages                             │ 
├──────────────────────────────────────────┼────────────────────────────────────────────────────┤ 
│ / route marker                           │ was ƒ → now ○ Static                               │ 
├──────────────────────────────────────────┼────────────────────────────────────────────────────┤ 
│ /collections route marker                │ was ƒ → now ○ Static                               │ 
├──────────────────────────────────────────┼────────────────────────────────────────────────────┤ 
│ [home] DYNAMIC_SERVER_USAGE              │ eliminated                                         │ 
├──────────────────────────────────────────┼────────────────────────────────────────────────────┤ 
│ [collections] DYNAMIC_SERVER_USAGE       │ eliminated                                         │ 
├──────────────────────────────────────────┼────────────────────────────────────────────────────┤ 
│ Remaining warnings                       │ 12 — exclusively /account/* + /admin/* (by design) │ 
└──────────────────────────────────────────┴────────────────────────────────────────────────────┘ 
 
### Suggested commit (NOT auto-committed per AGENTS.md) 
 
``` 
  fix(web): eliminate DYNAMIC_SERVER_USAGE warnings on public routes 
 
  Root cause (Issue #2): All public shop pages — /, /collections, /products, 
  /products/[slug], /search — fetched data via api() from lib/trpc/server, 
  which unconditionally calls next/headers. In Next.js 16, touching headers() 
  forces the route dynamic (ƒ), so the static-generation probe throws 
  DYNAMIC_SERVER_USAGE. The homepage's try/catch swallowed the error, leaving 
  an EMPTY product grid in the prerender output. 
 
  The prior remediation (last_remediation.md) misdiagnosed these as "cosmetic" 
  and only fixed the unrelated useRef-on-SSR crash (ClientOnly boundary). 
  It also never ran pnpm format on the 2 files it touched, breaking the 
  pre-commit Prettier gate. 
 
  Fix: 
  1. Added apiPublic() — a session-free tRPC caller that reuses the same 
     appRouter (zero query-logic duplication) but builds context with an 
     empty Request (no headers() → ctx.session=null). Mirrors Stillwater 
     ADR V16-1: "No apiCaller() → no headers() → no streaming → complete 
     HTML returned." 
  2. Migrated 5 public pages from api() → apiPublic(): /, /collections, 
     /products, /products/[slug], /search. Only publicProcedure invocations 
     — null session is correct. 
  3. Reformatted ClientOnly.tsx + ProductCard.tsx (pre-commit gate fix). 
 
  Verify: / and /collections now ○ Static; [home] and [collections] 
  DYNAMIC_SERVER_USAGE warnings eliminated; 12 remaining warnings are 
  exclusively /account/* + /admin/* (by design, guarded by proxy.ts + auth 
  layouts). Build 37/37, exit 0. prettier/check-types/lint green. 
``` 
 
### Follow-ups (documented, NOT done — Surgical Change Discipline) 
 
┌───────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────┐ 
│ What                              │ Why deferred                                                                      │ Fix                                                                            │ 
├───────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ /products, /search remain ƒ       │ They access searchParams (sort/filter, ?q=) — correct dynamic behavior, not a bug │ No change needed                                                               │ 
├───────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ /products/[slug] remains ƒ        │ Dynamic [slug] segment, no generateStaticParams (needs CMS/Phase 2)               │ Add generateStaticParams when Sanity products are wired                        │ 
├───────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ Optional AGENTS.md guardrail note │ Would prevent next agent from reintroducing both classes of bug                   │ "Public pages: use apiPublic(); hooks: wrap in <ClientOnly>" — want me to add? │ 
└───────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────┘ 

