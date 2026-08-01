# MAISON — Codebase Remediation Plan v14

**Date:** 2026-08-01
**Author:** Super Z coding agent (v13 regression fix, TDD-executed)
**Predecessor:** `docs/REMEDIATION_PLAN_v13.md` (closed CRITICAL hydration crash + server-only guards)
**Companion audits:** E2E testing of live site (agent-browser), skill-compliance audit (3 skills)
**Source-of-truth docs:** `README.md`, `Project_Requirements_Document.md`, `docs/MAISON_Design_Guide.md`, `Project_Architecture_Document.md`, `AGENTS.md`, `CLAUDE.md`

---

## 0. Executive Summary

This plan addresses a **CRITICAL regression** introduced by the v13 remediation: `pnpm db:seed` and `pnpm db:reset` now fail with `"This module cannot be imported from a Client Component module"` because `import 'server-only'` was added to `packages/db/src/index.ts`, which is imported by `tsx`-based CLI scripts.

### The Regression

**Symptom:** `pnpm db:seed` fails with:
```
Error: This module cannot be imported from a Client Component module. It should only be used from a Server Component.
    at Object.<anonymous> (.../server-only@0.0.1/index.js:1:7)
```

**Root cause:** v13 added `import 'server-only'` to `packages/db/src/index.ts` (line 1). The seed script `packages/db/src/seed/index.ts:16` imports `db` from `../index`. The `tsx` runtime doesn't set the `react-server` export condition, so the `server-only` package resolves to its `index.js` (which throws) instead of `empty.js` (which is a no-op).

**Affected scripts:**
- `pnpm db:seed` → `tsx src/seed/index.ts` → imports `db` from `../index` → **BROKEN**
- `pnpm db:reset` → `tsx src/scripts/reset.ts` → imports `db` from `../index` → **BROKEN**
- `pnpm db:seed:e2e` → `tsx src/seed/e2e.ts` → stub, no db import → **SAFE**

### Skill-Compliance Verdict

The audit confirmed that **Option A** (remove `import 'server-only'` from `packages/db/src/index.ts` only) is fully skill-compliant:
- The `nextjs16-react19-tailwind4-better-auth-monorepo` skill shows the canonical db client with **NO** `import 'server-only'` guard
- The guard belongs at the **API/server boundary consumer** (like `apps/web/src/lib/trpc/server.ts`), not the low-level utility
- The other 6 guarded modules (auth/config, payments/client, email/send, auth/resend-client, api/context, api/trpc) are NOT consumed by `tsx` CLI scripts, so their guards are safe

### Live Site Status

✅ The live site `https://maison.jesspete.shop/` is healthy — the v13 hydration hotfix is working. All pages return HTTP 200, H1 renders correctly, 27 images load, no console errors.

---

## 1. Remediation ToDo List (TDD-Driven)

### Task 1 — Remove `import 'server-only'` from `packages/db/src/index.ts` (CRITICAL)

**Files touched:**
- `packages/db/src/index.ts` (remove line 1: `import 'server-only';`)
- `apps/web/src/lib/__tests__/server-only-guards.contract.test.ts` (remove `packages/db/src/index.ts` from `SERVER_ONLY_MODULES` array, add explanatory comment)
- `apps/web/src/lib/__tests__/db-seed-runnable.contract.test.ts` (NEW — locks the invariant that `packages/db/src/index.ts` does NOT have `import 'server-only'`)

**TDD steps:**
1. **RED** — write contract test asserting `packages/db/src/index.ts` does NOT contain `import 'server-only'` (so CLI scripts can import it).
2. **GREEN** — remove line 1 from `packages/db/src/index.ts`; update the existing `server-only-guards.contract.test.ts` to remove `packages/db/src/index.ts` from the list (7 → 6).
3. **REFACTOR** — verify `pnpm check-types`, `pnpm test`, `pnpm build` all green. Verify `pnpm db:seed` would run (can't test without a real database, but the module-load throw is eliminated).

### Task 2 — Update Documentation

**Files touched:**
- `last_remediation.md` (append v14 section)
- `AGENTS.md` (if it mentions the server-only guard placement)

---

## 2. Risk Analysis

| Risk | Likelihood | Mitigation |
|---|---|---|
| Removing the guard from db client allows client-side bundling | Very Low | The 6 boundary modules (api/context, api/trpc, auth/config, etc.) still have the guard — any client import would fail at those modules first |
| `pnpm db:seed` still fails for another reason | Low | The error message is specifically the `server-only` throw; removing the guard eliminates the module-load throw |
| Contract test needs updating | Low | The test already asserts the presence of the guard — we update the list to reflect the correct architecture |

---

## 3. Validation Gates — Target (post-remediation)

| Gate | Command | Target |
|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 |
| ESLint | `pnpm lint` | ✅ 12/12 |
| Prettier | `pnpm format:check` | ✅ clean |
| Unit tests | `pnpm test` | ✅ 313+ tests |
| Build | `pnpm build` | ✅ 10/10; 42 routes |
| `pnpm db:seed` | (manual) | ✅ No `server-only` throw |

---

## 4. Plan Validation Checklist

- [x] Root cause confirmed by reading `packages/db/src/index.ts` and `packages/db/src/seed/index.ts`
- [x] Skill-compliance audit confirmed Option A is the canonical pattern
- [x] Only `packages/db/src/index.ts` is affected (other 6 modules are safe)
- [x] The fix is minimal (remove 1 line, update 1 test, add 1 contract test)
- [x] Commit plan respects the user's instruction: no new git branch; all commits to `main`
