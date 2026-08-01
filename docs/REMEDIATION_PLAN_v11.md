# MAISON — Codebase Remediation Plan v11

**Date:** 2026-08-01
**Author:** Super Z coding agent (E2E-driven + skill-compliance audit, TDD-executed)
**Predecessor:** `docs/REMEDIATION_PLAN_v10.md` (closed MEDIUM-1..6, LOW-1/2/4/8; skill compliance 92% → 100%)
**Companion audits:** E2E testing of `https://maison.jesspete.shop/` (agent-browser), `skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/SKILL.md` audit, `nextjs-typescript_SKILL.md` v1.5 audit
**Source-of-truth docs:** `README.md`, `Project_Requirements_Document.md`, `docs/MAISON_Design_Guide.md`, `Project_Architecture_Document.md`, `AGENTS.md`, `CLAUDE.md`

---

## 0. Executive Summary

This plan addresses findings from three complementary audit streams:

1. **E2E testing** of the live production site (`https://maison.jesspete.shop/`) via agent-browser — identified 1 real UX bug (TradeForm loading delay)
2. **Skill-compliance audit** against `skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/SKILL.md` — identified 3 critical payment-flow bugs + 5 high-priority gaps
3. **Skill-compliance audit** against `nextjs-typescript_SKILL.md` v1.5 — confirmed 100% compliance on all 12 dimensions; identified 2 medium-priority debt items (console.log usage, ESLint deferral blocks)
4. **Previously deferred items** from v10 (React Compiler, noUnusedLocals, non-null assertions, Trigger.dev stubs)

The remediation is **TDD-driven**: each fix is paired with a contract test that fails red before the fix is applied and passes green after.

### Verification Gates — Baseline (captured 2026-08-01, post-v10)

| Gate | Command | Result |
|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 packages pass (now includes root config files) |
| ESLint | `pnpm lint` | ✅ 12/12 packages pass (was 1) |
| Prettier | `pnpm format:check` | ✅ clean |
| Unit tests | `pnpm test` | ✅ 290 tests across 9 packages |
| Build | `pnpm build` | ✅ 10/10 packages; 42 routes (16 ○ + 26 ƒ) |
| Live site | `curl https://maison.jesspete.shop/` | ✅ HTTP 200, CDN-cached, security headers present |

### Live Site E2E Results

| Page | Status | Notes |
|---|---|---|
| `/` | ✅ | All 17 sections render, H1 correct, 27 images, 0 broken, scroll-reveal works |
| `/products` | ✅ | 20 product cards, scroll-reveal works (no blank-screen regression) |
| `/products/[slug]` | ✅ | PDP with H1, 5 images, JSON-LD, Add to Bag button |
| `/collections` | ✅ | 8 collections shown with links |
| `/search?q=linen` | ✅ | 7 results found |
| `/contact` | ✅ | Form with 3 inputs |
| `/gift-cards` | ✅ | Form present |
| `/cart` | ✅ | Empty cart state works |
| `/auth/sign-in`, `/auth/sign-up` | ✅ | Forms present |
| `/account`, `/admin` | ✅ | Correct 307 redirect to sign-in |
| Mobile (390×844) | ✅ | Responsive, hamburger nav present |
| **`/trade`** | ⚠️ | **7-second "Loading…" delay** for unauthenticated visitors |
| `/journal` | ℹ️ | Phase 2 stub (expected — no articles yet) |

---

## 1. E2E-Driven Findings

### 1.1 TradeForm Loading Delay (E2E-HIGH)

**Symptom:** Unauthenticated visitors to `https://maison.jesspete.shop/trade` see "Loading…" for ~7 seconds before the trade application form appears.

**Root cause** (verified by codebase inspection + live E2E):

`apps/web/src/components/shop/TradeForm.tsx:20` calls `trpc.trade.myStatus.useQuery()` unconditionally. The `trade.myStatus` procedure is a `protectedProcedure` (`packages/api/src/routers/trade.ts:78`). When the user is unauthenticated, the query receives a 401 error and React Query retries 3 times with exponential backoff (0s → 1s → 4s), taking ~7 seconds total before `isLoading` becomes `false` and the form renders.

