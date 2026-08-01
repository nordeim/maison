# MAISON — Codebase Remediation Plan v15

**Date:** 2026-08-01
**Author:** Super Z coding agent (skill-doc update + outstanding fixes, TDD-executed)
**Predecessor:** `docs/REMEDIATION_PLAN_v14.md` (fixed db:seed regression)
**Companion audits:** E2E testing of live site (agent-browser), skill-compliance audit (3 skills)
**Source-of-truth docs:** `README.md`, `Project_Requirements_Document.md`, `docs/MAISON_Design_Guide.md`, `Project_Architecture_Document.md`, `AGENTS.md`, `CLAUDE.md`, `nextjs-typescript_SKILL.md`

---

## 0. Executive Summary

This plan addresses:
1. **Updating `nextjs-typescript_SKILL.md` to v1.6** — documenting 10 lessons from the v12-v14 remediation arc
2. **3 HIGH-priority outstanding fixes** — search cursor pagination, Stripe idempotency contract test, rate-limit contract test
3. **Documentation hygiene** — appending "Deferred to v15" section to `last_remediation.md`

### Live Site Status

✅ The live site `https://maison.jesspete.shop/` is healthy. E2E testing confirmed:
- Homepage: H1 "Objects of Quiet Beauty", 27 images, 0 broken, no console errors
- All key pages return HTTP 200
- `/trade` loads instantly (v11 fix confirmed)
- No broken footer links (v12 fix confirmed)
- `pnpm db:seed` works (v14 fix confirmed — 8 collections, 20 products seeded)

### Skill-Compliance Verdict

The codebase is **100% compliant** with all 3 skills for what's documented. The gap is in the skills themselves — `nextjs-typescript_SKILL.md` v1.5 is missing 10 lessons from the v12-v14 arc. This plan updates it to v1.6.

---

## 1. Remediation ToDo List (TDD-Driven)

### Task 1 — Compound Cursor Pagination for `products.search` (HIGH)

**Issue:** The `products.search` query has no cursor at all — if results exceed `limit`, the client cannot paginate. Same data-correctness class as v12 Task 2 (which was CRITICAL for `products.list`).

**Files touched:**
- `packages/api/src/routers/products.ts` (add cursor to `search` query, mirroring `list` pattern)
- `apps/web/src/lib/__tests__/search-cursor.contract.test.ts` (NEW)

**TDD steps:**
1. **RED** — write contract test asserting `search` query uses cursor in WHERE clause.
2. **GREEN** — add compound cursor to `search` query (mirror the `list` pattern).
3. **REFACTOR** — verify full gate green.

### Task 2 — Stripe Idempotency Key Contract Test (HIGH)

**Issue:** v11 Task 4 added `{ idempotencyKey }` to `stripe.paymentIntents.create()` but noted "(no test — single arg)". A regression would silently re-introduce duplicate Payment Intents.

**Files touched:**
- `apps/web/src/lib/__tests__/stripe-idempotency.contract.test.ts` (NEW)

**TDD steps:**
1. **RED** — write contract test asserting `checkout.ts` passes `idempotencyKey` to `stripe.paymentIntents.create()`.
2. **GREEN** — (already implemented in v11; test should pass immediately).
3. **REFACTOR** — verify full gate green.

### Task 3 — Rate Limiting Procedure Builder Contract Test (HIGH)

**Issue:** v12 Task 3 added `protectedRateLimitedProcedure` but noted "(no test — procedure composition)". A regression would silently remove rate limiting from payment mutations.

**Files touched:**
- `apps/web/src/lib/__tests__/rate-limited-procedures.contract.test.ts` (NEW)

**TDD steps:**
1. **RED** — write contract test asserting the 3 payment mutations use `protectedRateLimitedProcedure`.
2. **GREEN** — (already implemented in v12; test should pass immediately).
3. **REFACTOR** — verify full gate green.

### Task 4 — Update `nextjs-typescript_SKILL.md` to v1.6 (HIGH)

**Issue:** The v12-v14 remediation arc produced 10 important lessons that are not documented in the skill. Without this update, the lessons live only in `last_remediation.md` and will be lost when the next agent starts fresh.

**Files touched:**
- `nextjs-typescript_SKILL.md` (add 10 new lessons across §4.6, §4.7, §4.8, §4.9, §5, §6.8, §7, §10, §12)

**New lessons to add:**
1. `createEnv()` proxy throws on client when server env vars accessed at module load
2. `server-only` guard placement — belongs at API/server boundary, NOT utility layer
3. `server-only` breaks tsx CLI scripts (`pnpm db:seed` regression)
4. vitest `server-only` stub alias required for transitive imports
5. Compound cursor pagination — cursor must be USED in WHERE, not just accepted
6. Stripe webhook returns 500 on handler errors → infinite retries
7. Atomic checkout transaction — multi-row writes must use `db.transaction()`
8. Stripe idempotency key must be passed to Stripe SDK, not just stored in DB
9. Rate limiting procedure builder — `.use(rateLimitMiddleware)` loses session type narrowing
10. `BETTER_AUTH_URL` host-mismatch warning — runtime check for P0 auth outage prevention

### Task 5 — Update `last_remediation.md` with v15 Section + Deferred Items

**Files touched:**
- `last_remediation.md` (append v15 section + explicit "Deferred to v16" list)

---

## 2. Execution Order

```
Task 1 (search cursor)           ──┐
Task 2 (Stripe idempotency test) ──┤
Task 3 (rate-limit test)         ──┼──► Task 4 (SKILL.md v1.6) ──► Task 5 (last_remediation.md)
```

Tasks 1-3 are independent. Task 4 documents all prior work. Task 5 documents the deferral status.

---

## 3. Validation Gates — Target (post-remediation)

| Gate | Command | Target |
|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 |
| ESLint | `pnpm lint` | ✅ 12/12 |
| Prettier | `pnpm format:check` | ✅ clean |
| Unit tests | `pnpm test` | ✅ 317+ tests |
| Build | `pnpm build` | ✅ 10/10; 42 routes |
| Live site | E2E | ✅ All pages healthy |

---

## 4. Deferred to v16

| Item | Reason |
|---|---|
| Remaining 14 non-null assertions (admin/account/loyalty) | Lower-risk paths; mechanical cleanup |
| ESLint deferral block removal (9 remaining rules) | ~200+ warnings; needs dedicated sprint |
| `noUnusedLocals` / `noUnusedParameters` enablement | Coupled to ESLint cleanup |
| Trigger.dev Phase 0 stubs | Intentional placeholder |
| Stripe API version automation | Needs Renovate/Dependabot config |
| React Compiler enablement | Needs benchmarking |
| Better Auth `session.user.name` nullability | Monitor upstream |
