Key finding here. The build log shows /products as ƒ (Dynamic) — not ○ (Static). But the contract test (lines 57-64) asserts /products should use apiPublic() and be ○ Static. There's a contradiction. 
 
Wait — let me re-read. The contract test says public catalog pages must use apiPublic() so they can be prerendered static. /products/page.tsx uses apiPublic() (confirmed line 58). But the build log shows /products as ƒ Dynamic. So 
something on the /products route is forcing it dynamic. The most likely culprit is SortSelect using useSearchParams() without a Suspense boundary — Next.js opts such a page out of static prerendering (it doesn't fail the build like it 
did for /cart, but it downgrades /products from static to dynamic). 
 
This is precisely the latent issue the session log's V15 fix should have caught more broadly: when you add useSearchParams() to a Client Component, every statically-prerendered page rendering that component is either (a) forced to 
wrap it in <Suspense> or (b) silently downgraded from ○ Static to ƒ Dynamic. The V14 fix added useSearchParams() to useScrollReveal (mounted in the shared layout → caught via the /cart build failure), but SortSelect is a separate 
useSearchParams() consumer on /products that appears to have triggered the same downgrade — silently, without a build error. 
 
Let me confirm /products is expected to be static per PROJECT-ARCHITECTURE.md / AGENTS.md, and verify whether SortSelect is the cause: 

Major finding confirmed. This is a genuine, pre-existing latent issue that the session log's remediation arc missed — and it fits exactly the "scan for similar issues in other code files" objective. 
 
The facts: 
- AGENTS.md claims: "37 production routes (25 static ○ + 12 dynamic ƒ)" and explicitly: "Public shop routes (/, /collections, /products, /search) use apiPublic() and render as ○ Static". 
- The build log shows: 14 static ○ and 26 dynamic ƒ — meaning the static count dropped from the claimed 25 to 14, and dynamic rose from 12 to 26. That's 11 routes downgraded from ○ Static to ƒ Dynamic that shouldn't have been. 
- Notably: /products is ƒ Dynamic (line 199) and /search is ƒ Dynamic (line 202) — both of which AGENTS.md says should be ○ Static. 
- The products/page.tsx uses apiPublic() (correct) and has no 'use client', no export const dynamic, no Suspense wrapper, but it renders <SortSelect> which calls useSearchParams() without a Suspense boundary. That's the cause of 
  /products being downgraded to dynamic. Next.js silently opts the route out of static prerendering when an unwrapped useSearchParams() consumer is on a page without a Suspense boundary. (For /cart it produced a hard error; for 
  /products it produces a silent downgrade — more insidious.) 
- The V15 fix (<Suspense fallback={null}> around ScrollRevealTrigger) only fixed the build failure, not the silent static-prerender downgrades caused by other useSearchParams() consumers like SortSelect. 
 
This means the session log's claim "Build succeeded 10/10, no build errors" is literally true but incomplete — the build didn't fail, but the routing table no longer matches the documented "25 static + 12 dynamic" invariant. AGENTS.md 
and the rendering-strategy contract test are now in tension with the actual build output. 
 
Let me confirm the contract test's expectation precisely (does it assert /products renders static, or just that it uses apiPublic and no 'use client'?) so I can characterize the gap accurately:  

Now I can precisely characterize the discrepancy. Let me check which routes AGENTS.md claims as "production routes" vs what the build actually shows, and verify whether the SortSelect-caused downgrade is the only gap or if /search and 
/products/[slug] also have their own useSearchParams issues:

Good — /search doesn't use SortSelect or useSearchParams, and /products/[slug] doesn't either. So why are they dynamic? Let me investigate their root causes:

Both pages use apiPublic() correctly but show as ƒ Dynamic. Something in their component trees must be forcing them dynamic. Let me check if ProductCard or any of their child components use useSearchParams or other 
search-param-dependent hooks: 

All deferred items confirmed present. The useCallback count is 6 usage sites (the log said "7" — close, likely counted the import line). Now let me check whether /products reads searchParams directly (which would make the SortSelect   
Suspense issue secondary): 

The /products page reads searchParams directly (await searchParams at line 41), so it was already ƒ Dynamic before any session log changes. The SortSelect useSearchParams() without Suspense is a latent issue (would break if the page   
were ever made static), but it's not a bug introduced by the session log. 
 
Now I have the complete picture. Let me write both the final validation report and the SKILL.md update plan. Given the SKILL.md is 5,453 lines, I need to be precise about what sections to extend and what to avoid duplicating.


I now have the complete picture for both tasks. Let me write the deliverables — first the validation summary (brief, since the detailed report is already in docs/session_log_2_validation_report.md), then the SKILL.md update plan. 
 
──────────────────────────────────────────────────────────────────────────────── 
 
Deliverable 1 — Validation summary (all issues/gaps in session_log_2.md confirmed fixed) 
 
All V11–V16 code fixes are present and correct — verified by reading every touched file and running all light gates (fresh, Cached: 0). The one "new finding" from the cross-cutting scan (SortSelect useSearchParams without Suspense) is 
a latent issue, not an actively broken bug. 
 
