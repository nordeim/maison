/**
 * Maison — @maison/ui vitest config contract test (v10 LOW-8)
 *
 * Locks the invariant that @maison/ui has a test script and a
 * vitest.config.ts with passWithNoTests: true (Phase 0 — the package
 * is currently CSS-token + font only, with no runtime tests).
 *
 * Why this matters: without a vitest.config.ts, 'turbo test' silently
 * skips @maison/ui. Adding the config with passWithNoTests ensures the
 * package is included in 'pnpm test' and will pick up any future tests
 * automatically.
 *
 * Per REMEDIATION_PLAN_v10 Task 5.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');

describe('LOW-8 — @maison/ui has a test script + vitest.config.ts with passWithNoTests', () => {
  const pkgPath = join(REPO_ROOT, 'packages', 'ui', 'package.json');
  const vitestPath = join(REPO_ROOT, 'packages', 'ui', 'vitest.config.ts');

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
    scripts?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  it('declares a "test" script equal to "vitest run"', () => {
    expect(pkg.scripts?.test).toBe('vitest run');
  });

  it('declares a "test:watch" script equal to "vitest"', () => {
    expect(pkg.scripts?.['test:watch']).toBe('vitest');
  });

  it('ships a vitest.config.ts', () => {
    expect(existsSync(vitestPath)).toBe(true);
  });

  it('vitest.config.ts sets passWithNoTests: true', () => {
    const src = readFileSync(vitestPath, 'utf8');
    expect(src).toMatch(/passWithNoTests:\s*true/);
  });

  it('vitest.config.ts does NOT declare a coverage.thresholds block (not in ADR-019)', () => {
    const src = readFileSync(vitestPath, 'utf8');
    expect(src).not.toMatch(/thresholds:\s*\{/);
  });

  it('declares vitest in devDependencies', () => {
    expect(pkg.devDependencies?.vitest).toBeDefined();
  });
});
