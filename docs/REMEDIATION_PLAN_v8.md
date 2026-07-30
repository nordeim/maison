# Maison — Skills-Compliance Remediation Plan v8

> **Goal**: Fix 5 HIGH-priority + 4 MEDIUM-priority skills-compliance non-compliances
> identified via re-validation against 3 coding skills after v7 remediation.
> All v5+v6+v7 fixes (F1–F6, G1–G3, H1–H6) are confirmed working in production.
> E2E testing found NO new live-site issues.
>
> **Evidence**: see `/home/z/my-project/worklog.md` Task ID 7b (v8 skills re-validation)
> for the full report with file:line evidence.

---

## Scope

### In scope (9 fixes — 5 HIGH + 4 MEDIUM)

| # | Issue | Severity | Category | Source |
|---|-------|----------|----------|--------|
| N1 | 9 `as unknown as` casts remain (v7 fixed only webhooks.ts) | HIGH | Code | Skill 2 §9.2 / §13.2 |
| N2 | `isAdmin` + `isStaffOrAdmin` use "admin" terminology (dead code) | HIGH | Code | ADR-008 |
| N3 | `require('node:crypto')` CommonJS in ESM module | HIGH | Code | Skill 3 |
| N4 | Stripe + Sanity webhook secrets bypass Zod env module | HIGH | Code | Skill 2 §13.5 |
| N5 | `managerProcedure` defined but unused (dead code) | HIGH | Code | Cleanliness |
| N6 | Stripe `apiVersion` not explicitly pinned | MEDIUM | Code | Skill 2 §9.9 |
| N7 | t3-env `serverSchema`/`clientSchema` separate consts | MEDIUM | Code | Skill 2 §9.9 |
| N8 | `tooling/tailwind/base.ts` duplicates `@theme` tokens | MEDIUM | Code | Skill 2 §9.5 |
| N9 | Consolidate duplicate Resend stub (part of N1) | MEDIUM | Code | Skill 2 |

### Out of scope (still deferred — re-confirmed)
- `noUnusedLocals`/`noUnusedParameters` (would surface N5 + N2 — but those are being fixed directly in v8)
- React Compiler (5 `useCallback` instances — requires config change)
- ~22 non-null assertions in tRPC routers (mostly safe Drizzle `.returning()`)
- Trigger.dev stubs (Phase 0, documented)
- 4 `'use client'` page components (deliberate, locked by contract test)

---

## Execution Plan (TDD where applicable)

### Phase 1 — Code fixes (TDD)

#### Task 1.1 — Fix `as unknown as` casts (N1, N9)

**Root cause**: 9 `as unknown as` casts remain across 6 files:
- `packages/auth/src/resend-client.ts:30` — `as unknown as Resend` (Resend stub)
- `packages/email/src/send.ts:24` — `as unknown as Resend` (duplicate Resend stub)
- `packages/api/src/routers/reviews.ts:107,130` — Drizzle raw query casts
- `packages/api/src/routers/admin.ts:541,569,612` — Drizzle raw query casts
- `packages/db/src/index.ts:61,88` — Drizzle query result casts

**Fix strategy**:
- **Resend stubs (N9)**: Extract a shared `createResendStub()` helper to avoid the duplicate `as unknown as Resend` casts. Both `resend-client.ts` and `send.ts` can use it.
- **Drizzle raw queries**: Replace `db.execute(sql\`...\`)` with typed `.select({...}).from(...)` API where possible. For complex aggregations that truly need raw SQL, use `.$type<ReturnType>()` on the result.
- **Drizzle query results**: Use proper typing via `InferSelectModel` or `.$type<>()`.

**TDD**: Contract test asserting no `as unknown as` in production code (excluding tests).

#### Task 1.2 — Remove `isAdmin` + `isStaffOrAdmin` dead code (N2)

**Root cause**: `packages/auth/src/types.ts:28,33` exports `isAdmin` and `isStaffOrAdmin` which use "admin" terminology (banned per ADR-008). These survived the v6/v7 RBAC cleanup. Per the v8 validation: "no production consumers".

**Fix strategy**: Delete both functions from `types.ts` + remove re-exports from `index.ts`. Verify no consumers via `rg`.

**TDD**: Contract test asserting `isAdmin` and `isStaffOrAdmin` are NOT exported.

#### Task 1.3 — Replace `require('node:crypto')` with ESM import (N3)

**Root cause**: `packages/auth/src/config.ts:153` uses `require('node:crypto')` (CommonJS) in an ESM module with `verbatimModuleSyntax: true`. Should use `import { randomBytes } from 'node:crypto'`.

**Fix strategy**: Replace the `require()` with a proper ESM `import` at the top of the file.

**TDD**: Contract test asserting no `require(` in `config.ts`.

#### Task 1.4 — Wire webhook secrets through `@maison/config/env` (N4)

**Root cause**:
- `apps/web/src/app/api/webhooks/stripe/route.ts:19` reads `process.env.STRIPE_WEBHOOK_SECRET` directly
- `apps/web/src/app/api/webhooks/sanity/route.ts:11` reads `process.env.SANITY_WEBHOOK_SECRET` directly

