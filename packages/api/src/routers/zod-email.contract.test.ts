/**
 * Maison — Zod v4 email validation contract test (H1, ADR-018)
 *
 * Locks the invariant that all email validation uses `z.email()` (Zod v4
 * top-level string format) — NOT the deprecated `z.string().email()` pattern.
 *
 * Background:
 *   Zod v4 deprecated `z.string().email()` in favor of `z.email()`. ADR-018
 *   mandates the new pattern. Per Skill 2 (nextjs16-react19-tailwindv4-trpcv11-
 *   drizzle-better-auth) §9 + REMEDIATION_PLAN_v7 Task 1.1.
 *
 * Root cause:
 *   4 instances of `z.string().email()` remained in production code after the
 *   v4/v5/v6 remediations: contact.ts, newsletter.ts, gift-cards.ts, env.ts.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..', '..'); // up from packages/api/src/routers/

// Files that MUST use z.email() instead of z.string().email()
const FILES_TO_CHECK = [
  'packages/api/src/routers/contact.ts',
  'packages/api/src/routers/newsletter.ts',
  'packages/api/src/routers/gift-cards.ts',
  'packages/config/src/env.ts',
];

function readSource(relPath: string): string {
  return readFileSync(join(REPO_ROOT, relPath), 'utf8');
}

describe('H1 — Zod v4 email validation (ADR-018)', () => {
  for (const file of FILES_TO_CHECK) {
    describe(file, () => {
      const source = readSource(file);

      it('does NOT use the deprecated z.string().email() pattern', () => {
        // The deprecated pattern: z.string().email()
        // The fix: z.email() (Zod v4 top-level string format)
        expect(source, `${file} should not use z.string().email()`).not.toMatch(
          /z\.string\(\)\.email\(\)/,
        );
      });
    });
  }
});
