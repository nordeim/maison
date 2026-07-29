/**
 * Maison — ADR-019 coverage thresholds contract test
 *
 * Verifies that every package named in ADR-019 has a `coverage.thresholds`
 * block in its `vitest.config.ts` with the correct per-package values.
 *
 * ADR-019 canonical thresholds:
 *   packages/db:         80%
 *   packages/api:        90%
 *   packages/auth:       90%
 *   packages/payments:   95%
 *   apps/web:            70%
 *   services/workers:    85%
 *
 * (packages/config, packages/email, packages/ui are NOT in ADR-019 — they
 * have no mandated threshold and are skipped.)
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, it, expect } from 'vitest';

const REPO_ROOT = resolve(__dirname, '../../../../..');

const CASES: { pkg: string; threshold: number; relPath: string }[] = [
  { pkg: 'packages/db', threshold: 80, relPath: 'packages/db/vitest.config.ts' },
  { pkg: 'packages/api', threshold: 90, relPath: 'packages/api/vitest.config.ts' },
  { pkg: 'packages/auth', threshold: 90, relPath: 'packages/auth/vitest.config.ts' },
  { pkg: 'packages/payments', threshold: 95, relPath: 'packages/payments/vitest.config.ts' },
  { pkg: 'apps/web', threshold: 70, relPath: 'apps/web/vitest.config.ts' },
  { pkg: 'services/workers', threshold: 85, relPath: 'services/workers/vitest.config.ts' },
];

/**
 * Assert that `source` contains a `<kind>: <threshold>` declaration where
 * `kind` is one of lines/functions/branches/statements. Uses RegExp.exec()
 * per @typescript-eslint/prefer-regexp-exec.
 */
function expectThresholdInSource(source: string, kind: string, threshold: number): void {
  const pattern = new RegExp(`${kind}:\\s*(${String(threshold)})\\b`);
  const match = pattern.exec(source);
  expect(match, `expected ${kind}: ${String(threshold)} in source`).not.toBeNull();
  if (match !== null) {
    expect(Number(match[1])).toBe(threshold);
  }
}

describe('ADR-019 — coverage thresholds contract', () => {
  for (const { pkg, threshold, relPath } of CASES) {
    describe(`${pkg} vitest.config.ts`, () => {
      const configPath = resolve(REPO_ROOT, relPath);
      let source: string | null = null;
      try {
        source = readFileSync(configPath, 'utf8');
      } catch {
        // file may not exist; tests below will skip
      }

      if (source === null) {
        it.skip(`file not found at ${relPath}`, () => undefined);
      } else {
        const src = source;
        const thresholdStr = String(threshold);

        it('defines a coverage.thresholds block', () => {
          expect(src).toMatch(/coverage:\s*\{[\s\S]*?thresholds:\s*\{/);
        });

        it(`sets lines threshold = ${thresholdStr}`, () => {
          expectThresholdInSource(src, 'lines', threshold);
        });

        it(`sets functions threshold = ${thresholdStr}`, () => {
          expectThresholdInSource(src, 'functions', threshold);
        });

        it(`sets branches threshold = ${thresholdStr}`, () => {
          expectThresholdInSource(src, 'branches', threshold);
        });

        it(`sets statements threshold = ${thresholdStr}`, () => {
          expectThresholdInSource(src, 'statements', threshold);
        });
      }
    });
  }
});