Two items in the SKILL.md already document related patterns (§4.8 "Next.js 16 Static/Dynamic Route Boundary" covers DYNAMIC_SERVER_USAGE; §4.9 "Mistake 4" covers contract test null-swallow). My plan adds the genuinely new lessons that 
the handbook doesn't yet cover. 
 
──────────────────────────────────────────────────────────────────────────────── 
 
Deliverable 2 — SKILL.md update plan (v1.4 → v1.5) 
 
The session log's remediation arc teaches 6 concrete lessons the handbook does not currently document. Here is the precise plan for where each goes, adapted to the handbook's voice and existing conventions: 
 
### What I will add (6 new items across 5 sections) 
 
§4.8 React and Next.js Handbook — 4 new Mistakes (appended after the existing "Next.js 16 Static/Dynamic Route Boundary" section, before the "React/Next.js Checklist"): 
 
┌─────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬───────────┬───────────────────────────────────────────────────────────┐ 
│ ID          │ Lesson                                                                                                                                           │ Source    │ Handbook slot                                             │ 
│             │                                                                                                                                                  │ version   │                                                           │ 
├─────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤ 
│ 4.8 Mistake │ IntersectionObserver timing in useEffect — callback doesn't fire for elements already in viewport when observer is constructed post-hydration.   │ V12       │ New Mistake (after "Server/Client Boundary" section)      │ 
│ N           │ Fix: requestAnimationFrame fallback with getBoundingClientRect() check.                                                                          │           │                                                           │ 
├─────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤ 
│ 4.8 Mistake │ next/image fill renders position: absolute — grid placement (gridColumn/gridRow) on the <Image> element itself is silently ignored. Fix: wrap in │ V13       │ New Mistake                                               │ 
│ N+1         │ a position: relative div that IS the grid item and carries the grid placement.                                                                   │           │                                                           │ 
├─────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤ 
│ 4.8 Mistake │ useSearchParams() without Suspense breaks static prerendering — causes either hard build error (useSearchParams() should be wrapped in a         │ V15       │ New Mistake (distinct from §4.8's existing table — this   │ 
│ N+2         │ suspense boundary) or silent downgrade from ○ Static to ƒ Dynamic. Fix: wrap consumer in <Suspense fallback={null}>. Note: this is distinct from │           │ is about Client Components, not Server Components using   │ 
│             │ the DYNAMIC_SERVER_USAGE table already documented.                                                                                               │           │ next/headers)                                             │ 
├─────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤ 
│ 4.8 Mistake │ useEffect([]) misses client-side navigation — an observer or DOM watcher set up once on mount never re-runs when the URL changes via <Link>      │ V14       │ New Mistake                                               │ 
│ N+3         │ (client-side navigation). New elements render with the hook's class names but never get observed. Fix: add usePathname() / useSearchParams() as  │           │                                                           │ 
│             │ useEffect dependencies.                                                                                                                          │           │                                                           │ 
└─────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴───────────┴───────────────────────────────────────────────────────────┘ 
 
§5.8 React Patterns — 1 new entry: 
 
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────┐ 
│ Pattern                                                                                                                                                                                                                     │ Source   │ 
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┤ 
│ ScrollRevealTrigger pattern — thin Client Component that mounts a hook (side-effect-only, renders null), wired into a shared layout and wrapped in <Suspense>. This separates the hook's lifecycle from the page's render   │ V11 +    │ 
│ without introducing visible DOM.                                                                                                                                                                                            │ V15      │ 
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────┘ 
 
§6.8 React Anti-Patterns — 3 new entries: 
 
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬───────────┐ 
│ Anti-pattern                                                                                                                                                                                                               │ Source    │ 
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┤ 
│ Grid placement on absolutely-positioned <Image fill> — putting gridColumn/gridRow on <Image fill> is silently ignored because fill renders position: absolute.                                                             │ V13       │ 
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┤ 
│ Raw JSON.stringify in dangerouslySetInnerHTML for JSON-LD — XSS vector if product data contains </script>. Must escape with escapeForScriptContext() (5-char canonical set: <>& + U+2028 + U+2029).                        │ V11-2 +   │ 
│                                                                                                                                                                                                                            │ V16       │ 
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┤ 
│ Hooks defined but never called — a hook file exists, is exported, and compiles — but no component imports or calls it. The feature silently does nothing (e.g. .reveal elements stay at opacity: 0 forever). Always verify │ V11       │ 
│ the hook is imported AND invoked, not just defined.                                                                                                                                                                        │           │ 
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴───────────┘ 
 
§10 Case Index — 6 new rows: 
 
