### Root cause validated 
 
The 12 DYNAMIC_SERVER_USAGE warnings in error.txt are by design, not a bug: 
- (account)/layout.tsx and (admin)/layout.tsx call auth.api.getSession({ headers: await headers() }) — the Layer 2 security boundary, which correctly forces these route groups dynamic (ƒ). 
- Each leaf page under those groups calls api() (headers-bound tRPC caller) to run protectedProcedure/adminProcedure — also correctly dynamic. 
- The build completes successfully (exit 0, 37/37). The warnings are non-fatal — Next.js catches the probe and opts the route into dynamic rendering. 
 
### Fix applied (Option A — doc guardrail + regression test) 
 
3 files modified, 1 file created: 
 
┌───────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ 
│ File                                                          │ Change                                            │ Why                                                                                                                │ 
├───────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ AGENTS.md                                                     │ +1 bullet under "Things that look wrong but       │ Documents the architectural intent + warns against force-dynamic landmine (cacheComponents: true incompatibility)  │ 
│                                                               │ aren't"                                           │                                                                                                                    │ 
├───────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ CLAUDE.md                                                     │ +1 bullet under "tRPC v11"                        │ Documents the api()/apiPublic() rendering-strategy split with the invariant + links to the regression test         │ 
├───────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ .gitignore                                                    │ +2 negation rules after lib/                      │ The Python lib/ gitignore entry was silently hiding the test file; negation restores Next.js apps/web/src/lib/     │ 
│                                                               │                                                   │ tracking                                                                                                           │ 
├───────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ apps/web/src/lib/__tests__/rendering-strategy.contract.test.t │ New — 20 contract tests                           │ Locks the architectural invariant at the source level                                                              │ 
│ s                                                             │                                                   │                                                                                                                    │ 
└───────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ 
 
### The regression test (20 tests, all green) 
 
Source contract tests — no React rendering, no tRPC/auth mocks, no build invocation. They read page source and assert the import contract: 
1. 5 public TRPC pages must import apiPublic (not api) → keeps them ○ Static 
2. 2 auth layouts must call auth.api.getSession({ headers }) → forces dynamic 
3. 12 auth leaf pages must import api (not apiPublic) → session present for protectedProcedure 
4. 1 meta-guard on lib/trpc/server.ts itself → api() calls headers(), apiPublic() doesn't 
 
### Verification (all 8 gates green) 
 
``` 
  1. check-types   → 10/10 packages ✓ 
  2. lint          → 0 errors ✓ 
  3. test          → 20/20 tests passed ✓ 
  4. format:check  → All matched files ✓ 
  5. build (web)   → 37/37 pages, exit 0 ✓ 
``` 
 
### What this prevents 
 
- An agent migrating an auth-guarded route to apiPublic() → test fails (session would be null → UNAUTHORIZED at runtime) 
- An agent migrating a public route to api() → test fails (static prerender killed, CDN caching lost) 
- An agent adding export const dynamic = 'force-dynamic' to silence warnings → AGENTS.md/CLAUDE.md guardrails document why this is a cacheComponents landmine

