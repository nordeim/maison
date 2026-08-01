# MAISON — Codebase Remediation Plan v12

**Date:** 2026-08-01
**Author:** Super Z coding agent (E2E-driven + deferred-items closure, TDD-executed)
**Predecessor:** `docs/REMEDIATION_PLAN_v11.md` (closed E2E TradeForm loading, webhook 500, atomic checkout, Stripe idempotency, console.log cleanup)
**Companion audits:** E2E testing of `https://maison.jesspete.shop/` (agent-browser), deferred-items compliance audit (Explore sub-agent)
**Source-of-truth docs:** `README.md`, `Project_Requirements_Document.md`, `docs/MAISON_Design_Guide.md`, `Project_Architecture_Document.md`, `AGENTS.md`, `CLAUDE.md`

---

## 0. Executive Summary

This plan addresses findings from two complementary audit streams:

1. **E2E testing** of the live production site (`https://maison.jesspete.shop/`) via agent-browser — confirmed v11 fixes are working (TradeForm loads instantly, no console errors, all key pages return 200), but found **6 broken footer links** (404s) plus 4 broken anchor links
2. **Deferred-items compliance audit** — verified the status of 6 items deferred from v11 and determined which are feasible for v12

The remediation is **TDD-driven**: each fix is paired with a contract test that fails red before the fix is applied and passes green after.

### Verification Gates — Baseline (captured 2026-08-01, post-v11)

| Gate | Command | Result |
|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 packages pass |
| ESLint | `pnpm lint` | ✅ 12/12 packages pass |
| Prettier | `pnpm format:check` | ✅ clean |
| Unit tests | `pnpm test` | ✅ 297 tests across 9 packages |
| Build | `pnpm build` | ✅ 10/10 packages; 42 routes (16 ○ + 26 ƒ) |
| Live site | `curl https://maison.jesspete.shop/` | ✅ HTTP 200, CDN-cached, 0.2s |

### Live Site E2E Results (post-v11 deployment)

| Page | Status | Notes |
|---|---|---|
| `/` | ✅ | All sections render, 27 images, 0 broken, no console errors |
| `/products` | ✅ | 20 cards, scroll-reveal works (no regression) |
| `/products/[slug]` | ✅ | PDP with JSON-LD, 5 images, Add to Bag |
| `/collections` | ✅ | 8 collections with links |
| `/search?q=linen` | ✅ | 7 results |
| `/contact`, `/gift-cards` | ✅ | Forms present |
| `/cart`, `/checkout` | ✅ | Empty cart state works |
| `/auth/sign-in`, `/auth/sign-up` | ✅ | Forms present |
| `/account`, `/admin` | ✅ | 307 redirect to sign-in |
| **`/trade`** | ✅ | **v11 fix confirmed — loads instantly, no 7s delay** |
| Mobile (390×844) | ✅ | Responsive, hamburger nav |
| **Footer links** | ⚠️ | **6 broken page links (404) + 4 broken anchor links** |

---

## 1. E2E-Driven Findings

### 1.1 Broken Footer Links (E2E-HIGH)

**Symptom:** 6 footer links return 404 on the live site:
- `/care-guide` → 404
- `/faq` → 404
- `/privacy-policy` → 404
- `/cookie-policy` → 404
- `/shipping-returns` → 404
- `/terms-of-service` → 404

Plus 4 anchor links on `/about` that point to non-existent anchors:
- `/about#sustainability`, `/about#materials`, `/about#press`, `/about#traceability`

**Root cause** (verified by codebase inspection):

`packages/config/src/site.ts:50-107` defines footer link columns pointing to pages that don't exist in `apps/web/src/app/`. The Footer component (`apps/web/src/components/shop/Footer.tsx`) renders these links from the config, and they hit the `not-found.tsx` 404 page.

**Fix (Option A — minimal scope, config-only):** Remove the 6 broken page links from `site.ts` and strip the 4 broken anchor fragments (point them to `/about` instead). This is a config-only change — no new pages needed. The footer still has functional Shop/About/Help columns with valid links.

---

## 2. Deferred-Items Findings (from v11)

### 2.1 Compound Cursor Pagination — CRITICAL (escalated from MEDIUM)

**Location:** `packages/api/src/routers/products.ts:23-91`

**Issue:** The `list` query accepts a `cursor` input but **never uses it in the WHERE clause**. The `conditions` array (line 33-37) only has `isActive` and `collection` filters. The `nextCursor` is computed (line 77) and returned to the client, but when the client passes it back, it's silently ignored.

**Impact:** Pagination is **completely broken** at the data layer. Every "next page" request returns the same first N items. This is a silent data-correctness bug — the UI either never loads more pages or shows duplicates forever.