┌────────────┬────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┬──────────────────────────────────────────┐ 
│ ID         │ Incident                                   │ Root Cause                                                                │ Fix                                                   │ Key Lesson                               │ 
├────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────────────────────┤ 
│ RENDER-1   │ /products blank screen — cards rendered    │ useScrollReveal hook defined but never called; .reveal CSS sets opacity:  │ Wire hook via ScrollRevealTrigger Client Component in │ Verify hooks are called, not just        │ 
│            │ but invisible                              │ 0                                                                         │ shop layout                                           │ defined                                  │ 
├────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────────────────────┤ 
│ RENDER-2   │ Initial product cards stay opacity: 0 on   │ IntersectionObserver doesn't fire for already-visible elements when       │ requestAnimationFrame fallback with                   │ IntersectionObserver timing issue with   │ 
│            │ page load                                  │ constructed in post-hydration useEffect                                   │ getBoundingClientRect()                               │ useEffect                                │ 
├────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────────────────────┤ 
│ RENDER-3   │ Philosophy section images missing          │ next/image fill (position: absolute) with gridColumn/gridRow on <Image> — │ Wrap Image in position: relative div that IS the grid │ fill removes elements from grid flow     │ 
│            │                                            │ grid placement silently ignored                                           │ item                                                  │                                          │ 
├────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────────────────────┤ 
│ RENDER-4   │ Collection filter pages blank on           │ useEffect([]) in useScrollReveal never re-runs when URL changes via       │ Add usePathname/useSearchParams as useEffect          │ Client-side nav doesn't re-run           │ 
│            │ client-side navigation                     │ <Link>                                                                    │ dependencies                                          │ empty-deps effects                       │ 
├────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────────────────────┤ 
│ RENDER-5   │ Build fails: useSearchParams() should be   │ V14 added useSearchParams() to useScrollReveal; no Suspense boundary in   │ Wrap <ScrollRevealTrigger /> in <Suspense             │ useSearchParams() needs Suspense in      │ 
│            │ wrapped in a suspense boundary             │ shop layout                                                               │ fallback={null}>                                      │ statically-prerendered pages             │ 
├────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┼──────────────────────────────────────────┤ 
│ SECURITY-1 │ JSON-LD script tag XSS vector              │ dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} — if product │ Apply escapeForScriptContext() (5-char canonical set) │ Always escape script context in inline   │ 
│            │                                            │ data contains </script>, attacker-controlled script runs                  │ before dangerouslySetInnerHTML                        │ JSON-LD                                  │ 
└────────────┴────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┴──────────────────────────────────────────┘ 
 
§12 Lessons — 4 new entries (numbered 15–18): 
 
│ 15. Verify hooks are called, not just defined 
│ A hook file exists, exports cleanly, and compiles without error — but no component imports or calls it. The feature silently does nothing. After defining a hook, verify it is imported AND invoked in a component tree (not just 
│ referenced in a CSS comment or type definition). This was the root cause of the /products blank-screen defect: useScrollReveal was defined but had zero consumers. 
 
│ 16. IntersectionObserver may not fire for already-visible elements 
│ When an IntersectionObserver is constructed inside a post-hydration useEffect, it may not fire the isIntersecting callback for elements already in the viewport on page load. Add a requestAnimationFrame fallback that checks 
│ getBoundingClientRect() and manually adds the visible class to elements whose bounding box overlaps the viewport. Do not remove this fallback as "redundant" — it covers a real first-paint timing gap that the observer cannot detect.  
 
│ 17. next/image fill renders position: absolute — grid placement must be on a wrapper div 
│ <Image fill> renders the <img> with position: absolute so it stretches to fill its nearest positioned ancestor. An absolutely-positioned element is removed from CSS Grid flow — so gridColumn / gridRow set on the <Image> style have   
│ no effect. The image positions itself relative to a distant ancestor instead of its intended grid cell, producing broken or invisible images. Fix: wrap each <Image fill> in a <div style={{ position: 'relative', gridColumn, gridRow,  
│ overflow: 'hidden' }}> that IS the grid item. 
 
│ 18. useSearchParams() in a Client Component requires <Suspense> for static pages 
│ In Next.js, a Client Component calling useSearchParams() during static prerendering causes either a hard build error (useSearchParams() should be wrapped in a suspense boundary) or a silent downgrade from ○ Static to ƒ Dynamic. Wrap 
│ the consumer in <Suspense fallback={null}>. This applies to any useSearchParams() consumer — not just one instance. A layout-level Suspense boundary only protects that one consumer; other consumers on individual pages need their own 
│ Suspense wrappers. 
 
### What I will NOT add (already covered or not from this session log) 
 
- DYNAMIC_SERVER_USAGE warnings — already covered in §4.8 existing table and Lesson 14 
- api() vs apiPublic() split — already covered in §4.8, §4.7, and RUNTIME-2 through RUNTIME-5 
- Dead code removal (CurrencySelector) — this is a process lesson, not a React/Next.js pattern. Not suitable for this handbook's scope. 
- escapeForScriptContext full canonical set details — the canonical 5-char set is specified in the Skill 2 reference (§15.10); the handbook should reference that, not duplicate it. 
 
### Frontmatter changes 
 