Both bypass the Zod-validated `@maison/config/env` module. Per Skill 2 §13.5, all env access should go through the typed env module.

**Fix strategy**: Add `STRIPE_WEBHOOK_SECRET` and `SANITY_WEBHOOK_SECRET` to the env schema (if not already there), then import `env` from `@maison/config` in both webhook routes and use `env.STRIPE_WEBHOOK_SECRET` / `env.SANITY_WEBHOOK_SECRET`.

**TDD**: Contract test asserting webhook routes import from `@maison/config` (not `process.env`).

#### Task 1.5 — Remove unused `managerProcedure` (N5)

**Root cause**: `packages/api/src/trpc.ts:57` defines `managerProcedure` per ADR-008, but no router uses it. Admin mutations use `ownerProcedure` directly. This is dead code.

**Fix strategy**: Two options:
- (a) Delete `managerProcedure` from `trpc.ts` + remove re-export from `index.ts`
- (b) Wire `managerProcedure` into admin mutation routers (per ADR-008 original intent)

Per the v4 plan §"Deferred Items", this was a deliberate design decision: "admin mutations currently use `ownerProcedure`". The cleaner fix is (a) — delete the dead code. If ADR-008 is later amended to require `managerProcedure`, it can be re-added.

**TDD**: Contract test asserting `managerProcedure` is NOT exported (or IS used — depending on chosen approach).

#### Task 1.6 — Pin Stripe `apiVersion` (N6)

**Root cause**: `packages/payments/src/client.ts` doesn't explicitly pin `apiVersion`. Relies on SDK default. Per Skill 2 §9.9 Gotcha 10, should be explicit.

**Fix strategy**: Add `apiVersion: '2026-06-24.dahlia'` (or current pinned version per ADR-009) to the Stripe client config.

**TDD**: No test — config change. Verify by `pnpm check-types`.

#### Task 1.7 — Inline t3-env schemas (N7)

**Root cause**: `packages/config/src/env.ts` uses separate `serverSchema`/`clientSchema` consts passed to `createEnv()`. Per Skill 2 §9.9 Gotcha 12, should be inline.

**Fix strategy**: Move the schema definitions inline into the `createEnv()` call.

**TDD**: No test — refactor. Verify by `pnpm check-types` + `pnpm test`.

#### Task 1.8 — Trim `tooling/tailwind/base.ts` (N8)

**Root cause**: `tooling/tailwind/base.ts` has a 110-line `theme.extend` block that duplicates `@theme` tokens in `globals.css`. Per Skill 2 §9.5/§13.6, Tailwind v4 is CSS-first — the `tailwind.config.ts` should only declare content paths.

**Fix strategy**: Trim `tooling/tailwind/base.ts` to only keep what's necessary (colors + fontFamilies for tests/Storybook if needed). The canonical tokens live in `globals.css` `@theme`.

**TDD**: No test — config change. Verify by `pnpm build` succeeding.

### Phase 2 — Documentation updates

#### Task 2.1 — Add v1.2.5 REMEDIATION_HISTORY
Append a v1.2.5 note to REMEDIATION_HISTORY sections in:
- `Project_Requirements_Document.md`
- `Project_Architecture_Document.md`
- `docs/MAISON_Design_Guide.md`

#### Task 2.2 — Update AGENTS.md + CLAUDE.md
- Add new contract tests to enumeration
- Update test counts
- Note the `as unknown as` removal + Resend stub consolidation

### Phase 3 — Verify

#### Task 3.1 — Run all gates
```bash
pnpm check-types
pnpm lint
pnpm test
pnpm format:check
```

### Phase 4 — Commit and push

#### Task 4.1 — Commit to main (Conventional Commits)
- Single commit: `refactor(web): skills-compliance cleanup — remove casts, dead code, wire env (v8)`

#### Task 4.2 — Push to GitHub
```bash
GIT_SSH_COMMAND="python3.13 /home/z/my-project/scripts/ssh_git_wrapper_patched.py -i /home/z/my-project/maison/docs/ssh-key.txt -o StrictHostKeyChecking=accept-new" git push origin main
```

---

## Validation Checklist (run after execution)

- [ ] N1: 0 `as unknown as` casts in production code (excluding tests)
- [ ] N2: `isAdmin` + `isStaffOrAdmin` NOT exported from `@maison/auth`
- [ ] N3: No `require(` in `packages/auth/src/config.ts`
- [ ] N4: Webhook routes import from `@maison/config` (not `process.env`)
- [ ] N5: `managerProcedure` NOT exported (or IS used)
- [ ] N6: Stripe `apiVersion` explicitly pinned in `client.ts`
- [ ] N7: t3-env schemas inlined into `createEnv()` call
- [ ] N8: `tooling/tailwind/base.ts` trimmed (no duplicate `@theme` tokens)
- [ ] N9: Single shared Resend stub helper (no duplicate `as unknown as Resend`)
- [ ] New contract tests pass
- [ ] v1.2.5 REMEDIATION_HISTORY added to PRD, PAD, Design Guide
- [ ] `pnpm check-types` passes
- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] Git commit on main branch
- [ ] Git push to GitHub succeeds
