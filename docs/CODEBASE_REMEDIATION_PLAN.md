# Codebase Remediation Plan — Align with PRD v1.2 / PAD v1.2

**Date:** 2026-07-29
**Goal:** Align the cloned `nordeim/maison` codebase with `MAISON_PRD_v1.2.md`, `MAISON_PAD_v1.2.md`, and `MAISON_Design_Guide.md` using TDD.
**Approach:** Red → Green → Refactor for each finding. Every code change has a test first.

---

## 1. Baseline (measured before remediation)

| Gate | Status |
|---|---|
| `pnpm check-types` | ✅ 10/10 packages |
| `pnpm test` (unit) | ✅ all pass (9 db + 4 api + 20 web + auth + payments + config) |
| `pnpm lint` | (to run) |
| `pnpm build` | (to run) |

---

## 2. Audit Findings — Codebase vs. v1.2 Documents

| # | Finding | Codebase | v1.2 Spec | Severity | ADR |
|---|---|---|---|---|---|
| C-001 | tRPC procedure tiers | `publicProcedure / protectedProcedure / adminProcedure / adminWriteProcedure` (3 roles: customer/staff/admin) | `publicProcedure / protectedProcedure / staffProcedure / managerProcedure / ownerProcedure` (4 roles: customer/staff/manager/owner) | HIGH | ADR-008 |
| C-002 | RBAC roles | `['customer','staff','admin']` | `['customer','staff','manager','owner']` | HIGH | ADR-008 |
| C-003 | Stripe integration | Payment Intents (`stripe.paymentIntents.create`) | Checkout Sessions (`stripe.checkout.sessions.create`) | MED | ADR-009 |
| C-004 | Webhook idempotency | UNIQUE constraint on `stripe_idempotency_key` only; no `payment_events` table; no `pg_advisory_xact_lock` | Dual-defense: `payment_events` table + UNIQUE INDEX + `pg_advisory_xact_lock` | MED | ADR-014 |
| C-005 | Color tokens | `--muted: #8a8178`, `--sage: #8b9a82` (AA only) | `--muted: #786f66`, `--sage: #7e8f72`, `--sage-soft: #dfe4d6` (AAA target) | MED | ADR-011 |
| C-006 | Trigger.dev import | `import type { TriggerConfig } from '@trigger.dev/sdk/v4'` (nonexistent subpath) | `import type { TriggerConfig } from '@trigger.dev/sdk'` (root) | MED | ADR-016 |
| C-007 | proxy.ts 2-layer auth | ✅ Already correct — `getSessionCookie()` cookie-only, no `auth.api.getSession()` | ✅ Aligned | — | ADR-010 |
| C-008 | Search method | ✅ Already uses `ILIKE` (not FTS) | ✅ Aligned | — | ADR-012 |
| C-009 | tsconfig strict flags | ✅ Already has `erasableSyntaxOnly`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, etc. | ✅ Aligned | — | ADR-020 |
| C-010 | `emailAndPassword` | ✅ Already `enabled: true` (hybrid auth) | ✅ Aligned | — | ADR-013 |
| C-011 | `DATABASE_URL_UNPOOLED` | ✅ Already used for migrations | ✅ Aligned | — | — |
| C-012 | `transpilePackages` + `@maison/source` | ✅ Already configured in `pnpm-workspace.yaml` + `next.config.ts` | ✅ Aligned | — | ADR-015 |
| C-013 | `ClientOnly` boundary | ✅ Already exists at `apps/web/src/components/shop/ClientOnly.tsx` | ✅ Aligned | — | ADR-017 |

**Net:** 6 findings require code changes (C-001 through C-006). 7 findings already aligned.

---

## 3. TODO List (Execution Order)

### Phase 1 — TDD: tRPC procedure tiers (C-001, C-002, ADR-008)

- [ ] **1.1** RED: Update `packages/auth/src/rbac.test.ts` to expect 4 roles (`customer/staff/manager/owner`) and new helper names (`canAccessStaff`, `canAccessOwner`). Run → fail.
- [ ] **1.2** RED: Update `packages/api/src/trpc.test.ts` to expect 5 procedure tiers (`publicProcedure/protectedProcedure/staffProcedure/managerProcedure/ownerProcedure`). Run → fail.
- [ ] **1.3** GREEN: Update `packages/db/src/schema/enums.ts` — change `userRoleEnum` from `['customer','staff','admin']` to `['customer','staff','manager','owner']`.
- [ ] **1.4** GREEN: Update `packages/auth/src/rbac.ts` — add `manager` + `owner` roles, rename helpers to `canAccessStaff` / `canAccessOwner`, keep `canReadAdmin` / `canWriteAdmin` as deprecated aliases for backward compat.
- [ ] **1.5** GREEN: Update `packages/api/src/trpc.ts` — rename `adminProcedure` → `staffProcedure`, `adminWriteProcedure` → `ownerProcedure`, add `managerProcedure`. Keep old names as deprecated re-exports.
- [ ] **1.6** GREEN: Update all router files that import `adminProcedure` / `adminWriteProcedure` to use new names.
- [ ] **1.7** VERIFY: `pnpm check-types` + `pnpm test` green.