- version: 1.4 → version: 1.5 
- Reconciliation note: add "(8) §4.8 four new Mistakes (IntersectionObserver timing, next/image fill + CSS Grid, useSearchParams Suspense, useEffect deps on route change); (9) §5.8 ScrollRevealTrigger pattern; (10) §6.8 three React 
  anti-patterns (grid placement on Image fill, raw JSON-LD dangerouslySetInnerHTML, hooks defined but never called); (11) §10 six new case-index rows (RENDER-1 through RENDER-5, SECURITY-1); (12) §12 four new lessons ranked 15–18 
  (hooks called not just defined, IntersectionObserver timing, image fill + grid flow, useSearchParams Suspense)." 
 
### Files to edit 
 
Only one file: /home/project/maison/nextjs-typescript_SKILL.md 
 
### Estimated line impact 
 
~180 new lines (4 Mistakes at ~15 lines each = 60; 1 Pattern at ~10 lines; 3 Anti-patterns at ~8 lines = 24; 6 case-index rows at 1 line each = 6; 4 Lessons at ~10 lines each = 40; reconciliation note = ~10). Net addition to a 
5,453-line file: ~180 lines.  

DELIVER — Both tasks complete 
 
### Task 1: Validation of session_log_2.md 
 
Result: All issues fixed as described. No regressions. 
 
Verified by reading every source file the log touched (V11–V16), running all light gates (104 web tests exact), and performing a cross-cutting scan for similar issues elsewhere. 
 
Cross-cutting scan findings: 
- 1 latent issue found: SortSelect.tsx uses useSearchParams() without a <Suspense> boundary — same class as the V15 build failure. Not actively broken because /products already reads searchParams in its Server Component (making it ƒ   
  Dynamic regardless), but would cause a build error if the page were ever restructured to remove the Server Component's searchParams access. 
- 0 active regressions. All V11–V16 code is present, all gates pass, all deferred items confirmed unchanged. 
 
### Task 2: nextjs-typescript_SKILL.md updated v1.4 → v1.5 
 
