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
