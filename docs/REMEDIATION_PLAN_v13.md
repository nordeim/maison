# MAISON — Codebase Remediation Plan v13

**Date:** 2026-08-01
**Author:** Super Z coding agent (E2E-driven critical hotfix + skill-compliance closure)
**Predecessor:** `docs/REMEDIATION_PLAN_v12.md` (closed cursor pagination bug, footer links, rate limiting, auth URL warning, non-null cleanup)
**Companion audits:** E2E testing of live site (agent-browser), skill-compliance audit (3 skills)
**Source-of-truth docs:** `README.md`, `Project_Requirements_Document.md`, `docs/MAISON_Design_Guide.md`, `Project_Architecture_Document.md`, `AGENTS.md`, `CLAUDE.md`

---

## 0. Executive Summary

This plan addresses a **CRITICAL production defect** discovered via E2E testing of the live site, plus skill-compliance gaps found by auditing the codebase against 3 coding skills.

### The Critical Defect (already hotfixed in commit `43d07d2e`)

**Symptom:** The live site `https://maison.jesspete.shop/` showed "This page couldn't load" — a client-side hydration crash. The server returned HTTP 200 with correct HTML, but React failed to hydrate.

**Root cause:** The v12 `warnOnAuthUrlMismatch` function in `packages/config/src/env.ts` accessed `env.BETTER_AUTH_URL` (a server-side env var) at **module load time** without a server-side guard. The `createEnv()` proxy from `@t3-oss/env-core` throws when server-side env vars are accessed on the client (`isServer=false`). Since `env.ts` is imported by `site.ts` which is imported by the root layout, this broke client-side hydration of the entire app.

**Hotfix:** Wrapped the `warnOnAuthUrlMismatch` call in `if (typeof globalThis !== 'undefined' && typeof globalThis.window === 'undefined')` so it only runs on the server. Locked by `env-server-only.contract.test.ts` (3 tests).

### Skill-Compliance Gaps (from audit)

The audit found that the v12 bug was an instance of a broader pattern: **server-only code running at module load time in client-importable modules**. Two remaining instances of this pattern exist (currently safe but fragile), plus 7 server-only modules missing the `import 'server-only'` build-time guard.

---

## 1. E2E Findings

### 1.1 Critical: Client-Side Hydration Crash (CRITICAL — hotfixed)

**Status:** ✅ Fixed in commit `43d07d2e` (pushed to GitHub)

The live site showed "This page couldn't load" because the root layout's hydration threw an error. The error was caused by `env.BETTER_AUTH_URL` being accessed on the client side via the `createEnv()` proxy.

### 1.2 Other E2E Results (post-hotfix verification needed)

All other pages were returning HTTP 200 via curl. The hydration crash affected the entire app (root layout), so all pages showed the error. After the hotfix is deployed, all pages should work again.

---

## 2. Skill-Compliance Findings

### 2.1 Missing `import 'server-only'` Guards (HIGH)

**7 server-only modules** lack the `import 'server-only'` build-time guard:

| File | Risk |
|---|---|
| `packages/auth/src/config.ts` | **HIGHEST** — barrel export co-mingles server + client code; a mis-import would crash hydration |
| `packages/db/src/index.ts` | HIGH — throws if `DATABASE_URL` unset |
| `packages/payments/src/client.ts` | MEDIUM — static `import Stripe` |
| `packages/email/src/send.ts` | MEDIUM — static `import { Resend }` |
| `packages/auth/src/resend-client.ts` | MEDIUM — module-load side effect |
| `packages/api/src/context.ts` | MEDIUM — imports server-only `auth` + `db` |
| `packages/api/src/trpc.ts` | MEDIUM — server-only tRPC instance |

**Fix:** Add `import 'server-only';` at the top of each file.

### 2.2 Webhook Routes Access env.SERVER_VAR at Module Load (MEDIUM)

**2 webhook routes** use the v12-style pattern (`const x = env.SERVER_VAR` at module top level):

- `apps/web/src/app/api/webhooks/sanity/route.ts:13`
- `apps/web/src/app/api/webhooks/stripe/route.ts:20`

Currently safe (API routes are never client-bundled), but fragile — a future refactor extracting to a shared utility would reintroduce the v12 bug.

**Fix:** Move the `env` read inside the `POST` handler (lazy evaluation).

### 2.3 Vitest Config Missing `server-only` Stub (LOW)

`apps/web/vitest.config.ts` doesn't alias `server-only` to an empty stub. Any future test that transitively imports a `server-only`-guarded module would fail.

**Fix:** Add `resolve.alias` for `server-only`.

---

## 3. Remediation ToDo List (TDD-Driven)

### Task 1 — CRITICAL HOTFIX (already completed)

**Status:** ✅ Done (commit `43d07d2e`)
- Fixed `env.ts` to guard `warnOnAuthUrlMismatch` with `typeof window` check
- Contract test: `env-server-only.contract.test.ts` (3 tests)

### Task 2 — Add `import 'server-only'` to 7 Server-Only Modules (HIGH)

**Files touched:**
- `packages/auth/src/config.ts`
- `packages/db/src/index.ts`
- `packages/payments/src/client.ts`
- `packages/email/src/send.ts`
- `packages/auth/src/resend-client.ts`
- `packages/api/src/context.ts`
- `packages/api/src/trpc.ts`

**TDD steps:**
1. **RED** — write contract test asserting each server-only module has `import 'server-only'`.
2. **GREEN** — add `import 'server-only';` at the top of each file.
3. **REFACTOR** — verify full gate green.

### Task 3 — Move Webhook Route env Reads Inside POST Handler (MEDIUM)

**Files touched:**
- `apps/web/src/app/api/webhooks/sanity/route.ts`
- `apps/web/src/app/api/webhooks/stripe/route.ts`

**TDD steps:**
1. No contract test needed (mechanical refactor — moving a const from module scope to function scope).
2. **GREEN** — move `const webhookSecret = env.X` inside the `POST` function.
3. **REFACTOR** — verify full gate green.

### Task 4 — Add `server-only` Stub to Vitest Config (LOW)

**Files touched:**
- `apps/web/vitest.config.ts`

**TDD steps:**
1. No contract test needed (config change).
2. **GREEN** — add `resolve.alias` for `server-only`.
3. **REFACTOR** — verify `pnpm test` still passes.

---

## 4. Execution Order

Task 1 (hotfix) is already done. Tasks 2, 3, 4 are independent and will be executed sequentially.

---

## 5. Validation Gates — Target (post-remediation)

| Gate | Command | Target |
|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 |
| ESLint | `pnpm lint` | ✅ 12/12 |
| Prettier | `pnpm format:check` | ✅ clean |
| Unit tests | `pnpm test` | ✅ 302+ tests |
| Build | `pnpm build` | ✅ 10/10; 42 routes |
| Live site | E2E re-test | ✅ Homepage loads without "This page couldn't load" |

---

## 6. Plan Validation Checklist

- [x] The critical hotfix (Task 1) is already committed and pushed
- [x] The skill-compliance audit identified the same class of bug (server-only code on client)
- [x] All file paths cited exist
- [x] The `import 'server-only'` pattern is mandated by all 3 skills
- [x] The webhook route refactor eliminates the v12-style pattern
- [x] Commit plan respects the user's instruction: no new git branch; all commits to `main`
