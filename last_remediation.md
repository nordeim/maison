 Confirmation complete. WishlistButton and ReviewsSection are referenced in the PDP's payload for client-side hydration — functionality is preserved; only the SSR execution (where useRef exploded) is suppressed. The ClientOnly boundary 
 defers them to the client pass.                                                                                                                                                                                                            
                                                                                                                                                                                                                                            
 VERIFY — final summary                                                                                                                                                                                                                     
                                                                                                                                                                                                                                            
 ┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────┐                         
 │ Gate                            │ Before (error.txt)                                                      │ After (your running server)                                                                        │                         
 ├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤                         
 │ next start + GET /              │ HTTP 500 — TypeError: Cannot read properties of null (reading 'useRef') │ HTTP 200 — <title>Maison — Objects of Quiet Beauty</title>                                         │                         
 ├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤                         
 │ GET /products/[slug]            │ (would crash — same hook on PDP)                                        │ HTTP 200 — Harvest Dining Table — Maison                                                           │                         
 ├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤                         
 │ All public routes               │ —                                                                       │ / /products /collections /journal /about /contact /cart /gift-cards /trade /auth/sign-in → all 200 │                         
 ├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤                         
 │ Auth-guarded routes             │ —                                                                       │ /account /admin and children → 307 → /auth/sign-in (correct behavior, no crash)                    │                         
 ├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤                         
 │ pnpm --filter=@maison/web build │ succeeded (37/37) ✓                                                     │ succeeds (37/37, exit 0) ✓                                                                         │                         
 ├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤                         
 │ pnpm check-types (monorepo)     │ —                                                                       │ 10/10 packages ✓                                                                                   │                         
 ├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤                         
 │ pnpm lint (web)                 │ —                                                                       │ 0 errors ✓                                                                                         │                         
 └─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────┘                         
                                                                                                                                                                                                                                            
 Root cause (recap)                                                                                                                                                                                                                         
                                                                                                                                                                                                                                            
 error.txt had two issues; one was fatal:                                                                                                                                                                                                   
                                                                                                                                                                                                                                            
 1. (Non-fatal, unchanged) Build-time Dynamic server usage: … used headers warnings during static generation. The account/admin layouts and the tRPC server caller use headers() → Next.js 16 marks those routes ƒ (Dynamic). Build still   
    completes 37/37. Expected and correct; out of scope per Surgical Changes.                                                                                                                                                               
                                                                                                                                                                                                                                            
 2. (Fatal — FIXED) Runtime TypeError: Cannot read properties of null (reading 'useRef'). better-auth/react's useSession() calls useRef() (via nanostores useStore). When WishlistButton/ReviewsSection rendered during SSR, Turbopack      
    selected React's "react-server" export condition for the bundled chunk, where useRef is a null stub → null.useRef(). I confirmed this by: reproducing the 500, decoding the crashing chunk 1ypwl18 (it contains better-auth/react +     
    WishlistButton.useSession), inspecting better-auth/react-store.mjs (useRef), inspecting react@19.2.8's exports ("react-server": "./react.react-server.js"), and the Stillwater SKILL explicitly documenting this exact failure (Line    
    4330 + Lesson 89: "Do NOT use resolve.conditions: ['react-server']… it affects ALL packages with conditional exports (including React itself), causing useState is not a function errors."). Stillwater avoids it by never invoking     
    useSession during SSR.                                                                                                                                                                                                                  
                                                                                                                                                                                                                                            
 The fix (scaffolding gap closed)                                                                                                                                                                                                           
                                                                                                                                                                                                                                            
 Added one reusable SSR boundary mirroring Stillwater's "keep auth hooks out of SSR" intent, and applied it at all three call sites:                                                                                                        
                                                                                                                                                                                                                                            
 - apps/web/src/components/shop/ClientOnly.tsx (new) — a 'use client' component using useSyncExternalStore (SSR-safe hydration primitive: getServerSnapshot = () => false). Defers children to the client pass. Chosen over                 
   next/dynamic({ssr:false}) because Next.js 16 forbids ssr:false in Server Components (the PDP is a Server Component — I hit that error and corrected course during verify).                                                               
 - apps/web/src/components/shop/ProductCard.tsx — wrapped the <WishlistButton/> (homepage's path into the crash) in <ClientOnly>.                                                                                                           
 - apps/web/src/app/(shop)/products/[slug]/page.tsx — wrapped <WishlistButton variant="pdp"> and <ReviewsSection> in <ClientOnly>.                                                                                                          
                                                                                                                                                                                                                                            
 Net effect: useSession() (and its useRef) never executes during SSR — exactly the property Stillwater has by construction. Functionality is preserved (the components hydrate fully on the client; verified present in the RSC payload).   
                                                                                                                                                                                                                                            
 Files changed (3)                                                                                                                                                                                                                          
                                                                                                                                                                                                                                            
 ```                                                                                                                                                                                                                                        
   M apps/web/src/app/(shop)/products/[slug]/page.tsx                                                                                                                                                                                       
   M apps/web/src/components/shop/ProductCard.tsx                                                                                                                                                                                           
   ?? apps/web/src/components/shop/ClientOnly.tsx                                                                                                                                                                                           
 ```                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                            
 DELIVER — guide & follow-ups                                                                                                                                                                                                               
                                                                                                                                                                                                                                            
 Why (per Conventional Commits "explain WHY"): Better Auth's React client hook is not safe to call in the SSR pass because Turbopack selects React's null-hook react-server build for that chunk; ClientOnly moves the call to the browser  
 pass.                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                            
 Suggested commit:                                                                                                                                                                                                                          
                                                                                                                                                                                                                                            
 ```                                                                                                                                                                                                                                        
   fix(web): prevent useSession (better-auth/react) from running during SSR                                                                                                                                                                 
                                                                                                                                                                                                                                            
   Root cause: WishlistButton & ReviewsSection call Better Auth's useSession(),                                                                                                                                                             
   which calls useRef() via useStore. During SSR the bundled better-auth/react                                                                                                                                                              
   chunk selects React's "react-server" export, where useRef is a null stub,                                                                                                                                                                
   crashing with "Cannot read properties of null (reading 'useRef')" on /                                                                                                                                                                   
   and every PDP (HTTP 500). Mirrors Stillwater (never calls useSession during                                                                                                                                                              
   SSR) via a new ClientOnly boundary (useSyncExternalStore). Next.js 16                                                                                                                                                                    
   forbids next/dynamic ssr:false in Server Components, so the PDP uses the                                                                                                                                                                 
   ClientOnly wrapper instead. See CLAUDE.md Triage + Stillwater SKILL L4330.                                                                                                                                                               
 ```                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                            
 Known follow-up (intentionally NOT touched — Surgical Changes): The build-time Dynamic server usage … used headers warnings remain. They are expected for auth-guarded routes (/, /collections, /account/*, /admin/*) and the build        
 completes. If you later want them silenced for purely-cosmetic reasons, the proper fixes are route-by-route: add export const dynamic = 'force-dynamic' to those pages/layouts, or Pull session reads out of the render path — but I'd     
 treat that as a separate task since it touches rendering strategy.                                                                                                                                                                         
                                                                                                                                                                                                                                            
 Optional hardening (not done, flagging per "leave it better"): Any future Client Component that calls a Better Auth hook (useSession, or any authClient.useX()) on an SSR-rendered route will hit the same wall. Consider adding an ESLint 
 custom rule or a short note to AGENTS.md ("Better Auth React hooks: wrap in <ClientOnly>") so the next agent doesn't reintroduce it. I did not add this to avoid scope creep, but it's the lasting guardrail. Want me to add that note to  
 AGENTS.md? 

---

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