### Phase 2 — TDD: payment_events table + advisory lock (C-004, ADR-014)

- [ ] **2.1** RED: Write `packages/db/src/schema/payment-events.test.ts` asserting the table exists with `stripeEventId` UNIQUE column. Run → fail.
- [ ] **2.2** GREEN: Create `packages/db/src/schema/payment-events.ts` with the `paymentEvents` table.
- [ ] **2.3** GREEN: Re-export from `packages/db/src/schema/index.ts`.
- [ ] **2.4** GREEN: Update `packages/db/src/schema/relations.ts` to add `paymentEvents` relations.
- [ ] **2.5** GREEN: Generate migration: `pnpm db:generate`.
- [ ] **2.6** RED: Write `packages/payments/src/webhooks.test.ts` test for the dual-defense idempotency pattern (fast-path check + advisory lock + double-check).
- [ ] **2.7** GREEN: Update `packages/payments/src/webhooks.ts` — implement 5-step idempotency pattern with `pg_advisory_xact_lock`.
- [ ] **2.8** VERIFY: `pnpm check-types` + `pnpm test` green.

### Phase 3 — Fix Trigger.dev v4 import (C-006, ADR-016)

- [ ] **3.1** Fix `services/workers/trigger.config.ts` — change `from '@trigger.dev/sdk/v4'` to `from '@trigger.dev/sdk'`.
- [ ] **3.2** VERIFY: `pnpm check-types` green for `@maison/workers`.

### Phase 4 — Fix color tokens to WCAG AAA (C-005, ADR-011)

- [ ] **4.1** Update `packages/ui/src/tokens/colors.css` — fix `--muted: #8a8178` → `#786f66`, `--sage: #8b9a82` → `#7e8f72`, add `--sage-soft: #dfe4d6`.
- [ ] **4.2** Update WCAG contrast comment block to reflect AAA targets.
- [ ] **4.3** VERIFY: `pnpm check-types` + `pnpm build` green.

### Phase 5 — Add Checkout Session support to webhook handler (C-002, ADR-009)

- [ ] **5.1** Update `packages/payments/src/webhooks.ts` — fully implement `handleCheckoutSessionCompleted` (currently a stub).
- [ ] **5.2** Update `packages/api/src/routers/checkout.ts` — add `createCheckoutSession` procedure alongside existing `createPaymentIntent` (keep Payment Intent as fallback for transition).
- [ ] **5.3** VERIFY: `pnpm check-types` + `pnpm test` green.

### Phase 6 — Update documentation

- [ ] **6.1** Update `AGENTS.md` — add ADR-008 through ADR-020 references, update RBAC roles, update Stripe pattern.
- [ ] **6.2** Update `CLAUDE.md` — same updates.
- [ ] **6.3** Update `PROJECT-ARCHITECTURE.md` — add ADR-008 through ADR-020 sections.

### Phase 7 — Final verification + commit + push

- [ ] **7.1** Run full 8-gate verification: `check-types`, `lint`, `test`, `build`.
- [ ] **7.2** Git add all changes.
- [ ] **7.3** Git commit with conventional commit message.
- [ ] **7.4** Git push to main using SSH wrapper.

---

## 4. Validation Against Codebase (Pre-Execution)

Before executing, I validated each finding against the actual codebase files:

- ✅ `packages/api/src/trpc.ts` lines 42-57: confirmed `adminProcedure` + `adminWriteProcedure` exist (C-001)
- ✅ `packages/auth/src/rbac.ts` lines 18-24: confirmed `['customer','staff','admin']` (C-002)
- ✅ `packages/api/src/routers/checkout.ts` line 114: confirmed `stripe.paymentIntents.create` (C-003)
- ✅ `packages/db/src/schema/orders.ts` line 32: confirmed `stripeIdempotencyKey` UNIQUE only, no `payment_events` table (C-004)
- ✅ `packages/ui/src/tokens/colors.css`: confirmed `--muted: #8a8178`, `--sage: #8b9a82` (C-005)
- ✅ `services/workers/trigger.config.ts` line 9: confirmed `from '@trigger.dev/sdk/v4'` (C-006)
- ✅ `apps/web/proxy.ts`: confirmed 2-layer auth already correct (C-007)
- ✅ `packages/api/src/routers/products.ts` line 195: confirmed `ILIKE` (C-008)
- ✅ `tooling/typescript/base.json`: confirmed all strict flags (C-009)
- ✅ `packages/auth/src/config.ts` line 68: confirmed `emailAndPassword: { enabled: true }` (C-010)

All findings verified against source. Plan is executable.

---

*End of remediation plan. Execution follows TDD: Red → Green → Refactor for each phase.*