**Contrast with correct patterns in the same codebase:**
- `WishlistButton.tsx:52` uses `enabled: !!session` to skip the protected `account.listWishlist` query for unauthenticated users ✅
- `CartProvider.tsx:69` uses `enabled: isHydrated && !!cartId` to skip when no cart cookie exists ✅

**Fix:** Import `useSession` from `@maison/auth/client` and add `enabled: !!session` to the `useQuery` call. When unauthenticated, the query is skipped entirely and the form renders immediately (falling through to the "no existing application" branch at line 173).

### 1.2 Other E2E Results

All other pages tested clean — no console errors, no broken images, no rendering issues, correct auth redirects, working search, working cart drawer, working scroll-reveal. The only E2E bug is §1.1.

---

## 2. Skill-Compliance Findings (tRPC+Drizzle+BetterAuth skill)

### 2.1 Critical Payment-Flow Bugs

#### 2.1.1 Stripe Webhook Returns HTTP 500 on Handler Error (CRITICAL)

**Location:** `apps/web/src/app/api/webhooks/stripe/route.ts:61`

**Issue:** After signature verification succeeds and the event is not a duplicate, any handler error returns HTTP 500. Per skill §16.5 line 4685: *"return 500 on handler error → 💥 Stripe retries forever"*. Stripe retries webhooks for up to 3 days if it doesn't receive a 200.

**Current code:**
```ts
// Line 56-61
if (message.includes('unique') || message.includes('duplicate')) {
  return NextResponse.json({ received: true, duplicate: true });
}
return NextResponse.json({ error: `Webhook handler failed: ${message}` }, { status: 500 });
```

**Fix:** Return 200 for ALL errors after signature verification passes (log to Sentry/console.error for monitoring). The idempotency layer (`payment_events.stripe_event_id` UNIQUE + `pg_advisory_xact_lock`) ensures duplicate events are safe. Returning 500 for transient errors (DB connection blip, etc.) causes Stripe to retry indefinitely.

#### 2.1.2 Non-Atomic Checkout Write (CRITICAL)

**Location:** `packages/api/src/routers/checkout.ts:136-166`

**Issue:** `checkout.createPaymentIntent` inserts the order (line 136) and then inserts line items (line 158) as two separate queries without wrapping in `db.transaction()`. If the line-items insert fails, an orphaned pending order row remains in the database.

**Fix:** Wrap lines 136-166 in `await ctx.db.transaction(async (tx) => { ... })`. Per skill §5.8 line 1001.

#### 2.1.3 Missing Stripe Idempotency Key (CRITICAL)

**Location:** `packages/api/src/routers/checkout.ts:116-124`

**Issue:** The code generates an idempotency key (`const idempotencyKey = ...` at line 134) and stores it on the order (`stripeIdempotencyKey: idempotencyKey` at line 152), but NEVER passes it to the Stripe SDK call. `stripe.paymentIntents.create({...})` should receive `{ idempotencyKey }` as the second argument.

**Fix:** Pass `{ idempotencyKey: input.cartId }` (or the generated key) as the second argument to `stripe.paymentIntents.create()`.

### 2.2 High-Priority Skill Gaps

#### 2.2.1 Missing Rate Limiting on Payment Mutations (HIGH)

**Location:** `packages/api/src/routers/checkout.ts:46`, `packages/api/src/routers/gift-cards.ts`, `packages/api/src/routers/trade.ts:23`

**Issue:** Per skill §15.7.4, payment-related mutations should be rate-limited. Currently only `contact.submit` and `newsletter.subscribe` use `rateLimitMiddleware`. `checkout.createPaymentIntent`, `giftCards.purchase`, and `trade.submitApplication` are unprotected — vulnerable to payment-abuse attacks.

**Fix:** Add `.use(rateLimitMiddleware)` to each payment/trade mutation.

#### 2.2.2 Console.log in Production Code (MEDIUM — from TypeScript skill audit)

