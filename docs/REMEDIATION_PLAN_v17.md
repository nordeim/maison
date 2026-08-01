# MAISON — Codebase Remediation Plan v17

**Date:** 2026-08-01
**Author:** Super Z coding agent (loyalty.ts fix + Priority 1 lint cleanup, TDD-executed)
**Predecessor:** `docs/REMEDIATION_PLAN_v16.md` (Zod v4 migration + non-null cleanup + Dependabot)
**Companion audits:** E2E testing of live site (agent-browser), skill-compliance audit (3 skills), SESSION_LOG_3_VALIDATION_REPORT.md

---

## 0. Executive Summary

This plan addresses:
1. **loyalty.ts fix** (already applied by user — replaces `tiers[idx + 1]!` with `?? null`)
2. **Priority 1 lint cleanup** — 4 quick mechanical wins that eliminate ~22 of 91 warnings
3. **Documentation alignment** — fix doc-count drift identified in validation report

### Live Site Status

✅ The live site `https://maison.jesspete.shop/` is healthy. E2E confirmed: homepage renders correctly, all pages return 200, search works (7 results for "linen"), trade page loads instantly.

### Validation Report Status

The `SESSION_LOG_3_VALIDATION_REPORT.md` identified 6 discrepancies. The loyalty.ts fix resolves the only genuine defect (#5). The remaining 5 are cosmetic doc-count drift.

---

## 1. Remediation ToDo List (TDD-Driven)

### Task 1 — loyalty.ts fix (already applied by user)

**Status:** ✅ Done — `tiers[idx + 1]!` → `const nextTier = ... ?? null`
**Contract test:** `non-null-assertion-cleanup.contract.test.ts` (6 tests, passes)

### Task 2 — React 19 SubmitEvent Migration (HIGH, skill REACT-1)

**Issue:** 11 sites use `React.SyntheticEvent<HTMLFormElement>` instead of `React.SubmitEvent` (skill REACT-1 anti-pattern).

**Files touched:**
- `apps/web/src/app/(admin)/admin/products/new/page.tsx`
- `apps/web/src/app/(account)/account/addresses/page.tsx`
- `apps/web/src/app/(account)/account/settings/page.tsx`
- `apps/web/src/components/admin/DiscountManager.tsx`
- `apps/web/src/components/shop/GiftCardsForm.tsx`
- `apps/web/src/components/shop/TradeForm.tsx`
- `apps/web/src/components/shop/CheckoutFlow.tsx` (2 sites)
- `apps/web/src/components/shop/NewsletterForm.tsx`
- `apps/web/src/components/shop/SearchModal.tsx`
- `apps/web/src/components/shop/ContactForm.tsx`

**TDD steps:**
1. **RED** — write contract test asserting no `React.SyntheticEvent<HTMLFormElement>` in production code.
2. **GREEN** — replace all 11 sites with `React.SubmitEvent`.
3. **REFACTOR** — verify full gate green.

### Task 3 — trade.ts `||` → `??` (HIGH, real bug-class fix)

**Issue:** 3 sites in `trade.ts` use `||` instead of `??`, treating empty string as falsy (incorrect for trade application fields).

### Task 4 — Unnecessary Number()/Boolean() Removal (MEDIUM)

**Issue:** 5 sites pass already-correct types through `Number()` or `Boolean()`.

### Task 5 — Email Template Apostrophe Escaping (MEDIUM)

**Issue:** 5 apostrophes in email templates need HTML-escaping.

### Task 6 — Documentation Alignment (LOW)

**Issue:** Fix doc-count drift in `last_remediation.md` (5 cosmetic discrepancies from validation report).

---

## 2. Deferred to v18

| Item | Reason |
|---|---|
| React Compiler config flag | Blocked on Next.js 16.3+ types |
| ESLint deferral block rule-by-rule promotion | After all warning-class cleanups |
| `noUnusedLocals` / `noUnusedParameters` | Paired with code-cleanup sprint |
| `require-await` cleanup (8 sites) | Most are stub senders awaiting Trigger.dev Phase 1 |
| `no-unnecessary-condition` cleanup (13 sites) | Needs case-by-case verification |
| Trigger.dev Phase 0 stubs | Wait for PRD Phase 1 |
| Better Auth `session.user.name` nullability | Requires DB migration or upstream fix |
