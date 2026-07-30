# Maison — Skills-Compliance Remediation Plan v9

> **Goal**: Fix 5 skills-compliance non-compliances identified via re-validation
> against 3 coding skills after v8 remediation. All v5-v8 fixes confirmed working
> in production. E2E testing found no new live-site issues.

## Fixes applied (TDD-driven):

* **V9-1 (HIGH, Skill 2 §13.10)**: Removed PII logging in contact.ts + newsletter.ts.
  `console.log` was writing `name + email + message` (contact) and `email`
  (newsletter). Replaced with PII-safe messages: `'[contact] Submission received
  (PII redacted)'` and `'[newsletter] New subscriber from ${source} (PII redacted)'`.

* **V9-2 (MEDIUM, Skill 2 §13.5)**: Replaced `process.env['NEXT_PUBLIC_APP_URL']`
  in `packages/payments/src/webhooks.ts:178` with `env.NEXT_PUBLIC_APP_URL` from
  `@maison/config`. Added `@maison/config` dependency to `packages/payments`.
  v8 fixed webhook secrets but missed this app URL access in the same file.

* **V9-3 (LOW, cleanliness)**: Updated stale `managerProcedure` references in
  `packages/auth/src/rbac.ts` docstring. v8 removed the code but left comments
  referencing it as if it exists. Updated to reflect 4 canonical tiers.

* **V9-4 (LOW, Skill 3 §6.3)**: Removed non-null assertion `!` in
  `packages/config/src/jobs-client.ts:61`. Replaced with explicit `if (!accessToken)
  throw new Error(...)` guard before constructing `TriggerClient`.

* **V9-5 (LOW, Skill 3 §5.3)**: Extended `no-unknown-cast.contract.test.ts` to
  scan `.tsx` files (was only scanning `.ts`). Production `.tsx` files now
  checked for `as unknown as` casts.

## Verification:
  pnpm check-types  → 10/10 packages pass
  pnpm lint          → pass
  pnpm test          → 8/8 packages pass; 20 API tests (incl. no-unknown-cast)
  pnpm format:check  → all files clean
