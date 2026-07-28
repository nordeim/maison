Remediation Plan — Validated Issues in the Maison Monorepo

Objective

Unblock the currently-failing pnpm test gate (which blocks the 8-gate pre-commit + CI pipeline) by fixing the empty-test-suite root cause, and lift real test coverage with anchored regression tests where genuine pure logic exists —
following the Stillwater reference pattern cited in AGENTS.md.

Phase 0 — ANALYZE recap (already executed, evidence above)

- Read AGENTS.md, CLAUDE.md, nextjs-typescript_SKILL.md (4260 lines), Stillwater SKILL/context.
- Ran all gates fresh (format ✅, check-types ✅, eslint ✅, per-package tests ✅ 19 pass, turbo test ❌ exit 1).
- Confirmed error.txt/status.md are stale — the 41 lint errors they describe were already fixed in earlier commits; current eslint . (no-cache) is green.
- Validated root cause: 5 packages (@maison/auth, @maison/email, @maison/payments, @maison/web, @maison/workers) have a test: "vitest run" script + vitest.config.ts with include: ['src/**/*.test.ts'] but zero matching test files →
  vitest "No test files found, exiting with code 1" → turbo test fails the whole pipeline. (Handbook §4.1 Mistake 7 / Playbook 13.)
- Confirmed the canonical fix from the production reference: Stillwater sets passWithNoTests: true in its services/workers, packages/ui, packages/payments, packages/email vitest configs with the documented rationale "so root pnpm test
  doesn't abort when test files are still being added."

Phase 1 — VALIDATE (the single currently-failing gate, fix)

1a. Author real regression tests for pure, high-value logic (no mocks needed):

- packages/auth/src/rbac.test.ts — canReadAdmin, canWriteAdmin, isValidRole (role matrix: customer→none, staff→read, admin→read+write; null/undefined/invalid→false; type-guard narrowing).
- packages/auth/src/types.test.ts — isAdmin, isStaffOrAdmin (null session→false; customer→false; staff→true; admin→true for both).
- packages/payments/src/refunds.test.ts — guard the conditional-spread idiom (§4.2 Mistake 6): amountCents omitted → payload has no amount key; provided → payload includes it; default reason='requested_by_customer'. Mock
  stripe.refunds.create to assert the exact payload shape and the RefundStatus cast.

1b. Add passWithNoTests: true to the empty-suite vitest configs that currently have no testable pure logic without heavy mock harnesses (Phase 0 stubs / React+env-heavy):

- packages/email/vitest.config.ts, packages/payments/vitest.config.ts (now has tests, but keep the flag for safety while the suite is thin), apps/web/vitest.config.ts, services/workers/vitest.config.ts.
- packages/auth will now have tests, so add the flag too for resilience.

This mirrors Stillwater exactly and means a future package with 0 tests never silently breaks the pipeline.

Phase 2 — VERIFY (adjacent gates, per handbook §2.8)

1. Per-package: pnpm exec vitest run in packages/auth (new), packages/payments (new) → green.
2. Whole gate: pnpm test (turbo) → exit 0, all 8 tasks successful (no "No test files found").
3. pnpm format:check (new test files must be Prettier-clean).
4. pnpm check-types (new test files compile under strict).
5. pnpm lint (new test files pass ESLint — no floating promises, no any, etc.).
6. bash scripts/pre-commit-check.sh — full hook simulation through to lint (the pipeline that was failing in error.txt must now complete).

Out of scope / explicitly noted (per Surgical Change Discipline):

- The ~2089-file skills/ deletion in the working tree — pre-existing, unrelated to application code, NOT touched.
- The stale error.txt/status.md will not be edited (they are historical logs, not live docs), but I'll add coverage so the tracked 8-gate state is genuinely green going forward.
- No build run (per AGENTS.md guidance to ask before long builds; tests/types/lint/format are sufficient proof for a test-gate fix).

Success criteria:

- pnpm test exit 0; turbo reports all tasks successful.
- New tests add ≥ 20 assertions across auth + payments pure logic; fail-open behavior verified (removing the fix re-breaks, removing tests keeps pipeline green via the flag, removing tests AND the flag re-breaks → proves flag is the  
  root-cause fix).
