# MAISON — Codebase Remediation Plan v18

**Date:** 2026-08-01
**Author:** Super Z coding agent (getNextTier Option B lookup map + analysis doc validation)
**Predecessor:** `docs/REMEDIATION_PLAN_v17.md` (loyalty.ts fix + React 19 SubmitEvent + lint cleanup)
**Companion audits:** E2E testing of live site, 3 analysis docs (`analysis-1.md`, `analysis-2.md`, `analysis-3-feedback.md`)

---

## 0. Executive Summary

This plan addresses the optimal fix for `packages/api/src/routers/loyalty.ts` based on 3 independent code reviews (`docs/analysis-1.md`, `analysis-2.md`, `analysis-3-feedback.md`).

### The Analysis Docs' Consensus

All 3 analyses converge on:
1. **The v17 fix is behaviorally equivalent** — it's a stylistic refactor, not a bug fix
2. **The real latent bug is `indexOf === -1`** — if an unknown tier is passed, `idx = -1`, `-1 < 3` is true, and both versions silently return `'member'` instead of `null`
3. **Option B (lookup map) is the recommended fix** — O(1), self-documenting, eliminates `indexOf` entirely, and naturally returns `null` for unknown keys
4. **The `as keyof typeof TIER_THRESHOLDS` cast in `formatLoyaltyAccount` is the upstream enabler** — it silences the type checker

### Live Site Status

✅ The live site `https://maison.jesspete.shop/` is healthy. All pages return 200, homepage renders correctly with 27 images.

---

## 1. Remediation ToDo List (TDD-Driven)

### Task 1 — Apply Option B (lookup map) to `getNextTier` (HIGH)

**Issue:** The current `getNextTier` has a latent bug: if `indexOf` returns `-1` (unknown tier), it silently returns `'member'` instead of `null`.

**Fix (Option B from all 3 analyses):** Replace the `indexOf`-based implementation with a lookup map:

```ts
const NEXT_TIER: Record<keyof typeof TIER_THRESHOLDS, keyof typeof TIER_THRESHOLDS | null> = {
  member: 'silver',
  silver: 'gold',
  gold: 'platinum',
  platinum: null,
};

function getNextTier(current: keyof typeof TIER_THRESHOLDS): keyof typeof TIER_THRESHOLDS | null {
  return NEXT_TIER[current] ?? null;
}
```

**Benefits:**
- O(1) lookup (vs O(n) `indexOf`)
- Self-documenting (tier progression is explicit)
- Eliminates `indexOf` entirely (no `-1` edge case)
- Naturally returns `null` for unknown keys at runtime
- `Record<>` type gives compile-time exhaustiveness checking

**Files touched:**
- `packages/api/src/routers/loyalty.ts` (replace `getNextTier` + add `NEXT_TIER` map)
- `packages/api/src/routers/loyalty.test.ts` (NEW — unit tests for `getNextTier`)

**TDD steps:**
1. **RED** — write unit tests covering all 4 valid tiers + the unknown-tier edge case
2. **GREEN** — apply Option B (lookup map)
3. **REFACTOR** — verify full gate green

### Task 2 — Validate `formatLoyaltyAccount` cast safety (MEDIUM)

**Issue:** `formatLoyaltyAccount` casts `account.tier as keyof typeof TIER_THRESHOLDS` without validation. If the DB contains an invalid tier string, it reaches `getNextTier` silently.

**Fix:** Add runtime validation before the cast. With Option B, `getNextTier` already handles unknown keys safely (returns `null`), but the cast should still be validated for defense-in-depth.

### Task 3 — Update Documentation

**Files touched:**
- `last_remediation.md` (append v18 section)
- `docs/REMEDIATION_PLAN_v18.md` (this file)

---

## 2. Validation Gates — Target (post-remediation)

| Gate | Command | Target |
|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 |
| ESLint | `pnpm lint` | ✅ 12/12 |
| Prettier | `pnpm format:check` | ✅ clean |
| Unit tests | `pnpm test` | ✅ 395+ tests |
| Build | `pnpm build` | ✅ 10/10; 42 routes |