**Fix:** Implement compound cursor pagination:
1. Change cursor schema from `z.string().uuid()` to `z.string()` (opaque encoded cursor)
2. Decode cursor as `${sortValue}|${id}`
3. Add cursor-based WHERE clause for each sort option (using `OR` for tie-breaking)
4. Encode `nextCursor` from the last row's sort value + id

This is the highest-priority fix in v12 because it's an active data-correctness bug, not just a code-style deferral.

### 2.2 Rate Limiting on Payment Mutations (HIGH — deferred from v11)

**Location:** `packages/api/src/routers/checkout.ts`, `gift-cards.ts`, `trade.ts`

**Issue:** v11 deferred this because `.use(rateLimitMiddleware)` after `protectedProcedure` loses the session type narrowing (TS18047). The root cause is that `rateLimitMiddleware` is a standalone `t.middleware()` that doesn't preserve the narrowed context.

**Fix:** Define a `protectedRateLimitedProcedure` builder in `trpc.ts` that composes the rate-limit step inside the narrowed context. The key insight: the inline `.use()` in the builder preserves the session type because it infers from `protectedProcedure`'s narrowed output.

### 2.3 BETTER_AUTH_URL Host-Mismatch Warning (HIGH — deferred from v11)

**Location:** `packages/config/src/env.ts`

**Issue:** No runtime check comparing `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` hosts. A mismatch causes session cookies to be set for the wrong domain → P0 auth outage.

**Fix:** Add a `warnOnAuthUrlMismatch()` helper at the end of `loadEnv()`, gated on `NODE_ENV === 'production'`.

### 2.4 Non-Null Assertion Cleanup — Top 7 (MEDIUM — partial from v11)

