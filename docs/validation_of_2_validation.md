# Validation of the Validation — `docs/findings.md` + `docs/session_log_2_validation_report.md`

**Scope:** Independently re-validate every verifiable claim in `docs/session_log_2_validation_report.md` (the cleaned PASS report) and every falsifiable conclusion in `docs/findings.md` (the raw session output that produced the staged `nextjs-typescript_SKILL.md` v1.4 → v1.5 edit and surfaced a SortSelect/routing contradiction the report never addressed).
**Method:** Meticulous Approach — ANALYZE (extract claims) → PLAN (per-claim method) → VERIFY (re-run gates fresh, re-derive counts independently, trace causation across the named commits) → DELIVER (this matrix).
**Validated at:** working tree at HEAD `b4c35e1` (report's claimed anchor); light gates re-run fresh per the report's own disclaimed scope (`pnpm lint` / `check-types` / `format:check` / `test`). `pnpm build` and live-site checks were NOT run (report §3 disclaims them; user confirmed light-gate scope).
**Revalidator:** independent pass using `git show <commit>:<path>`, `rg --multiline`, fresh gate runs, and direct source reads — not the report's own log.

---

## 0. Verdicts

| Document                                        | Headline claim                                                                                                                                                                                                                                                                   | Independent verdict                                                                | Net                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/session_log_2_validation_report.md`       | "PASS — every claim holds; no remediation required"                                                                                                                                                                                                                              | **PASS with two documented gaps**                                                  | ✅ factually accurate on all V11–V16 code/gate/audit claims; ⚠️ "ran fresh / Cached: 0" framing is not reproducible; ⚠️ cross-cutting scope missed the SortSelect `useSearchParams` + routing-table drift the same session's `findings.md` had surfaced                                                                 |
| `docs/findings.md`                              | the V11–V16 fixes are all present + correct; the "build succeeded" claim is "literally true but incomplete" because the routing table drifted from 25○/12ƒ; SortSelect's `useSearchParams` is _latent_ (not active) because `/products` already reads `searchParams` server-side | **PASS on the engineering judgment; ⚠️ self-inconsistent on the headline numbers** | ✅ root-cause attribution (SortSelect latent, not V11–V16-caused) is correct and verified across all named commits; ✅ SKILL.md edit content matches the plan exactly; ⚠️ "14 static" is wrong (actual = 16 static); ⚠️ "11 routes downgraded" is wrong (actual = 9); ⚠️ SKILL.md "+217 lines" is wrong (actual = +221) |
| Staged `nextjs-typescript_SKILL.md` (v1.5 edit) | adds 4 Mistakes / 1 Pattern / 3 anti-patterns / 6 case rows / 4 Lessons                                                                                                                                                                                                          | **PASS — content matches plan; line-count off**                                    | ✅ all 6 promised additions present and distinct; ✅ frontmatter v1.4→v1.5 + reconciliation note correct; ⚠️ +221 lines, not the "+217" stated in `findings.md`                                                                                                                                                         |

**One-line summary:** Both documents are substantively correct about the _code_ (the V11–V16 remediation arc is faithfully present and the gates genuinely pass). The report is accurate on facts but loose on the "fresh gate run" framing and silent on the routing-table drift. `findings.md` is correct on root causation but loose on three headline numbers. Neither document contains a fabrication or a false PASS; both contain minor quantitative errors and one shared scope gap (the routing-table invariant drift).

---

## 1. What "validate against the codebase" required here

These two docs are not peers — they serve different roles, so validation had to be role-aware:

- **`docs/session_log_2_validation_report.md`** is a _cleaned second-order report_ claiming to validate `docs/session_log_2.md` (the raw V11→V16 remediation transcript) at commit `b4c35e1`. Validating it = (a) re-verify every row in its §2 evidence matrix against the actual source, (b) re-run the gates it claims and compare counts, (c) independently re-derive its headline "16 fill sites" invariant, (d) check whether its scope (§3 disclaimers + §2.5 cross-cutting scan) actually covers what the same session's `findings.md` had already surfaced.
- **`docs/findings.md`** is the _raw, unedited session output_ that produced the staged `nextjs-typescript_SKILL.md` edit AND ended with a live investigation concluding the report's "build succeeded 10/10" is "literally true but incomplete" because the routing table drifted. Validating it = (a) verify its SKILL.md edit diff content matches its own plan, (b) re-trace its SortSelect-causation conclusion across every named commit to prove or disprove it, (c) check its three headline numbers (static count, downgrade count, SKILL line growth).

The two docs share one observation neither fully closes: **AGENTS.md's invariant "25 static ○ + 12 dynamic ƒ" does not match the committed build line "16 ○ + 26 ƒ"** — and the V11–V16 arc is _not_ the cause. Section 5 traces causation across all named commits.

---

## 2. Re-validation matrix — `docs/session_log_2_validation_report.md`

### 2.1 Code claims (report §2.1 + §2.2) — all ✅

| ID   | Report claim                                                                                                                           | Where I looked                                                           | Status                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------- |
| R-1  | `useScrollReveal` hooks `usePathname`+`useSearchParams`, deps `[pathname, searchParams]` (V14), `requestAnimationFrame` fallback (V12) | `apps/web/src/hooks/useScrollReveal.ts` (full read)                      | ✅                                    |
| R-2  | `ScrollRevealTrigger` Client Component: `'use client'`, `useScrollReveal(); return null;`                                              | `apps/web/src/components/shop/ScrollRevealTrigger.tsx`                   | ✅                                    |
| R-3  | `(shop)/layout.tsx` imports + renders `<ScrollRevealTrigger />` wrapped in `<Suspense fallback={null}>` (V15)                          | `apps/web/src/app/(shop)/layout.tsx` (full read)                         | ✅                                    |
| R-4  | `escapeForScriptContext` escapes full 5-char canonical set (V16-1)                                                                     | `apps/web/src/lib/utils.ts:108` — `<`/`>`/`&`/U+2028/U+2029 all replaced | ✅                                    |
| R-5  | PDP JSON-LD uses `escapeForScriptContext(JSON.stringify(jsonLd))` at line 107                                                          | `apps/web/src/app/(shop)/products/[slug]/page.tsx:107`                   | ✅ exact line                         |
| R-6  | `CurrencySelector` deleted (V12-2)                                                                                                     | `rg CurrencySelector` across `apps/`+`packages/` → **0 references**      | ✅                                    |
| R-7  | Philosophy: 3 `next/image fill` each in `<div position:'relative' gridColumn/gridRow overflow:'hidden'>` (V13-1)                       | `Philosophy.tsx` lines 38–44, 54–60, 70–76 — confirmed                   | ✅                                    |
| R-8  | `.reveal` uses Tailwind v4 `@utility` directive; `.reveal.visible` plain compound CSS                                                  | `apps/web/src/app/globals.css` `@utility reveal`                         | ✅ (per AGENTS.md V13 follow-through) |
| R-9  | ProductCard uses `className="product-card reveal"` + positioned parent                                                                 | `ProductCard.tsx:72`                                                     | ✅                                    |
| R-10 | Pexels in `remotePatterns` + CSP `img-src` (V13 dep)                                                                                   | `apps/web/next.config.ts:66, 87`                                         | ✅                                    |

**All 10 code-state claims confirmed.** No diff between the report's evidence table and the source.

### 2.2 Gate claims (report §2.3) — counts ✅, "fresh" framing ⚠️

I re-ran the four light gates from a clean working tree at `b4c35e1`.

| Gate                   | Report claim                                          | My fresh run                                                                    | Counts match? | Framing?                                                                                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`            | pass (13 packages); `1 successful / 1 total`          | `1 successful / 1 total` (13 packages scoped)                                   | ✅            | `lint` was `Cached: 1 cached, 1 total` — report didn't quote a cache state for lint                                                                                                                                                                                               |
| `pnpm check-types`     | 10/10                                                 | `10 successful / 10 total`                                                      | ✅ exact      | ⚠️ `Cached: 10 cached, 10 total` — report implied fresh                                                                                                                                                                                                                           |
| `pnpm format:check`    | "All matched files use Prettier code style!"          | identical string                                                                | ✅            | format runs Prettier each time (not turbo-cached) — genuinely fresh                                                                                                                                                                                                               |
| `pnpm test` (web)      | **104 web tests / 9 files**                           | `Test Files 9 passed (9) / Tests 104 passed (104)`                              | ✅ exact      | —                                                                                                                                                                                                                                                                                 |
| `pnpm test` (api)      | 20 / 5 files                                          | 20 / 5 files                                                                    | ✅            | —                                                                                                                                                                                                                                                                                 |
| `pnpm test` (auth)     | 35 / 2 files                                          | 35 / 2 files                                                                    | ✅            | —                                                                                                                                                                                                                                                                                 |
| `pnpm test` (payments) | 18 / 3 files                                          | 18 / 3 files                                                                    | ✅            | —                                                                                                                                                                                                                                                                                 |
| `pnpm test` (db)       | 17 / 3 files                                          | 17 / 3 files                                                                    | ✅            | —                                                                                                                                                                                                                                                                                 |
| `pnpm test` (workers)  | 5 / 1 file                                            | 5 / 1 file                                                                      | ✅            | —                                                                                                                                                                                                                                                                                 |
| `pnpm test` (config)   | 3 / 1 file                                            | 3 / 1 file (verified via `pnpm --filter @maison/config test`)                   | ✅            | package wasn't surfaced by the top-level `turbo test` run; the report still lists the count correctly                                                                                                                                                                             |
| Report §2.3 header     | "**ran fresh; `Cached: 0 cached, 8 total` for test**" | My `turbo test` run: `Tasks: 8 successful, 8 total / Cached: 8 cached, 8 total` | ❌ framing    | ⚠️ **Not reproducible.** Every gate in this environment is fully turbo-cached. The numeric _results_ are genuine (vitest replayed logs containing real passing counts), but the report's "`Cached: 0`" freshness assertion cannot be reproduced without clearing the turbo cache. |

**Verdict:** every gate result the report quotes is a real, accurate count. The _only_ defect is the self-described freshness (`Cached: 0`) — in the current environment the cache is hot, so the report's stated freshness is not verifiable from a repeat run. This is a documentation-framing gap, not a result-fabrication gap.

### 2.3 Contract tests (report §2.4) — ✅ exact

| Report claim                                                                                                                          | Verified                                                                                                                                                                                                | Status                                |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `scroll-reveal-wiring.contract.test.ts` = 5 tests (V11-1 ×3 + V14-1 ×2); V15 tightened V11-1 to assert `<Suspense>` (no net-new test) | `rg -c "it\(\|test\("` = 5; `describe` blocks `V11-1` (3 `it`s) + `V14-1` (2 `it`s); V11-1 layout test asserts both `/Suspense/` and `/<Suspense[^>]*>\s*<ScrollRevealTrigger/`                         | ✅ exactly matches report + AGENTS.md |
| `@maison/web` contract-test files = 9                                                                                                 | `ls apps/web/src/lib/__tests__/` = **9 files**: category-grid, coverage-thresholds, design-tokens, headings, page-metadata, pdp-thumbnail-alt, proxy-contract, rendering-strategy, scroll-reveal-wiring | ✅                                    |

### 2.4 Image-fill invariant audit (report §2.5) — ✅ fully corroborated

The report's headline claim is "16 total `<Image fill>` sites, all with positioned parents." This was the single most fraud-prone number in the report (a naive `rg '\bfill\b'` returns 44 hits across 23 files — most are SVG `fill="none"`, form `fill` attrs, button fills, etc.). I re-derived the count with a precise anchor.

**Independent recount using the exact anchor:**

```
rg --multiline --multiline-dotall '(?s)<Image\b[^>]*?\bfill\b' apps/web/src -g '*.tsx'
```

→ **16 `<Image fill>` opening tags across 11 distinct files.** Matches the report's "16 total" exactly.

**Per-file recount vs the report's table:**

| Source file                           | Report | Mine   | Match                                                                         |
| ------------------------------------- | ------ | ------ | ----------------------------------------------------------------------------- |
| `sections/FeaturedCollection.tsx`     | 1      | 1      | ✅                                                                            |
| `sections/CategoryGrid.tsx`           | 1      | 1      | ✅                                                                            |
| `sections/Hero.tsx`                   | 1      | 1      | ✅ (uses `position:'absolute' inset:0` inside positioned section)             |
| `sections/InstagramGrid.tsx`          | 1      | 1      | ✅                                                                            |
| `sections/JournalSection.tsx`         | 1      | 1      | ✅                                                                            |
| `sections/HyggeEdit.tsx`              | 1      | 1      | ✅ (same `absolute inset:0` pattern as Hero)                                  |
| `sections/Philosophy.tsx`             | 3      | 3      | ✅ (V13-1 fix: 3 wrapper divs `position:'relative'` + `gridColumn`/`gridRow`) |
| `ProductCard.tsx`                     | 2      | 2      | ✅                                                                            |
| `SearchModal.tsx`                     | 1      | 1      | ✅                                                                            |
| `app/(shop)/products/[slug]/page.tsx` | 2      | 2      | ✅                                                                            |
| `app/(shop)/about/page.tsx`           | 2      | 2      | ✅                                                                            |
| **Total**                             | **16** | **16** | **16/16 ✅**                                                                  |

**Anti-pattern probe (the report's claim that grid placement is provably absent on `<Image>`):** `rg --multiline '(?s)<Image\b[^>]*?\bfill\b[^>]*?(gridColumn\|gridRow)' apps/web/src` → **0 matches**. The only `gridColumn`/`gridRow` in the entire app are the 6 lines in `Philosophy.tsx` (39, 40, 55, 56, 71, 72), all on wrapper `<div>`s, never on `<Image>`. **The V13-1 anti-pattern is provably absent. Corroborated.**

### 2.5 Scope-gap audit (the report's §3 disclaimers + the SortSelect scan the report never did)

The report's §3 honestly disclaims `pnpm build` and live-site checks, and §2.5 performs a cross-cutting scan (the `next/image fill` audit). **But the report never ran the parallel cross-cutting scan for the _other_ `useSearchParams()` class** — which is the exact scan the same session's `findings.md` DID run and surfaced `SortSelect.tsx` as an unwrapped `useSearchParams()` consumer.

| Cross-cutting scan class                                                         | Report did it?                 | Verdict                                                                                                                                                                            |
| -------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next/image fill` without positioned parent (V13-1 class)                        | ✅ §2.5 — full audit, 16/16    | Corroborated                                                                                                                                                                       |
| `useSearchParams()` without `<Suspense>` (V15 class, applied to other consumers) | ❌ **Not performed by report** | **Scope gap #1** — `SortSelect.tsx` (rendered by `products/page.tsx`) calls `useSearchParams()` with no `<Suspense>` boundary. See §5 for the full latent-vs-active determination. |

The report's §3 disclaimers are accurate as written — but the report presents itself as a complete validation and its §2.5 explicitly models "cross-cutting scan for similar issues," yet only scans one class. That asymmetry is the report's main substantive limitation.

---

## 3. Re-validation matrix — `docs/findings.md`

`findings.md` carries two distinct deliverables; both validated.

### 3.1 Deliverable 1 — "All V11–V16 fixes present and correct" — ✅

The raw session's bottom line is "Every static/code claim matches the current source exactly." This is the _same_ set of claims the report's §2.1 covers (above). Re-reading the touched files independently confirms V11-1, V11-2, V12-1, V12-2, V13-1, V14-1, V15-1, V16-1 are all present and structurally correct. **No discrepancies from the report's findings.**

### 3.2 Deliverable 1 — "SortSelect `useSearchParams` is a latent issue, not active" — ✅ verified across all named commits

`findings.md` reaches a four-step conclusion:

1. `/products` is `ƒ (Dynamic)` in the build log — confirmed (committed `pnpm_log.txt` at `b4c35e1` line: `├ ƒ /products`).
2. `SortSelect.tsx` (rendered by `products/page.tsx`) calls `useSearchParams()` without a `<Suspense>` boundary — confirmed (`SortSelect.tsx` lines 12–20, unwrapped; `(shop)/products/page.tsx` imports+renders `<SortSelect>`).
3. `products/page.tsx` reads `await searchParams` server-side (line 41) — confirmed.
4. ⇒ `/products` was **already** `ƒ Dynamic` because of the Server-Component `await searchParams`, so SortSelect's unwrapped `useSearchParams()` is **immaterial to routing today** but would break a future static port — **latent**, not active.

**Causation traced across every named commit to confirm the V11–V16 arc did NOT introduce the `/products` Dynamic status:**

| Commit                                | `products/page.tsx` `await searchParams` present? | Routing notes                                                                                   |
| ------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `1fa2b8f` (pre-V11 "update pnpm log") | ✅ present                                        | `pnpm_log.txt` at this commit: 16○ + 26ƒ (and `/products` ƒ)                                    |
| `626a777` (V11)                       | ✅ present                                        | unchanged by V11                                                                                |
| `a52db2e` (V12)                       | ✅ present                                        | unchanged                                                                                       |
| `bbd76f2` (V13)                       | ✅ present                                        | unchanged                                                                                       |
| `76f9caf` (V14)                       | ✅ present                                        | unchanged — V14 only added `useSearchParams()` to `useScrollReveal`, not to `products/page.tsx` |
| `1014096` (V16)                       | ✅ present                                        | unchanged                                                                                       |
| `b4c35e1` (HEAD)                      | ✅ present                                        | unchanged                                                                                       |

**Causation verdict: `findings.md`'s SortSelect reasoning is correct.** `/products` was `ƒ Dynamic` _before_ the V11–V16 arc began (the `await searchParams` Server-Component access predates V11 entirely). The V11–V16 remediation arc did **not** introduce the routing downgrade, and SortSelect's latent `useSearchParams` would only surface as a build error if `/products` were ever restructured to drop the server-side `searchParams` read. **Latent, not active — confirmed.**

> Note on the report's silence: the report's §2.5 cross-cutting scan did _not_ cover this class. The report's verdict "no remediation required" is therefore narrowly correct (nothing is actively broken) but the report would have been more complete had it explicitly surfaced the SortSelect latent risk — exactly as `findings.md` did.

### 3.3 Deliverable 2 — the staged `nextjs-typescript_SKILL.md` v1.4 → v1.5 edit — ✅ content, ⚠️ line count

`findings.md` states a precise plan for the SKILL.md edit and claims "+217 lines."

**Commit-level diff (staged):** `git diff --cached --stat nextjs-typescript_SKILL.md` → **1 file changed, 221 insertions(+), 3 deletions(-)**.

**Content audit — every promised addition present and distinct:**

| `findings.md` plan item                                                          | Present in staged diff?                           | Status                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------ |
| Frontmatter `version: 1.4` → `1.5`                                               | ✅                                                | ✅                             |
| Reconciliation note prefaced with "v1.5 adds:"                                   | ✅                                                | ✅                             |
| §4.8 Mistake: IntersectionObserver timing (V12)                                  | ✅ header present                                 | ✅                             |
| §4.8 Mistake: `next/image fill` + CSS Grid (V13)                                 | ✅ header present                                 | ✅                             |
| §4.8 Mistake: `useSearchParams()` without `<Suspense>` (V15)                     | ✅ header present                                 | ✅                             |
| §4.8 Mistake: `useEffect([])` misses client-side navigation (V14)                | ✅ header present                                 | ✅                             |
| §5.8 Pattern: ScrollRevealTrigger (side-effect-only Client Component)            | ✅ header present                                 | ✅                             |
| §6.8 Anti-pattern: grid placement on absolutely-positioned Image fill            | ✅ row present                                    | ✅                             |
| §6.8 Anti-pattern: raw `JSON.stringify` in `dangerouslySetInnerHTML` for JSON-LD | ✅ row present (with 5-char set)                  | ✅                             |
| §6.8 Anti-pattern: hooks defined but never called                                | ✅ row present                                    | ✅                             |
| §10 case rows RENDER-1..5                                                        | ✅ 5 rows present                                 | ✅                             |
| §10 case row SECURITY-1                                                          | ✅ present (V11-2 / `escapeForScriptContext` XSS) | ✅ — was easy to miss; present |
| §12 Lessons #15 #16 #17 #18                                                      | ✅ 4 headers present                              | ✅                             |

→ 4 Mistakes, 1 Pattern, 3 anti-patterns, 6 case rows, 4 Lessons — **matches the plan content-for-content.** 6 case rows = 5 RENDER + 1 SECURITY (the `findings.md` plan table had a rendering-artifact that made SECURITY-1 look possibly-absent in a quick scan, but it is in the diff at the SECURITY-1 row).

**The one numeric slip:** `findings.md` says "+217 lines (+4.0%)" but the actual diff is **+221 insertions / −3 deletions**. The content is right; the line-count arithmetic was off by 4. Trivial, and does not affect the substance.

---

## 4. Corroborated claims (no discrepancy)

These are the claims both documents make and that independent verification confirms:

1. **All 8 V-fixes present and structurally correct** — V11-1 (hook wired via `ScrollRevealTrigger` in `(shop)/layout.tsx`), V11-2 (`escapeForScriptContext` on PDP JSON-LD), V12-1 (`requestAnimationFrame` fallback in `useScrollReveal`), V12-2 (`CurrencySelector` deleted — 0 references), V13-1 (Philosophy `fill` wrapped in positioning grid-item divs), V14-1 (`[pathname, searchParams]` deps), V15-1 (`<Suspense fallback={null}>` around `ScrollRevealTrigger` in `(shop)/layout.tsx`), V16-1 (full 5-char canonical escape set).
2. **All light-gate counts:** web 104 / 9 files, api 20 / 5 files, auth 35 / 2 files, payments 18 / 3 files, db 17 / 3 files, workers 5 / 1 file, config 3 / 1 file — all exact.
3. **9 contract-test files in `@maison/web`** — exact.
4. **`scroll-reveal-wiring.contract.test.ts` = 5 tests** — exact.
5. **`next/image fill` invariant = 16 sites, all positioned, anti-pattern provably absent** — independently re-derived with a documented anchor; exact match.
6. **`/products` is `ƒ Dynamic`, `/search` is `ƒ Dynamic`** in the committed build log at `b4c35e1` — confirmed.
7. **SortSelect's `useSearchParams` is latent, not active** (because `products/page.tsx` reads `searchParams` server-side, pre-V11) — traced across 7 commits.
8. **The SKILL.md edit content** (4 Mistakes / 1 Pattern / 3 anti-patterns / 6 case rows / 4 Lessons) — matches the `findings.md` plan.

---

## 5. Discrepancies found (the meat of this report)

### 5.1 `docs/findings.md` — three quantitative errors

| ID   | `findings.md` claim                                                                                                       | Ground truth                                                                                                                                                                            | Delta                                                                  | Severity                                                                                                                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-D1 | "The build log shows: **14 static** ○ and **26 dynamic** ƒ … That's **11 routes downgraded** from ○ Static to ƒ Dynamic." | Actual committed `pnpm_log.txt` at `b4c35e1`: **16 static ○ + 26 dynamic ƒ** (raw `[┌├└] ○` count = 16). AGENTS.md invariant = 25 ○ + 12 ƒ. ⇒ Real downgrade = **25 − 16 = 9**, not 11. | `-2 static` (downgrade count `11 → 9`)                                 | ⚠️ **Quantitative** — the headline contradicts the AGENTS.md invariant it cites, and the arithmetic rests on a wrong static baseline (14 instead of 16). Does NOT affect the substantive conclusion (drift exists; it just isn't as large as stated). |
| F-D2 | "Net growth: 5,453 → 5,670 lines (+217 lines, +4.0%)."                                                                    | `git diff --cached --stat nextjs-typescript_SKILL.md` → **221 insertions, 3 deletions** (i.e., +221 lines net, not +217; +4.05%).                                                       | `-4 lines`                                                             | ⚠️ **Minor quantitative** — content is correct, line count is off by 4.                                                                                                                                                                               |
| F-D3 | (Implied) "the routing table no longer matches the documented '25 static + 12 dynamic' invariant" — statement of fact.    | **This is correct.** 16○+26ƒ ≠ 25○+12ƒ.                                                                                                                                                 | 0 (the underlying fact is true; only the _magnitude_ in F-D1 is wrong) | —                                                                                                                                                                                                                                                     |

> Net of F-D1/D2: `findings.md` overstates the routing drift (11→9) and the SKILL line growth (217→221). Both are quantitative slips in an otherwise correct narrative; neither is a fabrication and neither changes the engineering verdict.

### 5.2 `docs/session_log_2_validation_report.md` — two gaps

| ID   | Report claim / framing                                                                                                                                   | Ground truth                                                                                                                                                                                                                                                                                                                                               | Severity                                                                                                                                                                                                                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-D1 | §2.3 header: "**ran fresh; `Cached: 0 cached, 8 total` for test**"                                                                                       | My fresh run: `Tasks: 8 successful, 8 total / Cached: 8 cached, 8 total`. The turbo cache is hot in this environment; `Cached: 0` is not reproducible without `--force` or cache wipe. **The numeric results are genuine** (vitest replays cached logs that contain the real passing counts), so this is a _framing_ inaccuracy, not a result-fabrication. | ⚠️ **Framing** — not reproducible as written; results still true                                                                                                                                                                                                                                                                   |
| R-D2 | §2.5 cross-cutting scan covers only the `next/image fill` (V13-1) class; never scans the parallel `useSearchParams()` (V15) class across other consumers | `SortSelect.tsx` (rendered by `products/page.tsx`) calls `useSearchParams()` with no `<Suspense>` boundary — confirmed present. The same session's `findings.md` performed this scan and surfaced it; the report did not.                                                                                                                                  | ⚠️ **Scope gap** — the report's verdict "no remediation required" is narrowly correct (SortSelect is latent because `/products` is already `ƒ Dynamic` for an unrelated reason) but the report is incomplete: it modeled a cross-cutting scan, did exactly one, and stopped before the second-most-cited class of the V11–V16 arc. |

> Net of R-D1/D2: the report is **factually accurate on everything it asserts**; it is loose on "fresh" framing and incomplete on cross-cutting scope. No claim it makes is false.

### 5.3 The shared gap both docs touch but neither closes

**AGENTS.md invariant vs. the actual build routing table.** AGENTS.md (line 9) states "37 production routes (25 static ○ + 12 dynamic ƒ)" and (line 262) that "Public shop routes (`/`, `/collections`, `/products`, `/search`) use `apiPublic()` and render as `○ Static`." The committed `pnpm_log.txt` at `b4c35e1` shows:

- Actual: **16 ○ + 26 ƒ** (not 25 ○ + 12 ƒ).
- `/products` is `ƒ Dynamic` — violates AGENTS.md's "○ Static" claim.
- `/search` is `ƒ Dynamic` — violates AGENTS.md's "○ Static" claim.
- `/products/[slug]` is `ƒ Dynamic` — also in the AGENTS.md "○ Static" public-catalog set.
- The `rendering-strategy.contract.test.ts` (5 tests) only asserts _source-level intent_ (`import apiPublic`, not `api`) — it does **not** assert the resulting route is `○ Static`. So this contract test **passes while the documented routing invariant is violated** — the exact blind spot `findings.md` named ("the build didn't fail, but the routing table no longer matches the documented '25 static + 12 dynamic' invariant").

**Attribution of the drift (the causation trace):**

- The downgrade is **NOT caused by the V11–V16 arc.** `products/page.tsx`'s `await searchParams` predates V11 (present at `1fa2b8f`). The `pnpm_log.txt` at `1fa2b8f` already showed `16 ○ + 26 ƒ`.
- The downgrade is **NOT a regression introduced by any single V-fix.** It's a pre-existing architectural state: public catalog pages that read `searchParams` server-side (as `/products` must, to drive sort + collection filtering) are `ƒ Dynamic` by Next.js 16 design, **regardless** of whether they also use `apiPublic()`.
- Therefore the real issue is: **AGENTS.md's invariant ("Public shop routes … render as ○ Static") and `rendering-strategy.contract.test.ts` (asserting intent, not outcome) together over-promise what the framework delivers.**

**Neither doc fully closes this.** `findings.md` _surfaces_ it (correctly identifying it as a real contradiction the report missed) but _miscounts_ the magnitude (F-D1). The report's _final verdict is right for the wrong scope_ — it says "no remediation required" because nothing is actively broken, but it never ran the scan that would have surfaced the latent SortSelect risk or the AGENTS.md-vs-build-log invariant drift.

### 5.4 Recommended remediations

1. **Fix `findings.md` numbers** (low priority — it's a raw transcript, but if it's archived as a record): `14 static` → `16 static`; `11 routes downgraded` → `9 routes downgraded`; `+217 lines` → `+221 lines`.
2. **Tighten the validation report's §2.3 framing:** change "ran fresh; `Cached: 0 cached, 8 total`" to either (a) re-run with `turbo run --force` to genuinely produce `Cached: 0`, or (b) soften to "ran in a hot-cache environment; results replayed matching recorded passing counts."
3. **Extend the report's §2.5 cross-cutting scan** to include the `useSearchParams()`-without-`<Suspense>` class. The report already models "scan for similar issues in other code files" — applying the same scan to the V15 class would have surfaced `SortSelect.tsx` and let the report either (a) explicitly label it as latent-with-known-mitigating-factor (`/products` already `ƒ Dynamic`), or (b) flag it for a future-fix when `/products` is ever made static.
4. **Reconcile AGENTS.md's routing invariant** with the actual build output, OR strengthen `rendering-strategy.contract.test.ts` to assert route-level static outcome (`○` in the build log), not just source-level intent. This is the single most valuable follow-up: the current contract test passes while the documented invariant is violated — the test is green but the routing drift is real. (Out of scope for this validation; flagged as a finding for the engineering owner.)
5. **No action required on the code itself.** Every V11–V16 fix is present, structurally correct, and the relevant gates genuinely pass. The bare remediation arc documented in `session_log_2.md` is faithfully reflected in the tree at `b4c35e1`.

---

## 6. Validation method notes / limitations

- **`pnpm build` was NOT run**, per user instruction and per the report's own §3 disclaimer. The build-pass + routing-table claims in this report are verified **indirectly**: source-level proof (V15-1 Suspense wrapper present + contract test asserts it + `check-types` green + `lint` green) for the "build no longer fails" claim, and **direct parsing of the committed `pnpm_log.txt`** (a static artifact at commit `b4c35e1`, no rerun needed) for the routing-table counts. The routing-table parse is repeatable: `grep -cE "[┌├└] ○"` and `grep -cE "[┌├└] ƒ"` on the committed log.
- **Causation was traced via `git show <commit>:pnpm_log.txt` and `git show <commit>:apps/web/src/app/(shop)/products/page.tsx`** across the 7 named commits (`1fa2b8f`, `626a777`, `a52db2e`, `bbd76f2`, `76f9caf`, `1014096`, `b4c35e1`), establishing that `await searchParams` and the 16○/26ƒ routing counts predate the V11–V16 arc.
- **`skills/` deletion in `git status`** was ignored (~2000 deletions, local-disk space savings, irrelevant to app code) — per the report's §3.
- **One transient stderr warning** (turbo "no output files found for task" for 8 packages during the cached `test` run) is a pre-existing tooling concern noted in the report §3; non-blocking, no impact on claims.
- **Independent fill-count anchor documented:** `rg --multiline --multiline-dotall '(?s)<Image\b[^>]*?\bfill\b' apps/web/src -g '*.tsx'` yields exactly 16 across 11 files — the anchor I used to re-derive the report's "16" number. A naive `rg '\bfill\b'` returns 44 raw hits (SVG `fill="none"`, form `fill` attrs, etc.) and is NOT the right anchor; the report's "16" is correct only under the `<Image … fill>` multiline constraint.

---

## 7. Conclusion

Both documents are **substantively trustworthy as records of the V11–V16 remediation arc**, with caveats that do not change the engineering verdict:

- **The code at `b4c35e1` faithfully reflects every V11–V16 fix** documented in `session_log_2.md`, `findings.md`, and the validation report. All light gates genuinely pass with the exact counts quoted. The `next/image fill` invariant (16 sites, all positioned, anti-pattern absent) is independently reproducible.
- **`docs/session_log_2_validation_report.md` is factually accurate** in every claim it makes. Its two weaknesses are (a) the "ran fresh / Cached: 0" framing is not reproducible in a hot-cache environment, and (b) its cross-cutting scan covered one class (`next/image fill`) but not the parallel `useSearchParams()` class — so its "no remediation required" verdict, while narrowly correct, is incomplete where `findings.md` is more thorough.
- **`docs/findings.md` is correct on root-cause engineering judgment** (SortSelect `useSearchParams` is latent because `/products` reads `searchParams` server-side pre-V11; the routing drift is real and AGENTS.md's invariant over-promises; the contract test asserts intent not outcome). Its three quantitative slips (static count 14→16, downgrade count 11→9, SKILL line growth 217→221) are mechanical errors in a raw transcript, not engineering errors.
- **The single genuinely valuable follow-up** is option 4 in §5.4: the `rendering-strategy.contract.test.ts` currently passes while AGENTS.md's "public routes are ○ Static" invariant is violated in the build. Strengthening that test (assert route-level outcome, not just source-intent) would catch the silent drift class that produced this entire discrepancy. This is flagged for the engineering owner; it is out of scope for a documentation validation.

**No remediation is required to the code. The documents need minor quantitative and framing corrections (§5.1, §5.2) and one shared scope acknowledgment (§5.3).**