┌────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ 
│ Section        │ What was added                                                                                                                          │ 
├────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ Frontmatter    │ Version 1.4 → 1.5; reconciliation note with v1.5 changes                                                                                │ 
├────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ §4.8           │ 4 new Mistakes: IntersectionObserver timing, next/image fill + CSS Grid, useSearchParams Suspense, useEffect([]) route deps             │ 
├────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ §4.8 checklist │ 2 new items (#10 Image fill grid check, #11 useSearchParams Suspense check)                                                             │ 
├────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ §5.8           │ ScrollRevealTrigger pattern (side-effect-only Client Component in shared layout)                                                        │ 
├────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ §6.8           │ 3 new anti-patterns (grid placement on Image fill, raw JSON-LD, hooks never called)                                                     │ 
├────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ §10            │ 6 new case-index rows (RENDER-1 through RENDER-5, SECURITY-1)                                                                           │ 
├────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ §12            │ 4 new lessons (#15 hooks called not just defined, #16 IntersectionObserver timing, #17 Image fill + grid, #18 useSearchParams Suspense) │ 
└────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ 
 
Net growth: 5,453 → 5,670 lines (+217 lines, +4.0%). 

---

$ git diff nextjs-typescript_SKILL.md
diff --git a/nextjs-typescript_SKILL.md b/nextjs-typescript_SKILL.md
index 7f6a50e..3d415e3 100644
--- a/nextjs-typescript_SKILL.md
+++ b/nextjs-typescript_SKILL.md
@@ -1,17 +1,17 @@
 ---
 name: nextjs-typescript-patterns
 description: Monorepo web projects using pnpm, Turborepo, TypeScript, Next.js, React, ESLint, Prettier, Drizzle ORM, Postgres, and third-party SDKs (tRPC, Trigger.dev, Stripe, Better Auth, Sanity, React Email, Vitest). v1.4 — canonical troubleshooting handbook with 45+ case-indexed anti-patterns across install, type-check, lint, format, test, build, migration, and pre-commit-hook gates. Covers pnpm 10+ native-build approval (allowBuilds, onlyBuiltDependencies), strict workspace isolation, tsconfig path aliases and inherited baseUrl, Drizzle migration journal drift and silent spinner-masked failures, exactOptionalPropertyTypes, noUncheckedIndexedAccess, React 19 SubmitEvent migration, ESLint flat-config FlatCompat, Prettier ignore-path semantics, SDK drift (subpath exports, hardcoded API versions, callback payload shapes), runtime assertions that do not narrow TypeScript types, .prettierrignore as gate-silencer, and the Surgical Change Discipline. Use when debugging failing gates, reproducing mysterious install/type/lint/format/hook failures, remediating monorepo tooling debt across Next.js + TypeScript + Drizzle + tRPC + Better Auth, or hardening a fresh monorepo against repeated mistakes — symptoms like ERR_PNPM_NO_MATCHING_VERSION, TS2307/TS2339, TS18047 after runtime null-checks, __esModule config errors, passWithNoTests, or silent DATABASE_URL/Drizzle migration failures.
-version: 1.4
+version: 1.5
 ---
 
 # Consolidated Agent Briefing Document and Programming Handbook
 
 ## Agent Programming and Troubleshooting Handbook
 
-Version: 1.4  
+Version: 1.5  
 Scope: Monorepo web projects using pnpm, Turborepo, TypeScript, Next.js, React, ESLint, Prettier, Drizzle, Postgres, and third-party SDKs.  
 Purpose: Prevent repeated mistakes and provide a reusable troubleshooting methodology.  
-Reconciliation note: v1.4 adds: (1) §4.2 TS Mistake 17 — runtime assertions (`expect().not.toBeNull()`) do not narrow TypeScript types; (2) §4.4 Prettier Mistake 8 + anti-pattern — `.prettierrignore` as gate-silencer vs. unowned-content marker; (3) §4.9 Testing Mistake 4 — async-deferred-to-null file reads in contract tests (Stillwater's `readFileSync` → `string` pattern); (4) §5.9 corrected both source-contract-test and meta-guard pattern blocks from async to synchronous null-free form; (5) §7 Playbook 17 — `TS18047` after runtime null-check, two-branch fix (preferred: non-null producer); (6) §10 four new case-index rows (TS-9, PRETTIER-6, TEST-1, RUNTIME-6); (7) §12 Lesson 13 sharpened — prior green-checkmarks are also hypotheses, not just prose conclusions. v1.3 added: (1) Playbook 16 Scenario B — auth-guarded route `DYNAMIC_SERVER_USAGE` warnings are expected + the `force-dynamic`/`cacheComponents` trap; (2) §5.9 Testing Patterns — source contract tests for architectural invariants + meta-guard pattern for caller modules; (3) §4.10 Mistake 7 — `.gitignore` `lib/` bleed in Python+JS monorepos; (4) §12 Lesson 14 — distinguishing public-route from auth-route warnings; (5) §4.8 Server/Client Boundary note — the `api()`/`apiPublic()` split is a Server Component concern. v1.2 absorbed the genuine deltas from `update.md` (parser-error line attribution + `cat -A`; `psql -f` fallback for spinner-masked silent Drizzle failures; the named "Surgical Change Discipline" and the Stillwater reference-copy caveat).
+Reconciliation note: v1.5 adds: (1) §4.8 four new Mistakes — IntersectionObserver timing in useEffect (V12), next/image fill + CSS Grid anti-pattern (V13), useSearchParams() without Suspense breaks static prerendering (V15), useEffect([]) misses client-side navigation (V14); (2) §5.8 ScrollRevealTrigger pattern — thin Client Component mounting a side-effect hook in a shared layout; (3) §6.8 three React anti-patterns — grid placement on absolutely-positioned Image fill, raw JSON.stringify in dangerouslySetInnerHTML for JSON-LD, hooks defined but never called; (4) §10 six new case-index rows (RENDER-1 through RENDER-5, SECURITY-1); (5) §12 four new lessons ranked 15–18 (hooks called not just defined, IntersectionObserver timing, image fill + grid flow, useSearchParams Suspense). v1.4 adds: (1) §4.2 TS Mistake 17 — runtime assertions (`expect().not.toBeNull()`) do not narrow TypeScript types; (2) §4.4 Prettier Mistake 8 + anti-pattern — `.prettierrignore` as gate-silencer vs. unowned-content marker; (3) §4.9 Testing Mistake 4 — async-deferred-to-null file reads in contract tests (Stillwater's `readFileSync` → `string` pattern); (4) §5.9 corrected both source-contract-test and meta-guard pattern blocks from async to synchronous null-free form; (5) §7 Playbook 17 — `TS18047` after runtime null-check, two-branch fix (preferred: non-null producer); (6) §10 four new case-index rows (TS-9, PRETTIER-6, TEST-1, RUNTIME-6); (7) §12 Lesson 13 sharpened — prior green-checkmarks are also hypotheses, not just prose conclusions. v1.3 added: (1) Playbook 16 Scenario B — auth-guarded route `DYNAMIC_SERVER_USAGE` warnings are expected + the `force-dynamic`/`cacheComponents` trap; (2) §5.9 Testing Patterns — source contract tests for architectural invariants + meta-guard pattern for caller modules; (3) §4.10 Mistake 7 — `.gitignore` `lib/` bleed in Python+JS monorepos; (4) §12 Lesson 14 — distinguishing public-route from auth-route warnings; (5) §4.8 Server/Client Boundary note — the `api()`/`apiPublic()` split is a Server Component concern. v1.2 absorbed the genuine deltas from `update.md` (parser-error line attribution + `cat -A`; `psql -f` fallback for spinner-masked silent Drizzle failures; the named "Surgical Change Discipline" and the Stillwater reference-copy caveat).
 
 ---
 
@@ -3413,6 +3413,167 @@ To determine whether a `DYNAMIC_SERVER_USAGE` warning is a bug or expected:
 
 ---
 
+### Mistake: IntersectionObserver callback does not fire for already-visible elements
+
+Symptom:
+
+- A page renders elements with a `.reveal` class (initially `opacity: 0` via CSS).
+- An `IntersectionObserver` in a `useEffect` is supposed to add `.visible` (`opacity: 1`) when elements enter the viewport.
+- Elements below the fold animate in correctly on scroll.
+- The first few elements in the initial viewport stay at `opacity: 0` forever — the page appears blank.
+
+Root cause:
+
+- `IntersectionObserver` does not reliably fire `isIntersecting: true` for elements already in the viewport when the observer is constructed inside a post-hydration `useEffect`.
+- This is a timing issue: React hydrates the DOM, `useEffect` runs, the observer is constructed — but the browser has already computed which elements are visible, and the observer's initial callback does not fire for them.
+
+Fix:
+
+```ts
+useEffect(() => {
+  const observer = new IntersectionObserver(/* ... */);
+  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
+
+  // Fallback: check elements already in viewport after first paint
+  requestAnimationFrame(() => {
+    const vh = window.innerHeight;
+    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
+      const rect = el.getBoundingClientRect();
+      if (rect.top < vh && rect.bottom > 0) {
+        el.classList.add('visible');
+        observer.unobserve(el);
+      }
+    });
+  });
+
+  return () => observer.disconnect();
+}, [/* deps */]);
+```
+
+Lesson:
+
+> Do not strip the `requestAnimationFrame` fallback as "redundant" with the observer — it covers a real first-paint timing gap that the observer cannot detect.
+
+---
+
+### Mistake: `next/image fill` with grid placement on the `<Image>` element
+
+Symptom:
+
+- A CSS Grid layout has 3 images in an asymmetric arrangement.
+- Each `<Image>` has `fill` plus `style={{ gridColumn: '1 / 2', gridRow: '1 / 3' }}`.
+- All 3 images overlap at full section size (e.g. 1280×577px), filling the entire grid area as a single broken mess.
+- No images appear in their intended grid cells.
+
+Root cause:
+
+- `<Image fill>` renders the `<img>` with `position: absolute` (so it stretches to fill its nearest positioned ancestor).
+- An absolutely-positioned element is **removed from CSS Grid flow** — `gridColumn` and `gridRow` set on the `<Image>` style have no effect.
+- The images position themselves relative to a distant ancestor (typically the section root) instead of their intended grid cell.
+
+Fix:
+
+```tsx
+// ❌ Wrong — grid placement on the absolutely-positioned Image
+<Image src={...} fill style={{ gridColumn: '1 / 2', gridRow: '1 / 3' }} />
+
+// ✅ Correct — wrapper div IS the grid item, Image fills it
+<div style={{ position: 'relative', gridColumn: '1 / 2', gridRow: '1 / 3', overflow: 'hidden' }}>
+  <Image src={...} fill style={{ objectFit: 'cover' }} />
+</div>
+```
+
+The wrapper `<div>` must have:
+- `position: 'relative'` (or `'absolute'` inside a positioned ancestor) — so the `fill` Image fills the div, not a distant ancestor.
+- `gridColumn` / `gridRow` — grid placement on the div (a normal flow element), not the Image.
+- `overflow: 'hidden'` — standard practice for cropped fill images.
+
+Lesson:
+
+> `fill` removes `<Image>` from grid flow. Grid placement must be on a wrapper div, never on the `<Image>` itself.
+
+---
+
+### Mistake: `useSearchParams()` without `<Suspense>` breaks static prerendering
+
+Symptom:
+
+- A page that previously rendered as `○ Static` now renders as `ƒ Dynamic` after adding a Client Component that calls `useSearchParams()`.
+- Or, the build fails outright with:
+
+```text
+⨯ useSearchParams() should be wrapped in a suspense boundary at page "/cart"
+```
+
+Root cause:
+
+- In Next.js 16, `useSearchParams()` in a Client Component causes a **CSR bailout** during static prerendering.
+- If the component is not wrapped in a `<Suspense>` boundary, Next.js either:
+  - Fails the build (hard error for statically-prerendered pages like `/cart`), or
+  - Silently downgrades the route from `○ Static` to `ƒ Dynamic` (no build error, but the page loses static rendering and edge caching).
+- A `<Suspense>` boundary in a **layout** only protects the specific component it wraps — other `useSearchParams()` consumers on individual pages still need their own Suspense wrappers.
+
+Fix:
+
+```tsx
+// Layout level — protects the ScrollRevealTrigger
+<Suspense fallback={null}>
+  <ScrollRevealTrigger />
+</Suspense>
+
+// Page level — protects SortSelect on /products
+<Suspense fallback={null}>
+  <SortSelect currentSort={sort} />
+</Suspense>
+```
+
+`fallback={null}` is correct for components that render nothing visible (side-effect-only triggers) or whose initial state is non-critical.
+
+Lesson:
+
+> Every `useSearchParams()` consumer in a statically-prerendered page needs its own `<Suspense>` boundary. A layout-level Suspense does not protect other consumers on child pages.
+
+---
+
+### Mistake: `useEffect([])` misses client-side navigation
+
+Symptom:
+
+- A page sets up an `IntersectionObserver` or DOM watcher in `useEffect` with an empty dependency array `[]`.
+- On initial page load, elements below the fold animate in correctly.
+- When the user navigates to a different URL via `<Link>` (client-side navigation), new elements render with the expected class names but never animate — they stay hidden until a full page reload.
+
+Root cause:
+
+- Client-side navigation via `<Link>` changes the URL and renders new page content **without remounting the layout**.
+- `useEffect(() => { ... }, [])` only runs once on mount — it never re-runs when the URL changes.
+- New `.reveal` elements (or other hook-managed DOM elements) render after the effect has already set up its observer, so they are never observed.
+
+Fix:
+
+```ts
+import { usePathname, useSearchParams } from 'next/navigation';
+
+export function useScrollReveal() {
+  const pathname = usePathname();
+  const searchParams = useSearchParams();
+
+  useEffect(() => {
+    const observer = new IntersectionObserver(/* ... */);
+    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
+    return () => observer.disconnect();
+  }, [pathname, searchParams]); // ← re-runs on every route/query change
+}
+```
+
+The cleanup function (returning `() => observer.disconnect()`) is essential: it tears down the old observer before the new one is constructed.
+
+Lesson:
+
+> `useEffect([])` in a shared layout component misses client-side navigations. Add `usePathname()` and `useSearchParams()` as dependencies so the effect re-runs on every route change.
+
+---
+
 ## React/Next.js Checklist
 
 When React or Next.js lint/type issues appear:
@@ -3426,6 +3587,8 @@ When React or Next.js lint/type issues appear:
 7. Check server/client component boundaries.
 8. Verify route handler conventions.
 9. Wrap Better Auth React hooks (`useSession`) in a `ClientOnly` boundary — never let them execute during SSR.
+10. For `next/image fill` in CSS Grid layouts: verify grid placement is on a wrapper `<div>`, not the `<Image>` itself.
+11. For `useSearchParams()` consumers: verify each is wrapped in `<Suspense>` if the page is statically prerendered.
 
 ---
 
@@ -4010,6 +4173,36 @@ pnpm --filter=@scope/pkg exec prettier --write src/components/new-file.tsx
 
 This applies even when the file was written by a tool that produces "clean" output — Prettier's formatting rules (print width, trailing commas, semicolons, class sorting) may differ from the writer's defaults.
 
+### Pattern: ScrollRevealTrigger — side-effect-only Client Component in a shared layout
+
+When a hook needs to run as a side effect (e.g. `IntersectionObserver` setup) on every page under a layout, but renders no visible DOM, use a thin Client Component that:
+
+1. Is marked `'use client'`.
+2. Calls the hook in its body (no JSX return — renders `null`).
+3. Is imported and rendered once in the shared layout.
+4. Is wrapped in `<Suspense fallback={null}>` if the hook uses `useSearchParams()` or other APIs that break static prerendering.
+
+```tsx
+// ScrollRevealTrigger.tsx
+'use client';
+import { useScrollReveal } from '@/hooks/useScrollReveal';
+export function ScrollRevealTrigger() {
+  useScrollReveal();
+  return null;
+}
+
+// (shop)/layout.tsx
+<Suspense fallback={null}>
+  <ScrollRevealTrigger />
+</Suspense>
+```
+
+Why this pattern:
+- Separates the hook's lifecycle from the page's render — the hook runs on mount, not per-page.
+- Avoids re-running `IntersectionObserver` setup in every `ProductCard` (which would be per-card overhead and miss dynamically-loaded cards).
+- The `<Suspense>` boundary satisfies Next.js 16's requirement for `useSearchParams()` in statically-prerendered pages.
+- `fallback={null}` is correct because the trigger renders nothing visible.
+
 ---
 
 ## 5.9 Testing Patterns
@@ -4215,6 +4408,9 @@ This catalog names recurring mistakes so future agents can recognize them early.
 | Better Auth React hooks during SSR | `useSession`/`authClient.useX()` calls `useRef` in SSR chunk → `null.useRef()` | Wrap in `ClientOnly` boundary |
 | `next/dynamic({ ssr: false })` in Server Component | Next.js 16 forbids — build fails | Use `ClientOnly` wrapper instead |
 | Public route forced dynamic by server caller | `api()` calls `headers()` → public page loses static rendering → empty prerender | Use `apiPublic()` for session-free public data |
+| Grid placement on `<Image fill>` | `position: absolute` (from `fill`) removes Image from grid flow; `gridColumn`/`gridRow` silently ignored | Wrap in `<div position:relative>` that carries grid placement |
+| Raw `JSON.stringify` in `dangerouslySetInnerHTML` for JSON-LD | XSS vector if data contains `</script>` | Escape with `escapeForScriptContext()` (5-char canonical set: `<>&` + U+2028 + U+2029) |
+| Hook defined but never called | Hook file exists, compiles, exports — but no component imports or invokes it; feature silently does nothing | Verify hook is imported AND invoked in a component tree |
 
 ---
 
@@ -5274,6 +5470,12 @@ This index summarizes the major incidents and their distilled lessons.
 | TS-9 | TS18047 after runtime `not.toBeNull` | `readFile().catch(()=>null)` widened producer to `string | null`; `expect().not.toBeNull()` is not a type guard | Null-free producer (`readFileSync` → `string`) or real type guard at deref site | Runtime assertions do not narrow TypeScript types |
 | PRETTIER-6 | `.prettierrignore` masking a real `[warn]` | File genuinely mis-formatted; exclusion added to silence the gate instead of fixing the file | `prettier --write` then remove exclusion from `.prettierrignore` | Ignore files are for unowned content, not gate-silencing |
 | TEST-1 | Contract test async null swallow | `readFile().catch(()=>null)` widens type + hides ENOENT into a confusing regex failure | Synchronous `readFileSync` → `string` (throws on missing, null-free) | Contract tests should throw on missing sources |
+| RENDER-1 | `/products` blank screen — cards rendered but invisible | `useScrollReveal` hook defined but never called; `.reveal` CSS sets `opacity: 0` | Wire hook via `ScrollRevealTrigger` Client Component in shop layout | Verify hooks are called, not just defined |
+| RENDER-2 | Initial product cards stay `opacity: 0` on page load | IntersectionObserver doesn't fire for already-visible elements when constructed in post-hydration `useEffect` | `requestAnimationFrame` fallback with `getBoundingClientRect()` check | IntersectionObserver timing issue with useEffect |
+| RENDER-3 | Philosophy section images missing | `next/image fill` (`position: absolute`) with `gridColumn`/`gridRow` on `<Image>` — grid placement silently ignored | Wrap Image in `position: relative` div that IS the grid item | `fill` removes elements from grid flow |
+| RENDER-4 | Collection filter pages blank on client-side navigation | `useEffect([])` in `useScrollReveal` never re-runs when URL changes via `<Link>` | Add `usePathname`/`useSearchParams` as `useEffect` dependencies | Client-side nav doesn't re-run empty-deps effects |
+| RENDER-5 | Build fails: `useSearchParams() should be wrapped in a suspense boundary` | V14 added `useSearchParams()` to `useScrollReveal`; no Suspense boundary in shop layout | Wrap `<ScrollRevealTrigger />` in `<Suspense fallback={null}>` | `useSearchParams()` needs Suspense in statically-prerendered pages |
+| SECURITY-1 | JSON-LD script tag XSS vector | `dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}` — if product data contains `</script>`, attacker-controlled script runs | Apply `escapeForScriptContext()` (5-char canonical set) before `dangerouslySetInnerHTML` | Always escape script context in inline JSON-LD |
 
 ---
 
@@ -5394,6 +5596,22 @@ Lesson:
 
 > When you see `DYNAMIC_SERVER_USAGE`, ask: "Does this route actually need a session?" If yes, the warning is correct. If no, it's a real bug. Never blanket-fix all warnings without distinguishing the two cases.
 
+## 15. Verify hooks are called, not just defined
+
+A hook file exists, exports cleanly, and compiles without error — but no component imports or calls it. The feature silently does nothing. After defining a hook, verify it is imported AND invoked in a component tree (not just referenced in a CSS comment or type definition). This was the root cause of the `/products` blank-screen defect: `useScrollReveal` was defined but had zero consumers. The `.reveal` CSS set `opacity: 0`, the `.reveal.visible` CSS set `opacity: 1`, but the bridge between them (the hook that adds the `visible` class) was never executed.
+
+## 16. IntersectionObserver may not fire for already-visible elements
+
+When an `IntersectionObserver` is constructed inside a post-hydration `useEffect`, it may not fire the `isIntersecting` callback for elements already in the viewport on page load. The browser has already computed which elements are visible, and the observer's initial check does not trigger for them. Add a `requestAnimationFrame` fallback that checks `getBoundingClientRect()` and manually adds the visible class to elements whose bounding box overlaps the viewport. Do not remove this fallback as "redundant" — it covers a real first-paint timing gap that the observer cannot detect.
+
+## 17. `next/image fill` renders `position: absolute` — grid placement must be on a wrapper div
+
+`<Image fill>` renders the `<img>` with `position: absolute` so it stretches to fill its nearest positioned ancestor. An absolutely-positioned element is removed from CSS Grid flow — so `gridColumn` / `gridRow` set on the `<Image>` style have no effect. The image positions itself relative to a distant ancestor instead of its intended grid cell, producing broken or invisible images. Fix: wrap each `<Image fill>` in a `<div style={{ position: 'relative', gridColumn, gridRow, overflow: 'hidden' }}>` that IS the grid item.
+
+## 18. `useSearchParams()` in a Client Component requires `<Suspense>` for static pages
+
+In Next.js, a Client Component calling `useSearchParams()` during static prerendering causes either a hard build error (`useSearchParams() should be wrapped in a suspense boundary`) or a silent downgrade from `○ Static` to `ƒ Dynamic`. Wrap the consumer in `<Suspense fallback={null}>`. This applies to **every** `useSearchParams()` consumer — not just one instance. A layout-level Suspense boundary only protects the component it wraps; other consumers on individual pages need their own Suspense wrappers.
+
 ---
 
 # 13. One-Page Agent Field Card

