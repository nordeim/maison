/**
 * Maison — Per-package lint scripts contract test (v10 LOW-1)
 *
 * Locks the invariant that every TS/JS workspace package has:
 *   1. A `lint` script in package.json equal to "eslint ."
 *   2. A `lint:fix` script equal to "eslint . --fix"
 *   3. An `eslint.config.mjs` file that imports @maison/eslint-config
 *
 * Why this matters: without per-package lint scripts, `pnpm lint` only
 * lints @maison/web. The other 12 packages cannot be linted individually,
 * so type-aware lint errors in those packages are only caught when the
 * web app imports them — too late.
 *
 * tooling/typescript is excluded (JSON-only package, nothing to lint).
 *
 * Per REMEDIATION_PLAN_v10 Task 3.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');

interface PkgCheck {
  name: string;
  relPath: string;
}

// 12 packages needing lint scripts (excluding @maison/web which already has one,
// and excluding @maison/typescript-config which is JSON-only).
const PACKAGES: PkgCheck[] = [
  { name: '@maison/studio', relPath: 'apps/studio' },
  { name: '@maison/workers', relPath: 'services/workers' },
  { name: '@maison/api', relPath: 'packages/api' },
  { name: '@maison/auth', relPath: 'packages/auth' },
  { name: '@maison/config', relPath: 'packages/config' },
  { name: '@maison/db', relPath: 'packages/db' },
  { name: '@maison/email', relPath: 'packages/email' },
  { name: '@maison/payments', relPath: 'packages/payments' },
  { name: '@maison/ui', relPath: 'packages/ui' },
  { name: '@maison/eslint-config', relPath: 'tooling/eslint' },
  { name: '@maison/tailwind-config', relPath: 'tooling/tailwind' },
];

describe('LOW-1 — every TS/JS package has a lint script + eslint.config.mjs', () => {
  for (const { name, relPath } of PACKAGES) {
    describe(`${name} (${relPath})`, () => {
      const pkgJsonPath = join(REPO_ROOT, relPath, 'package.json');
      const eslintConfigPath = join(REPO_ROOT, relPath, 'eslint.config.mjs');

      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
        scripts?: Record<string, string>;
      };

      it('defines a "lint" script equal to "eslint ." (or equivalent)', () => {
        expect(pkg.scripts, `${name} has no scripts block`).toBeDefined();
        const lintScript = pkg.scripts?.lint;
        expect(lintScript, `${name} missing lint script`).toBeDefined();
        // Accept "eslint ." or "eslint . --fix" patterns; the canonical form is "eslint ."
        expect(lintScript).toMatch(/^eslint\s+\.\s*$/);
      });

      it('defines a "lint:fix" script', () => {
        const lintFixScript = pkg.scripts?.['lint:fix'];
        expect(lintFixScript, `${name} missing lint:fix script`).toBeDefined();
        expect(lintFixScript).toMatch(/^eslint\s+\.\s+--fix\s*$/);
      });

      it('ships an eslint.config.mjs that imports @maison/eslint-config (or @eslint/js for self-lint)', () => {
        expect(existsSync(eslintConfigPath), `missing ${relPath}/eslint.config.mjs`).toBe(true);
        const src = readFileSync(eslintConfigPath, 'utf8');
        // tooling/eslint IS @maison/eslint-config — importing ./index.js
        // fails because ESLint's jiti loader doesn't support
        // `import.meta.dirname` in that file. Use a minimal @eslint/js
        // recommended config for self-lint instead.
        if (relPath === 'tooling/eslint') {
          expect(src).toMatch(/from\s+['"]@eslint\/js['"]/);
        } else {
          expect(src).toMatch(/from\s+['"]@maison\/eslint-config['"]/);
          expect(src).toMatch(/\.\.\.sharedConfig/);
        }
      });
    });
  }
});
