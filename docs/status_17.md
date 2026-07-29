The diff is exactly the surgical change I intended: 
 
- .prettierrignore: −1 line (the bespoke exclusion removed) 
- rendering-strategy.contract.test.ts: async→sync readFileSync, string return type, three async () => {const src = await read(rel); expect(src, …).not.toBeNull(); … blocks collapsed to () => {const src = read(rel); …, the meta-guard   
  switched from readFile to readFileSync + single quotes (Prettier's preference), and an explicit doc comment on the new read helper. Imports reordered by ESLint auto-fix. 
 
(The huge 2093 files changed line is unrelated pre-existing working-tree drift in the skills/ vendored directory — not touched by me; my diff is only the two files above. Worth flagging to you, but explicitly out of scope per Surgical 
Change Discipline.) 
 
VERIFY — final gate summary 
 
┌──────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────┐ 
│ Gate                                             │ Before (error.txt)                                                              │ After (this fix)                                                               │ 
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ prettier --check (repo-wide, no boutique ignore) │ [warn] rendering-strategy.contract.test.ts → user silenced via .prettierrignore │ ✅ All matched files conformant, exclusion removed                             │ 
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ pnpm check-types (monorepo)                      │ ❌ @maison/web#check-types exit 2 — TS18047: 'src' is possibly 'null' line 111  │ ✅ 10/10 successful, exit 0                                                    │ 
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ pnpm --filter=@maison/web test                   │ — (claimed 20/20 in last_remediation, unverifiable)                             │ ✅ 20/20 passed (synchronous, 1.23s)                                           │ 
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ pnpm lint (repo-wide)                            │ —                                                                               │ ✅ exit 0 (after lint:fix corrected import ordering I introduced)              │ 
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ pnpm --filter=@maison/web build                  │ ✅ 37/37, exit 0 (was never the failure)                                        │ ✅ 37/37, exit 0, identical route table — rendering strategy untouched         │ 
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ DYNAMIC_SERVER_USAGE warnings (12)               │ present for /account/* + /admin/*                                               │ unchanged — present, by design (AGENTS.md "Things that look wrong but aren't") │ 
└──────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────┘ 
 
DELIVER 
 
### Root cause (validated) 
 
The fatal failure in error.txt was not a build or rendering problem — pnpm build already succeeds 37/37. The single blocking issue was a TypeScript null-narrowing bug inside the regression test file that the prior last_remediation.md  
session had just added: rendering-strategy.contract.test.ts:111 derefenced src (typed string | null because read did .catch(() => null)) via .split('\n') → TS18047 under strict: true. A Vitest runtime assertion 
(expect(src).not.toBeNull()) is not a TypeScript type guard, so it never narrowed src. The prior remediation's claim that check-types was "10/10 ✓" was inconsistent with the committed artifact — the test was shipped type-broken. 
 
The secondary smell in error.txt — the user running vi .prettierrignore — was a workaround that masked the fact that the same test file was genuinely mis-formatted. .prettierrignore was silencing the gate rather than satisfying it. 
 
### The optimal fix (mirrors Stillwater) 
 
The Stillwater reference's analogous test (index-routes-no-apiCaller.test.ts) solves this by construction: it uses synchronous readFileSync into string-typed module-scoped consts — no Promise, no .catch(() => null), no null branch, no 
TS18047 possible. Maison's test had diverged into an async-deferred-to-null read() helper, which introduced both the type hole and a worse failure mode (a missing page file would be swallowed to null and surface as a confusing 
regex-assertion failure rather than an obvious "file not found"). 
 
Aligning Maison with Stillwater eliminated the root cause at the type level (not a symptom patch), improved the missing-file signal, and let me restore honest Prettier enforcement by deleting the bespoke .prettierrignore exclusion. 
 
### Files changed (2 — surgical) 
 
``` 
  M apps/web/src/lib/__tests__/rendering-strategy.contract.test.ts 
  M .prettierrignore 
``` 
 
No page sources, no server.ts, no schema, no deps, no routing-strategy change. The regression contract is unchanged — only the test harness improved. 
 
### Suggested commit (per Conventional Commits "explain WHY") 
 
``` 
  fix(web): eliminate TS18047 in rendering-strategy contract test 
 
  Root cause: the contract test's `read()` helper resolved to 
  `string | null` (`readFile(...).catch(() => null)`), so `src` stayed 
  `string | null` even after the `expect(src).not.toBeNull()` runtime 
  guard — which does not narrow TypeScript types. Line 111's `src.split` 
  then tripped `TS18047` under `strict: true`, failing the pre-commit 
  `check-types` gate (error.txt). 
 
  The prior session also added this file to `.prettierrignore` to silence 
  a real Prettier `[warn]`, masking the fact that the file itself was 
  mis-formatted — the gate was being worked around, not satisfied. 
 
  Fix: switch the test to synchronous `readFileSync` (mirrors the 
  Stillwater reference, `index-routes-no-apiCaller.test.ts`). `src` is 
  now `string` → no null branch → no TS18047 anywhere; a missing page 
  file now fails loudly with a readable ENOENT instead of being 
  swallowed to null. Loops converted from async to sync, redundant 
  `toBeNull` runtime guards dropped (the throw now does that job). 
  Restored honest Prettier enforcement by removing the bespoke 
  `.prettierrignore` exclusion for this file. 
 
  Verify: check-types 10/10; contract test 20/20 (1.23s); prettier 
  repo-wide green without exclusion; lint exit 0; build 37/37 exit 0 
  with identical route table (rendering strategy untouched). The 12 
  `DYNAMIC_SERVER_USAGE` warnings for /account/* + /admin/* remain, 
  by design (AGENTS.md "Things that look wrong but aren't"). 
``` 
 
### Follow-ups (documented, NOT done — Surgical Change Discipline) 
 
1. Unrelated skills/ working-tree drift. git diff --stat shows ~2093 files deleted in skills/ (a large vendored block). That's pre-existing, unrelated to this task — I did not touch it. Worth a separate cleanup decision on your end,   
   but explicitly out of scope here. 
2. Optional guardrail note. last_remediation.md flagged adding a short AGENTS.md note ("Better Auth React hooks: wrap in <ClientOnly>") to prevent re-introducing the SSR useSession crash. Still a sound idea, still not requested in 
   this task — flagging per "leave it better." 
3. The last_remediation.md verification-claim discrepancy. That doc claims check-types 10/10 and test 20/20 green for the very file that error.txt proves was type-broken at commit time. Not actionable as a code change, but worth 
   knowing for trust calibration on that session's other claims. 