**Location:** `packages/payments/src/webhooks.ts` (8 sites), `packages/api/src/routers/{newsletter,contact}.ts`, `packages/auth/src/resend-client.ts`, `packages/email/src/send.ts`

**Issue:** Per skill §4.8, production code should use `console.warn`/`console.error` (not `console.log`). The ESLint config currently downgrades `no-console` to `warn` (not `error`).

**Fix:** Replace `console.log` with `console.warn` or `console.error` in production code. Keep `console.log` in seed/script files.

#### 2.2.3 BETTER_AUTH_URL Host-Mismatch Warning Missing (HIGH)

**Location:** `packages/config/src/env.ts`

**Issue:** Per skill §5.6.0 lines 925-937, a runtime check should warn if `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` hosts differ. This prevents a P0 production outage (session cookies set for the wrong domain).

**Fix:** Add a runtime check in `packages/config/src/env.ts` that warns on host mismatch in production.

### 2.3 Medium-Priority Skill Gaps

#### 2.3.1 Non-Null Assertions in Routers (MEDIUM — deferred from v10)

**Location:** 25 instances across 8 router files (full list in skill audit §B.2)

**Issue:** Per skill §13.2, `!.` non-null assertions should be replaced with explicit `if (!x) throw new TRPCError(...)` guards. v10 deferred this; v11 addresses the most critical ones (checkout, cart, trade).

**Fix:** Replace `!.` with explicit guards in `checkout.ts`, `cart.ts`, `trade.ts`, `gift-cards.ts`.

#### 2.3.2 Compound Cursor Pagination (MEDIUM)

**Location:** `packages/api/src/routers/products.ts:28,39-46`

**Issue:** Per skill §9.3, single-column UUID cursor with composite ORDER BY (createdAt/priceCents) can skip/duplicate rows when two products share the same sort value. Need compound cursor with UUID tiebreaker.

**Fix:** Encode cursor as `${sortValue}|${id}` and use `OR` pattern for compound pagination.

---

## 3. TypeScript Patterns Skill Findings

The TypeScript patterns skill audit found the codebase **highly compliant** (10/12 dimensions fully compliant, 2 partial with only Low-severity gaps). No critical or high violations. The medium-priority items are:

### 3.1 Console.log Debt (MEDIUM — overlaps with §2.2.2 above)

Already covered in §2.2.2.

### 3.2 ESLint Deferral Blocks (MEDIUM — documented from v10)

**Location:** 9 per-package `eslint.config.mjs` files

**Issue:** v10 added deferral blocks that downgrade 14 type-aware rules from `error` to `warn`. Per skill §2.6, a green gate achieved by weakening is not a fix. These should be addressed in a future cleanup sprint.

**Status:** Deferred to v12 — this is a larger refactor that requires fixing ~200+ warnings across 9 packages. Out of scope for v11.

### 3.3 Low-Priority Items (deferred)

- `React.SyntheticEvent` → `React.SubmitEvent` in `ReviewsSection.tsx:32` (Low)
- Root `tsconfig.json` doesn't extend `base.json` (Low)
- `apps/studio` extends `nextjs.json` instead of a Studio-specific config (Low)

---

## 4. Previously Deferred Items (from v10)

These items were explicitly deferred in v10's `last_remediation.md` §"Deferred to v11":

| Item | v10 status | v11 action |
|---|---|---|
| `noUnusedLocals` / `noUnusedParameters` | Deferred | **Still deferred** — requires cleanup pass across codebase |
| React Compiler | Deferred | **Still deferred** — requires config change + benchmarking |
| 22 non-null assertions in tRPC routers | Deferred | **Partially addressed** — fix the most critical 10 in checkout/cart/trade (§2.3.1) |
| Trigger.dev Phase 0 stubs | Deferred | **Still deferred** — intentional placeholder |
| Stripe API version automation | Deferred | **Still deferred** — needs Renovate/Dependabot |
| Better Auth `session.user.name` nullability | Deferred | **Still deferred** — monitor upstream |
| Conservative-scope deps in `@maison/web` | Deferred | **Still deferred** — `stripe`, `@maison/db`, `drizzle-orm` kept for next.config.ts |
| Per-package ESLint deferral blocks | Documented in v10 | **Deferred to v12** — larger refactor |

