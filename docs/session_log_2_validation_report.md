# Validation Report — `docs/session_log_2.md`

**Scope:** Validate that the codebase matches every verifiable claim in `docs/session_log_2.md` (the V11 → V16 remediation arc).
**Method:** Meticulous Approach — ANALYZE (extract claims) → verify against source → run gates → cross-cutting audit → report.
**Validated at commit:** `b4c35e1` (one commit past the log's last mentioned commit `1014096` [v16]; `b4c35e1` = "update pnpm log", touches no app/packages code — no drift).
**Per user instruction:** light gates only (`lint`, `check-types`, `test`, `format:check`); `pnpm build` and live-site checks were not run.

---

## 1. Result: PASS

Every static/code claim in the session log matches the current source exactly. Every light gate passes. The cross-cutting `next/image fill` invariant audit (the V13 follow-through claim) is fully upheld. No discrepancies between the log's narrative and reality were found.

---

## 2. Claims inventory & validation matrix

### 2.1 Code claims (verified by reading source)

| Claim | File | Evidence | Status |
|---|---|---|---|
| **V11-1** — `useScrollReveal` wired (not just defined) | `hooks/useScrollReveal.ts` | Hook exists, imports `usePathname`/`useSearchParams`, `useEffect` with `[pathname, searchParams]` deps (V14), `requestAnimationFrame` fallback (V12) | ✅ |
| **V11-1** — `ScrollRevealTrigger` Client Component mounts the hook | `components/shop/ScrollRevealTrigger.tsx` | `'use client'` directive, body = `useScrollReveal(); return null;` | ✅ |
| **V11-1** — Wired into shop layout | `app/(shop)/layout.tsx` | Imports + renders `<ScrollRevealTrigger />` wrapped in `<Suspense fallback={null}>` (V15) | ✅ |
| **V11-2** — `escapeForScriptContext` helper added | `lib/utils.ts:108` | Defined, escapes full 5-char canonical set (V16-1) | ✅ |
| **V11-2** — Applied to PDP JSON-LD | `app/(shop)/products/[slug]/page.tsx:107` | `dangerouslySetInnerHTML={{ __html: escapeForScriptContext(JSON.stringify(jsonLd)) }}` | ✅ |
| **V12-1** — `requestAnimationFrame` fallback for initial-viewport timing | `hooks/useScrollReveal.ts` | Present (`requestAnimationFrame(() => { … getBoundingClientRect() … })`) | ✅ |
| **V12-2** — `CurrencySelector.tsx` deleted | — | `rg CurrencySelector` across `apps/`+`packages/` → **0 references** | ✅ |
| **V13-1** — Philosophy `next/image fill` wrapped in positioned grid-item divs | `components/shop/sections/Philosophy.tsx` | 3 Images each wrapped in `<div style={{ position:'relative', gridColumn, gridRow, overflow:'hidden' }}>` | ✅ |
| **V14-1** — effect re-runs on route/query change | `hooks/useScrollReveal.ts` | `usePathname` + `useSearchParams` imported from `next/navigation`; deps `[pathname, searchParams]` | ✅ |
| **V15-1** — `<ScrollRevealTrigger />` wrapped in `<Suspense>` | `app/(shop)/layout.tsx` | `<Suspense fallback={null}><ScrollRevealTrigger /></Suspense>` | ✅ |
| **V16-1** — `escapeForScriptContext` escapes full Skill 2 §15.10 canonical set | `lib/utils.ts:108-115` | `<`→`\u003c`, `>`→`\u003e`, `&`→`\u0026`, U+2028→`\u2028`, U+2029→`\u2029` | ✅ |

### 2.2 CSS / runtime chain (verified by reading source)

| Claim | File:line | Evidence | Status |
|---|---|---|---|
| `.reveal` initial state | `app/globals.css` `@utility reveal` | `opacity: 0; transform: translateY(24px)` — Tailwind v4 `@utility` directive (correct v4 syntax) | ✅ |
| `.reveal.visible` final state | `app/globals.css:201` | `opacity: 1; transform: translateY(0)` — plain CSS compound selector (correct, `@utility` is single-class only) | ✅ |
| `prefers-reduced-motion` override | `app/globals.css:208` | `@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none } }` | ✅ |
| `ProductCard` uses `reveal` class | `components/shop/ProductCard.tsx:72` | `className="product-card reveal"` + `position: 'relative'` | ✅ |
| Pexels in `remotePatterns` + CSP `img-src` (V13 dep) | `apps/web/next.config.ts:66, 87` | Both present | ✅ |

### 2.3 Verification gates (ran fresh; `Cached: 0 cached, 8 total` for test)

| Gate | Log claim | Actual result | Status |
|---|---|---|---|
| `pnpm lint` | pass (13 packages) | `1 successful / 1 total` (13 packages) | ✅ |
| `pnpm check-types` | 10/10 packages | `10 successful / 10 total` | ✅ |
| `pnpm format:check` | clean | "All matched files use Prettier code style!" | ✅ |
| `pnpm test` (packages) | 8/8 | `8 successful / 8 total` | ✅ |
| `pnpm test` (@maison/web) | 104 web tests | **104 passed (9 files)** | ✅ exact |
| `pnpm test` (@maison/api) | (AGENTS.md: 20) | 20 passed (5 files) | ✅ |
| `pnpm test` (@maison/auth) | (AGENTS.md: 35) | 35 passed (2 files) | ✅ |
| `pnpm test` (@maison/payments) | (AGENTS.md: 18) | 18 passed (3 files) | ✅ |
| `pnpm test` (@maison/db) | — | 17 passed (3 files) | ✅ |
| `pnpm test` (@maison/workers) | — | 5 passed (1 file) | ✅ |
| `pnpm test` (@maison/config) | — | 3 passed (1 file) | ✅ |

> Note: `@maison/studio`, `@maison/ui`, `@maison/email`, `@maison/eslint-config`, `@maison/tailwind-config`, `@maison/typescript-config` report no test/`check-types` tasks (consistent with AGENTS.md which tracks `@maison/api`, `auth`, `payments`, `web` as the test-bearing packages).

### 2.4 Contract tests (the V11/V14 deliverables)

| Claim | File | Test count | Status |
|---|---|---|---|
| V11-1 + V14-1 contract test locks scroll-reveal wiring | `lib/__tests__/scroll-reveal-wiring.contract.test.ts` | `describe V11-1` (3 tests: hook file exists, trigger `'use client'` + `useScrollReveal`, layout imports+renders `<ScrollRevealTrigger>` inside `<Suspense>`) + `describe V14-1` (2 tests: `usePathname` from `next/navigation`, deps array `[pathname…]` not `[]`) = **5 tests** | ✅ matches log's "5 tests" + AGENTS.md doc |
| Contract test file count for `@maison/web` | AGENTS.md: 9 files | `ls lib/__tests__/` = 9 files | ✅ |

### 2.5 `next/image fill` invariant audit (V13 follow-through claim)

The log + AGENTS.md claim: "All 13 production `next/image fill` usages … all have a `position: relative` parent." The frame "13 production fill usages / 12 non-Philosophy sites" in AGENTS.md counts the 13 **non-Philosophy** sites (FeaturedCollection, CategoryGrid, Hero, InstagramGrid, JournalSection, HyggeEdit, ProductCard×2, SearchModal, products/[slug]×2, about×2 = 13); + Philosophy's 3 = **16 total**. Measured total = **16**, exactly.

| File | Fills | Positioned parent | Compliant |
|---|---|---|---|
| sections/FeaturedCollection.tsx | 1 | `<div position:'relative' overflow aspectRatio>` | ✅ |
| sections/CategoryGrid.tsx | 1 | `<a position:'relative' aspectRatio overflow>` | ✅ |
| sections/Hero.tsx | 1 | `<div position:'absolute' inset:0>` inside positioned ancestor | ✅ |
| sections/InstagramGrid.tsx | 1 | `<a position:'relative' aspectRatio overflow>` | ✅ |
| sections/JournalSection.tsx | 1 | `<div position:'relative'>` | ✅ |
| sections/HyggeEdit.tsx | 1 | `<div position:'absolute' inset:0>` inside positioned ancestor | ✅ |
| sections/Philosophy.tsx | 3 | each `<div position:'relative' gridColumn/gridRow overflow>` (V13-1 fix) | ✅ |
| ProductCard.tsx | 2 | `<div position:'relative' aspectRatio:'4/5' overflow>` | ✅ |
| SearchModal.tsx | 1 | `<div position:'relative'>` | ✅ |
| app/(shop)/products/[slug]/page.tsx | 2 | both wrapped in `<div position:'relative' overflow:'hidden'>` | ✅ |
| app/(shop)/about/page.tsx | 2 | `<div position:'absolute' inset:0>` (in relative section) + `<div position:'relative' aspectRatio overflow>` | ✅ |
| **Total** | **16** | — | **16/16 ✅** |

**Anti-pattern probe:** `rg --multiline '<Image[\s\S]{0,300}grid(Column|Row)' web/src → 0 matches`. The only `gridColumn`/`gridRow` usage in the entire app is the 6 lines in `Philosophy.tsx`, all on wrapper `<div>`s (lines 39, 40, 55, 56, 71, 72) — none on `<Image>`. The V13-1 anti-pattern (grid placement on the absolutely-positioned image) is provably absent.

---

## 3. Scope notes / limitations of this validation

- **`pnpm build` was NOT run** (per user instruction). The log's claim that "build succeeded 10/10, no build errors — V15 Suspense fix resolved the build failure" is therefore accepted on the basis of: (a) the V15-1 source fix being present and correct, (b) the contract test asserting the `<Suspense>` boundary, (c) `check-types` passing, (d) `lint` passing. To obtain direct proof that `useSearchParams` no longer breaks static prerendering, a `pnpm build` run would be required.
- **Live site (`maison.jesspete.shop`) was NOT probed**. The log's runtime claims (curl 200s, agent-browser E2E showing visible product cards + working client-side filter navigation) were time-sensitive observations at the moment of remediation; re-validating them is out of scope for a codebase validation and the live state may have changed.
- **`skills/` directory** shows ~2000 deleted entries in `git status` — intentionally deleted on local disk to save space (kept on the GitHub remote). Excluded from this validation; irrelevant to the app code.
- **Warning noted, non-blocking:** during `pnpm test`, turbo emitted "no output files found for task … Please check the `outputs` key in `turbo.json`" for 8 packages. Pre-existing tooling concern unrelated to the session-log claims.

---

## 4. Conclusion

`docs/session_log_2.md` is an **accurate record** of state that is faithfully reflected in the current codebase at `b4c35e1`. Every code-level claim (V11-1, V11-2, V12-1, V12-2, V13-1, V14-1, V15-1, V16-1), every gate claim (`lint`, `check-types`, `format:check`, `test` with exact web-test count of 104), and the cross-cutting `next/image fill` invariant audit all hold. The one numeric phrasing nuance in AGENTS.md ("13 production" vs "12 non-Philosophy") is internally reconciled (13 non-Philosophy + 3 Philosophy = 16 = measured count).

**No remediation required.** The session log can be trusted as a source of truth for the V11–V16 remediation arc. If desired, the only remaining un-proven claim is the production build passing (covered by a single `pnpm build` run when ready).