**Location:** 19 sites across 9 router files (down from v11's estimate of 25)

**Fix:** Replace the top 7 `!.` assertions (in payment/cart/trade paths) with explicit `if (!x) throw new TRPCError(...)` guards. Defer the remaining 12 (admin/account/loyalty) to v13.

### 2.5 React.SyntheticEvent → React.SubmitEvent (LOW — deferred from v11)

**Location:** `apps/web/src/components/shop/ReviewsSection.tsx:32`

**Fix:** Change `React.SyntheticEvent<HTMLFormElement>` to `React.SubmitEvent` (available in @types/react ≥ 19.2.0). Single-line change.

### 2.6 ESLint Deferral Blocks — Partial (MEDIUM — partial from v11)

**Location:** 10 per-package `eslint.config.mjs` files with deferral blocks

**Fix:** Remove `@typescript-eslint/consistent-type-imports` (auto-fixable, already using `verbatimModuleSyntax`) and `no-console` (already cleaned in v11) from all 10 deferral blocks. Defer the remaining 13 type-aware rules to v13.

---

## 3. Remediation ToDo List (TDD-Driven)

Each task follows the **RED → GREEN → REFACTOR** TDD cycle.

### Task 1 — Fix Broken Footer Links (E2E-HIGH)

**Files touched:**
- `packages/config/src/site.ts` (remove 6 broken page links, strip 4 broken anchor fragments)
- `apps/web/src/lib/__tests__/footer-links.contract.test.ts` (NEW)

**TDD steps:**
1. **RED** — write contract test asserting every footer link href in `site.ts` points to a page that exists (or is an external URL).
2. **GREEN** — edit `site.ts`: remove `/care-guide`, `/faq`, `/privacy-policy`, `/cookie-policy`, `/shipping-returns`, `/terms-of-service` links; change `/about#sustainability` etc. to `/about`.
3. **REFACTOR** — verify full gate green.

### Task 2 — Fix Compound Cursor Pagination (CRITICAL)

**Files touched:**
- `packages/api/src/routers/products.ts` (implement compound cursor)
- `packages/api/src/routers/products.test.ts` (NEW or extend)

**TDD steps:**
1. **RED** — write contract test asserting the `list` query uses the cursor in the WHERE clause (not just accepts and ignores it).
2. **GREEN** — implement compound cursor: change schema, add cursor decoding, add cursor-based WHERE for each sort option, encode nextCursor.
3. **REFACTOR** — verify full gate green.

### Task 3 — Rate Limiting on Payment Mutations (HIGH)

**Files touched:**
- `packages/api/src/trpc.ts` (add `protectedRateLimitedProcedure` builder)
- `packages/api/src/routers/checkout.ts` (use new builder)
- `packages/api/src/routers/gift-cards.ts` (same)
- `packages/api/src/routers/trade.ts` (same)

**TDD steps:**
1. No contract test needed (procedure builder composition).
2. **GREEN** — add `protectedRateLimitedProcedure` to `trpc.ts`, swap `protectedProcedure` → `protectedRateLimitedProcedure` on the 3 payment mutations.
3. **REFACTOR** — verify check-types passes (session type narrowing preserved).

### Task 4 — BETTER_AUTH_URL Host-Mismatch Warning (HIGH)

**Files touched:**
- `packages/config/src/env.ts` (add `warnOnAuthUrlMismatch()`)
- `apps/web/src/lib/__tests__/auth-url-warning.contract.test.ts` (NEW)

**TDD steps:**
1. **RED** — write contract test asserting `env.ts` contains a host-mismatch check.
2. **GREEN** — add `warnOnAuthUrlMismatch()` helper at the end of `loadEnv()`.
3. **REFACTOR** — verify full gate green.

### Task 5 — Non-Null Assertion Cleanup — Top 7 (MEDIUM)

**Files touched:**
- `packages/api/src/routers/checkout.ts` (2 sites)
- `packages/api/src/routers/gift-cards.ts` (3 sites)
- `packages/api/src/routers/cart.ts` (2 sites)

**TDD steps:**
1. No contract test needed (mechanical replacement with guards).
2. **GREEN** — replace each `!.` with explicit `if (!x) throw new TRPCError(...)` guard.
3. **REFACTOR** — verify check-types and test pass.

### Task 6 — React.SyntheticEvent → React.SubmitEvent (LOW)

**Files touched:**
- `apps/web/src/components/shop/ReviewsSection.tsx` (1 line)

**TDD steps:**
1. No contract test needed (single-line type change).
2. **GREEN** — change `React.SyntheticEvent<HTMLFormElement>` to `React.SubmitEvent`.
3. **REFACTOR** — verify check-types passes.

### Task 7 — ESLint Deferral Block Partial Removal (MEDIUM)

**Files touched:**
- 10 per-package `eslint.config.mjs` files (remove `consistent-type-imports` and `no-console` from deferral blocks)

**TDD steps:**
1. No contract test needed (config change).
2. **GREEN** — remove the 2 rules from each deferral block, run `pnpm lint --fix` to auto-fix `consistent-type-imports` violations.
3. **REFACTOR** — verify `pnpm lint` still passes.

---

## 4. Execution Order & Dependencies

```
Task 1 (Footer links)              ──┐
Task 2 (Cursor pagination)         ──┤
Task 3 (Rate limiting)             ──┼──► Task 8 (Doc Updates)
Task 4 (Auth URL warning)          ──┤      ↑ depends on all prior
Task 5 (Non-null cleanup)          ──┤
Task 6 (React.SubmitEvent)         ──┤
Task 7 (ESLint deferral removal)   ──┘
```

Tasks 1-7 are **independent** and can be executed in any order. They will be executed sequentially in priority order (Task 2 first because it's CRITICAL).

### Commit Plan (single branch: `main`)

Per the user's instruction, **no new git branch** is created. All commits go to `main`.

---

## 5. Risk Analysis

| Risk | Likelihood | Mitigation |
|---|---|---|
| Cursor pagination change breaks existing PLP | Medium | Test with existing `products.test.ts`; the cursor is currently ignored so any working pagination is an improvement |
| Rate limiting procedure builder changes type inference | Low | The inline `.use()` pattern preserves types by construction; if it fails, revert to deferred |
| Footer link removal affects SEO | Very Low | The pages never existed (404), so there's no SEO equity to lose |
| ESLint deferral removal surfaces new errors | Low | `consistent-type-imports` is auto-fixable; `no-console` was already cleaned in v11 |
| Non-null assertion guards change error behavior | Very Low | Guards throw `INTERNAL_SERVER_ERROR` which is the same code Drizzle would throw on null |

---

## 6. Validation Gates — Target (post-remediation)

| Gate | Command | Target | Notes |
|---|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 packages pass | Unchanged |
| ESLint | `pnpm lint` | ✅ 12/12 packages pass | Unchanged |
| Prettier | `pnpm format:check` | ✅ clean | Unchanged |
| Unit tests | `pnpm test` | ✅ 302+ tests across 9 packages | +5 new contract tests |
| Build | `pnpm build` | ✅ 10/10 packages; 42 routes | Unchanged route count |
| Live site footer | E2E re-test | ✅ 0 broken links | No more 404s |

---

## 7. Plan Validation Checklist (pre-execution)

- [x] All file paths cited exist (verified by direct `Read` calls)
- [x] All code citations are quoted verbatim from the current HEAD (`d309443`)
- [x] E2E findings validated by agent-browser testing of the live site
- [x] Deferred-items findings validated by independent Explore sub-agent
- [x] The cursor pagination bug is confirmed by reading `products.ts:23-91` — cursor is accepted but never used in WHERE
- [x] The footer links bug is confirmed by curl-testing all 6 paths (all return 404)
- [x] The rate limiting fix approach (procedure builder) is type-safe by construction
- [x] Previously deferred items from v11 are explicitly addressed or re-deferred
- [x] Commit plan respects the user's instruction: no new git branch; all commits to `main`