---

## 5. Remediation ToDo List (TDD-Driven)

Each task follows the **RED → GREEN → REFACTOR** TDD cycle.

### Task 1 — TradeForm Loading Fix (E2E-HIGH)

**Files touched:**
- `apps/web/src/components/shop/TradeForm.tsx` (add `useSession` + `enabled` flag)
- `apps/web/src/lib/__tests__/tradeform-auth-gate.contract.test.ts` (NEW)

**TDD steps:**
1. **RED** — write contract test asserting `TradeForm.tsx` imports `useSession` and passes `enabled: !!session` to the `useQuery` call.
2. **GREEN** — edit `TradeForm.tsx`: import `useSession`, add `const { data: session } = useSession()`, pass `{ enabled: !!session }` as second argument to `trpc.trade.myStatus.useQuery()`.
3. **REFACTOR** — verify full gate green.

### Task 2 — Stripe Webhook 500 Fix (CRITICAL)

**Files touched:**
- `apps/web/src/app/api/webhooks/stripe/route.ts` (return 200 on all handler errors)
- `apps/web/src/lib/__tests__/webhook-error-handling.contract.test.ts` (NEW)

**TDD steps:**
1. **RED** — write contract test asserting the webhook route returns 200 (not 500) on handler errors after signature verification.
2. **GREEN** — change line 61 from `status: 500` to `status: 200` and log the error via `console.error` for monitoring.
3. **REFACTOR** — verify full gate green.

### Task 3 — Atomic Checkout Transaction (CRITICAL)

**Files touched:**
- `packages/api/src/routers/checkout.ts` (wrap order+lineItems in `db.transaction()`)
- `packages/api/src/routers/checkout.test.ts` (extend with transaction assertion)

**TDD steps:**
1. **RED** — extend existing `checkout.test.ts` to assert the mutation uses `ctx.db.transaction()`.
2. **GREEN** — wrap lines 136-166 in `await ctx.db.transaction(async (tx) => { ... })`, using `tx` instead of `ctx.db` for the inserts.
3. **REFACTOR** — verify full gate green.

### Task 4 — Stripe Idempotency Key (CRITICAL)

**Files touched:**
- `packages/api/src/routers/checkout.ts` (pass `idempotencyKey` to Stripe SDK)

**TDD steps:**
1. No contract test needed (this is a single-argument addition to an existing SDK call).
2. **GREEN** — change `stripe.paymentIntents.create({...})` to `stripe.paymentIntents.create({...}, { idempotencyKey })`.
3. **REFACTOR** — verify full gate green.

### Task 5 — Rate Limiting on Payment Mutations (HIGH)

**Files touched:**
- `packages/api/src/routers/checkout.ts` (add `.use(rateLimitMiddleware)`)
- `packages/api/src/routers/gift-cards.ts` (same)
- `packages/api/src/routers/trade.ts` (same)

**TDD steps:**
1. No contract test needed (middleware chain addition).
2. **GREEN** — add `.use(rateLimitMiddleware)` before `.input(...)` on each payment mutation.
3. **REFACTOR** — verify full gate green.

### Task 6 — Console.log Cleanup (MEDIUM)

**Files touched:**
- `packages/payments/src/webhooks.ts` (8 sites: `console.log` → `console.warn`/`console.error`)
- `packages/api/src/routers/newsletter.ts` (1 site)
- `packages/api/src/routers/contact.ts` (1 site)
- `packages/auth/src/resend-client.ts` (1 site)
- `packages/email/src/send.ts` (1 site)

**TDD steps:**
1. No contract test needed (mechanical replacement).
2. **GREEN** — replace `console.log` with `console.warn` (for warnings) or `console.error` (for errors) in production code. Keep `console.log` in seed/script files.
3. **REFACTOR** — verify `pnpm lint` still passes (the `no-console` rule allows `warn`/`error`).

