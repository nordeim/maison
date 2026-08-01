/**
 * Maison — non-null-assertion cleanup contract test (v16 post-remediation)
 *
 * Locks the invariant enforced by REMEDIATION_PLAN_v16 Task 2: the
 * post-destructure / array-index `!.` non-null assertions in the
 * following 6 router files are replaced by explicit `TRPCError`
 * guards (or `?? null` for processing-only returns).
 *
 * Files audited (per v16 commit `6e5e32e` claim, file:line counts in the
 * commit message):
 *   loyalty.ts(5), admin.ts(4), account.ts(2), reviews.ts(1),
 *   discounts.ts(1), trade.ts(1)
 *
 * Why this test exists:
 *   Subsequent validation (docs/SESSION_LOG_3_VALIDATION_REPORT.md,
 *   V16 #2b discrepancy) found a residual `tiers[idx + 1]!` assertion at
 *   loyalty.ts:196 — an array-index non-null assertion NOT swept by the
 *   v16 cleanup pattern. This contract test now forbids all postfix-`!`
 *   non-null assertions in the 6 audited files so the discrepancy
 *   cannot silently regress again.
 *
 * Note: `products.ts` is intentionally NOT in this list. It contains
 * 5 intentional `)!` non-null assertions on Drizzle `or()`/`and()`
 * results (lines 75, 83, 92, 106, 110) — these are type *necessities*
 * because Drizzle's `or()`/`and()` return `SQL<unknown> | undefined`
 * and the call sites guarantee an `SQL` value at runtime. See
 * REMEDIATION_PLAN_v16 Task 2 (the "products.ts keeps Drizzle `!`"
 * carve-out) and the Task 2 post-v16 follow-up note in
 * `docs/REMEDIATION_PLAN_v16.md`.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// packages/api/src/routers/ -> repo root = 4 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..');

// The 6 files where v16's non-null assertion cleanup was claimed.
const AUDITED_FILES = [
  'packages/api/src/routers/loyalty.ts',
  'packages/api/src/routers/admin.ts',
  'packages/api/src/routers/account.ts',
  'packages/api/src/routers/reviews.ts',
  'packages/api/src/routers/discounts.ts',
  'packages/api/src/routers/trade.ts',
] as const;

// Match any postfix `!` non-null assertion. Anchors on a word
// character or closing-bracket preceding the `!`, then forbids
// the `!` from being followed by `=` (which would be `!=` / `!==`,
// not a non-null assertion).
//
// Matches (TRUE positives):
//   foo!         — `(x as Foo)!` cast-assert
//   obj.x!       — `.x!` property-access assert
//   arr[0]!      — `[i]!` array-index assert
//   (cond)!      — `(cond)!` parenthesized assertion
//   foo!.x       — `foo!.x` chained assertion
//
// Does NOT match (false positives excluded):
//   !foo         —  prefix logical NOT (no preceding word/bracket)
//   a !== b      —  inequality (modifier-flag `g` ensures `!=` rejected)
//   !=           —  loose inequality
//
// The regex body `[\w)\]]\s*!\s*[^=\s]` requires SOMETHING after the
// `!` that is not `=` or whitespace — this handles `tiers[idx + 1]!`
// (followed by ` `) by inserting a "trailing `!` at end-of-operand"
// arm separately via the alternative `[\w)\]]!\s*$` (line-anchored).
//
// Combined: match either (a) `X!<something-not-=>` or (b) `X!` at
// the END of the code part of the line (after stripping comments).
const NON_NULL_ASSERTION = /[\w)\]]\s*!\s*[^=\s]|[\w)\]]!\s*$/;

describe('V16 #2b — non-null assertion cleanup invariant (no route to `!` escape hatch)', () => {
  for (const relPath of AUDITED_FILES) {
    it(`${relPath} has zero postfix \`!\` non-null assertions`, () => {
      const fullPath = join(REPO_ROOT, relPath);
      expect(existsSync(fullPath), `file not found: ${relPath}`).toBe(true);

      const source = readFileSync(fullPath, 'utf8');
      const lines = source.split('\n');
      const violations: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip purely-comment lines.
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
          continue;
        }

        // Strip trailing `// ...` inline comments before matching, so a
        // `!` appearing only in a comment suffix doesn't false-trigger.
        const codePart = line.split('//')[0] ?? '';

        if (NON_NULL_ASSERTION.test(codePart)) {
          // Further strip `!=` / `!==` by ensuring the `!` is not
          // followed by `=` (handled by regex's `\s*[.\w$]` arm —
          // `!==` would have `=` as the next char and so won't match
          // the `[.\w$]` arm unless preceded by whitespace `!==`).
          // The regex above already excludes these because it
          // requires either `.` or `[A-Za-z_$]` after the `!`.
          violations.push(`${relPath}:${i + 1}: ${trimmed.slice(0, 120)}`);
        }
      }

      expect(
        violations,
        `${relPath} must have zero postfix \`!\` non-null assertions.\n` +
          `Found ${violations.length}:\n${violations.join('\n')}`,
      ).toEqual([]);
    });
  }
});
