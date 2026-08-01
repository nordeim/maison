# MAISON — Codebase Remediation Plan v16

**Date:** 2026-08-01
**Author:** Super Z coding agent (Zod v4 migration + non-null cleanup + React Compiler, TDD-executed)
**Predecessor:** `docs/REMEDIATION_PLAN_v15.md` (search cursor pagination + contract tests + SKILL.md v1.6)
**Companion audits:** E2E testing of live site (agent-browser), skill-compliance audit (3 skills)
**Source-of-truth docs:** `README.md`, `Project_Requirements_Document.md`, `docs/MAISON_Design_Guide.md`, `Project_Architecture_Document.md`, `AGENTS.md`, `CLAUDE.md`, `nextjs-typescript_SKILL.md`

---

## 0. Executive Summary

This plan addresses the outstanding deferred items from v15, prioritized by the skill-compliance audit:

1. **Zod v4 native API migration** (HIGH — 43 sites, skill-mandated)
2. **Non-null assertion cleanup** (HIGH — 24 sites, enables rule promotion)
3. **React Compiler enablement** (MEDIUM — well-documented in skills)
4. **Stripe API version automation** (MEDIUM — add Dependabot config)
5. **Fix v15 doc count discrepancies** (LOW — doc-only)

### Live Site Status

✅ The live site `https://maison.jesspete.shop/` is healthy. E2E testing confirmed all pages return 200, homepage renders correctly, search works (7 results for "linen"), trade page loads instantly.

### Skill-Compliance Verdict

The codebase is **production-healthy**: all 4 quality gates green, 320 tests passing, zero type/lint errors. The audit found 3 new compliance gaps (Zod v4 APIs, React 19 event types, non-null assertion rule level) plus 2 doc inaccuracies from v15.

---

## 1. Remediation ToDo List (TDD-Driven)

### Task 1 — Zod v4 Native API Migration (HIGH)

**Issue:** 43 sites use deprecated Zod v3 string-validation APIs (`z.string().uuid()`, `z.string().url()`, etc.). Skill 2 §2.1 mandates Zod v4 native APIs (`z.uuid()`, `z.url()`, `z.iso.datetime()`, `z.email()`).

**Files touched:**
- `packages/config/src/env.ts` (8 sites)
- `packages/api/src/routers/admin.ts` (7 sites)
- `packages/api/src/routers/cart.ts` (7 sites)
- `packages/api/src/routers/trade.ts` (3 sites)
- `packages/api/src/routers/discounts.ts` (3 sites)
- `packages/api/src/routers/reviews.ts` (3 sites)
- `packages/api/src/routers/account.ts` (2 sites)
- `packages/api/src/routers/checkout.ts` (2 sites)
- `packages/api/src/routers/products.ts` (1 site)
- `apps/web/src/lib/__tests__/zod-v4-native-api.contract.test.ts` (NEW)

**TDD steps:**
1. **RED** — write contract test asserting no `z.string().uuid()`, `z.string().url()`, `z.string().email()`, `z.string().datetime()` in production code.
2. **GREEN** — migrate all 43 sites to Zod v4 native APIs.
3. **REFACTOR** — verify full gate green.

### Task 2 — Non-Null Assertion Cleanup (HIGH)

**Issue:** 24 production `!` assertions remain (not 14 as v15 doc claimed). Replace with explicit `TRPCError` guards.

**Files touched:**
- `packages/api/src/routers/loyalty.ts` (8 sites)
- `packages/api/src/routers/admin.ts` (4 sites)
- `packages/api/src/routers/account.ts` (2 sites)
- `packages/api/src/routers/products.ts` (5 sites — the v15 cursor `or(...)!`/`and(...)!`)
- `packages/api/src/routers/discounts.ts` (1 site)
- `packages/api/src/routers/reviews.ts` (1 site)
- `packages/api/src/routers/trade.ts` (1 site)
- `packages/db/src/seed/index.ts` (2 sites — seed script, acceptable)

**TDD steps:**
1. No contract test needed (mechanical replacement with guards).
2. **GREEN** — replace each `!` with explicit `if (!x) throw new TRPCError(...)`.
3. **REFACTOR** — promote `@typescript-eslint/no-non-null-assertion` from `warn` → `error`.

**Post-v16 follow-up (validation-driven, 2026-08-02):** the session-log validation audit (`docs/SESSION_LOG_3_VALIDATION_REPORT.md`) found the cleanup had missed one residual array-index assertion at `loyalty.ts:196` (`tiers[idx + 1]!` — the v16 sweep pattern only covered destructured-`.returning()` style). Fixed via TDD: RED contract test `packages/api/src/routers/non-null-assertion-cleanup.contract.test.ts` (6 tests) audits the 6 cleanup routers (loyalty/admin/account/reviews/discounts/trade) for residual postfix `!` and locks the invariant — it excludes the intentional Drizzle `or()`/`and()` sites in `products.ts` (lines 75, 83, 92, 106, 110 — `SQL<unknown> | undefined` type necessity). GREEN rewrote `getNextTier` to `const nextTier = idx < tiers.length - 1 ? tiers[idx + 1] : null; return nextTier ?? null;`. Net api test count 20 → 26; api lint warnings 39 → 40 (net +1, all `restrict-template-expressions` in the new test — same accepted class as `no-unknown-cast.contract.test.ts`). `no-non-null-assertion` remains at `warn` (deferred per §Deferred to v17).

### Task 3 — React Compiler Enablement (MEDIUM)

**Issue:** React Compiler not enabled. Skill 2 §9.9 Gotcha 11 + Lesson 23 document the procedure.

**Files touched:**
- `apps/web/package.json` (add `babel-plugin-react-compiler` devDep)
- `apps/web/next.config.ts` (add `reactCompiler: true`)

**TDD steps:**
1. No contract test needed (config change).
2. **GREEN** — install + enable.
3. **REFACTOR** — verify build passes with React Compiler.

### Task 4 — Stripe API Version Automation (MEDIUM)

**Issue:** No Dependabot config for Stripe SDK version sync.

**Files touched:**
- `.github/dependabot.yml` (NEW)

**TDD steps:**
1. No contract test needed (config file).
2. **GREEN** — add Dependabot config.
3. **REFACTOR** — verify config is valid.

### Task 5 — Fix v15 Doc Count Discrepancies (LOW)

**Files touched:**
- `last_remediation.md` (fix counts + append v16 section)

---

## 2. Deferred to v17

| Item | Reason |
|---|---|
| ESLint deferral block rule-by-rule promotion | After Tier 1 cleanup eliminates ~50+ warnings |
| React 19 `SyntheticEvent` → `SubmitEvent` (11 sites) | Low priority — mechanical type change |
| `noUnusedLocals` / `noUnusedParameters` enablement | After ESLint cleanup |
| Trigger.dev Phase 0 stubs | Intentional placeholder — wait for PRD Phase 1 |
| Better Auth `session.user.name` nullability | Monitor upstream |