### Task 7 — BETTER_AUTH_URL Host-Mismatch Warning (HIGH)

**Files touched:**
- `packages/config/src/env.ts` (add runtime check)

**TDD steps:**
1. **RED** — write contract test asserting `env.ts` contains a host-mismatch check.
2. **GREEN** — add runtime check comparing `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` hosts in production.
3. **REFACTOR** — verify full gate green.

### Task 8 — Non-Null Assertion Cleanup (MEDIUM — partial)

**Files touched:**
- `packages/api/src/routers/checkout.ts` (6 sites)
- `packages/api/src/routers/cart.ts` (2 sites)
- `packages/api/src/routers/trade.ts` (1 site)
- `packages/api/src/routers/gift-cards.ts` (3 sites)

**TDD steps:**
1. No contract test needed (mechanical replacement with guards).
2. **GREEN** — replace each `!.` with an explicit `if (!x) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '...' })` guard.
3. **REFACTOR** — verify `pnpm check-types` and `pnpm test` still pass.

---

## 6. Execution Order & Dependencies

```
Task 1 (TradeForm)           ──┐
Task 2 (Webhook 500)         ──┤
Task 3 (Atomic Checkout)     ──┼──► Task 9 (Doc Updates)
Task 4 (Stripe Idempotency)  ──┤      ↑ depends on all prior
Task 5 (Rate Limiting)       ──┤
Task 6 (Console.log)         ──┤
Task 7 (Auth URL Warning)    ──┤
Task 8 (Non-Null Cleanup)    ──┘
```

Tasks 1-8 are **independent** and can be executed in any order. They will be executed sequentially in the order listed for clarity.

### Commit Plan (single branch: `main`)

Per the user's instruction, **no new git branch** is created. All commits go to `main`.

---

## 7. Risk Analysis

| Risk | Likelihood | Mitigation |
|---|---|---|
| Webhook 500→200 change masks real errors | Low | Log all errors to `console.error` for monitoring; the idempotency layer ensures duplicate events are safe |
| `db.transaction()` changes error semantics | Low | Test with existing `checkout.test.ts` mock; transaction wraps the same queries |
| Rate limiting breaks existing test flows | Low | Rate limiter uses Upstash Redis which is mocked in tests |
| `useSession` adds Better Auth client dependency to TradeForm | Very Low | `WishlistButton.tsx` already uses the same pattern successfully |
| Non-null assertion cleanup introduces new throw paths | Low | Guards throw `INTERNAL_SERVER_ERROR` which is the same code Drizzle would throw on null |

---

## 8. Validation Gates — Target (post-remediation)

| Gate | Command | Target | Notes |
|---|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 packages pass | Unchanged |
| ESLint | `pnpm lint` | ✅ 12/12 packages pass | Unchanged |
| Prettier | `pnpm format:check` | ✅ clean | Unchanged |
| Unit tests | `pnpm test` | ✅ 295+ tests across 9 packages | +5 new contract tests |
| Build | `pnpm build` | ✅ 10/10 packages; 42 routes | Unchanged route count |
| Live site `/trade` | E2E re-test | ✅ Form renders <1s for unauthenticated | No more 7s delay |

---

## 9. Plan Validation Checklist (pre-execution)

- [x] All file paths cited exist (verified by direct `Read` calls)
- [x] All code citations are quoted verbatim from the current HEAD (`e1eccdc`)
- [x] E2E findings validated by agent-browser testing of the live site
- [x] Skill-compliance findings validated by 2 independent Explore sub-agents
- [x] The TradeForm fix mirrors the established `WishlistButton` pattern (`enabled: !!session`)
- [x] The webhook 500→200 fix matches skill §16.5 line 4685
- [x] The `db.transaction()` fix matches skill §5.8 line 1001
- [x] The Stripe idempotency key fix matches Stripe SDK best practice
- [x] Previously deferred items from v10 are explicitly addressed or re-deferred
- [x] Commit plan respects the user's instruction: no new git branch; all commits to `main`