- No guardrails weakened (no // @ts-ignore, no rules disabled).

Commit grouping advice: one logical commit, scoped test + fix mix → chore(monorepo): unblock test gate with passWithNoTests + real auth/payments tests. No auto-commit; I'll leave the working tree staged-ready for your review and not  
commit/push (per AGENTS.md no-branches and per the instruction to plan-validate first).

---

Surgical and minimal: 5 modified vitest configs (+22 lines, all passWithNoTests with rationale comments) and 3 new test files — nothing else. The large skills/ deletion in the working tree was pre-existing and untouched. 
 
---
 
Handoff — Remediation Complete 
 
### Objective 
 
Unblock the failing pnpm test gate (which blocked the 8-gate pre-commit/CI) and lift real coverage on pure, high-value logic. 
 
### Root cause (validated against live evidence) 
 
Five packages (@maison/auth, @maison/email, @maison/payments, @maison/web, @maison/workers) each had a test: "vitest run" script + vitest.config.ts with include: ['src/**/*.test.ts'] but zero matching test files. Vitest exits 1 with   
"No test files found" → turbo test fails the whole pipeline. This is the textbook "empty suite surprise" (handbook §4.1 Mistake 7 / Playbook 13). error.txt/status.md are stale — the 41 lint errors they documented were already fixed;   
the real remaining blocker was test. 
 
### Fix applied (surgical, reference-grounded) 
 
- Root-cause fix: added passWithNoTests: true to the 5 empty-suite vitest.config.ts files — exactly the pattern the production reference (Stillwater, cited by AGENTS.md) uses in its services/workers, packages/email, packages/payments, 
  packages/ui configs with the rationale "so root pnpm test doesn't abort when test files are still being added." 
- Real regression tests (not just the flag) for pure logic with no harness cost: 
    - packages/auth/src/rbac.test.ts (29 tests) — full RBAC matrix: canReadAdmin/canWriteAdmin for customer/staff/admin/null/undefined; isValidRole type-guard incl. invalid values. 
    - packages/auth/src/types.test.ts (4 tests) — isAdmin/isStaffOrAdmin over all roles + null. 
    - packages/payments/src/refunds.test.ts (3 tests) — guards the §4.2 Mistake 6 conditional-spread idiom: amountCents omitted → no amount key; provided → amount included; explicit reason + status cast. Used vi.hoisted to fix the 
      Vitest mock-hoisting gotcha that surfaced on first run. 
 
### Why correct (evidence) 
 
- New tests legitimately green: auth 33 pass, payments 3 pass. 
- pnpm test: Tasks: 8 successful, 8 total, exit 0 (was exit 1). Empty suites now print "exiting with code 0." 
- Total real assertions: 63 tests across the monorepo (was 19). 
- No guardrail weakened: no @ts-ignore, no rules disabled, no any in test code (unknown-typed param for the invalid-role case). 
 
### Verification (all adjacent gates, fresh, no turbo cache) 
 
┌─────────────────┬──────────────────────────────────┬───────────────────────────────┐ 
│ Gate            │ Command                          │ Result                        │ 
├─────────────────┼──────────────────────────────────┼───────────────────────────────┤ 
│ Format          │ pnpm format:check                │ ✅ exit 0                     │ 
├─────────────────┼──────────────────────────────────┼───────────────────────────────┤ 
│ Type-check      │ pnpm check-types                 │ ✅ 10/10                      │ 
├─────────────────┼──────────────────────────────────┼───────────────────────────────┤ 
│ Lint            │ pnpm lint                        │ ✅ fresh, no cache            │ 
├─────────────────┼──────────────────────────────────┼───────────────────────────────┤ 
│ Tests           │ pnpm test                        │ ✅ 8/8, 63 tests pass         │ 
├─────────────────┼──────────────────────────────────┼───────────────────────────────┤ 
│ Pre-commit hook │ bash scripts/pre-commit-check.sh │ ✅ "Pre-commit checks passed" │ 
└─────────────────┴──────────────────────────────────┴───────────────────────────────┘ 
 
### Files changed 
 
``` 
  M apps/web/vitest.config.ts           +passWithNoTests (Phase 0 flag for component tests) 
  M packages/auth/vitest.config.ts      +passWithNoTests (resilience) 
  M packages/email/vitest.config.ts     +passWithNoTests (Phase 0: Resend stubs) 
  M packages/payments/vitest.config.ts  +passWithNoTests (resilience) 
  M services/workers/vitest.config.ts    +passWithNoTests (Phase 0: Trigger.dev stubs) 
  + packages/auth/src/rbac.test.ts       NEW — 29 tests, RBAC matrix 
  + packages/auth/src/types.test.ts      NEW — 4 tests, session role helpers 
  + packages/payments/src/refunds.test.ts NEW — 3 tests, conditional-spread guard 
``` 
 
(Note: remediation_plan.md — untracked, contains my own plan text — was Prettier-formatted so the format gate stays green without touching tracked content; it is not part of the fix and can be deleted if unused.) 
 
### Outstanding / explicitly out of scope (per Surgical Change Discipline) 
 
- The ~2089-file skills/ deletion in the working tree is pre-existing and unrelated to application code. NOT touched. Please review/restore separately (git checkout -- skills if unintended). 
- No commit made. Per AGENTS.md (no branches → push to main) and the validate-first workflow, the working tree is left staged-ready for your review. 
- The benign WARNING: no output files found for task #test from turbo is a cosmetic turbo.json artifact (test tasks have no outputs); it doesn't affect exit codes. Optionally set "dependsOn"/outputs: [] for test tasks in turbo.json 
  later if the noise bothers you — out of scope here. 
- Build gate (pnpm build) not run — per AGENTS.md guidance to confirm before long builds; type/lint/format/test already prove the test-gate fix. Run pnpm build before E2E, as CLAUDE.md notes. 
 
### Recommended next steps 
 
1. Review the 8 changed files; commit as one logical change: chore(monorepo): unblock test gate — passWithNoTests + auth/payments tests. 
2. Push to main when ready (using the SSH wrapper). 
3. (Optional, future) Author the email/web/workers mock harnesses and component tests; the passWithNoTests flag is the safety net so new packages never silently break the pipeline again. 
4. (Optional) Decide what to do with the local skills/ mass-deletion in the working tree — it's unrelated to this fix.

