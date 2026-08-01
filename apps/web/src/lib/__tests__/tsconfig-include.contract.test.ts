/**
 * Maison — Root-config tsconfig include contract test (v10 LOW-4)
 *
 * Locks the invariant that every root-level *.config.ts file in each
 * library-style package is covered by SOME tsconfig's `include` field,
 * so it gets type-checked by `pnpm check-types`.
 *
 * Why this matters: latent type errors in `drizzle.config.ts`,
 * `vitest.config.ts`, `trigger.config.ts`, etc. can go undetected
 * because each package's main `tsconfig.json` only includes a src glob.
 * The `coverage-thresholds.contract.test.ts` only checks threshold values
 * via regex; it does NOT type-check the config files themselves.
 *
 * Per REMEDIATION_PLAN_v10 Task 4.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');

const PACKAGES_WITH_ROOT_CONFIGS = [
  'services/workers', // trigger.config.ts, vitest.config.ts
  'packages/api', // vitest.config.ts
  'packages/auth', // vitest.config.ts
  'packages/config', // vitest.config.ts
  'packages/db', // drizzle.config.ts, vitest.config.ts
  'packages/email', // vitest.config.ts
  'packages/payments', // vitest.config.ts
];

/** Returns true if `configFile` is covered by `include` patterns in `tsconfigSrc`. */
function isCoveredByInclude(configFile: string, tsconfigSrc: string): boolean {
  // Strip // and /* */ comments to be safe
  const stripped = tsconfigSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  // Try to extract the include array.
  const includeRe = /"include"\s*:\s*\[([^\]]*)\]/;
  const includeMatch = includeRe.exec(stripped);
  if (!includeMatch) return false;
  const includeArr = includeMatch[1] ?? '';

  // Each entry is a quoted glob or filename.
  const entryRe = /"([^"]+)"/g;
  const entries: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(includeArr)) !== null) {
    const entry = m[1];
    if (entry !== undefined) entries.push(entry);
  }

  return entries.some((entry) => {
    if (entry === configFile) return true; // exact filename match
    // glob: **/*.ts matches any .ts at any depth
    if (entry === '**/*.ts' && configFile.endsWith('.ts')) return true;
    if (entry === '**/*.tsx' && configFile.endsWith('.tsx')) return true;
    // glob: *.config.ts matches root-level .config.ts files
    if (entry === '*.config.ts' && /^.+\.config\.ts$/.test(configFile)) return true;
    if (entry === '*.config.tsx' && /^.+\.config\.tsx$/.test(configFile)) return true;
    return false;
  });
}

describe('LOW-4 — every root *.config.ts is covered by a tsconfig include', () => {
  for (const relPath of PACKAGES_WITH_ROOT_CONFIGS) {
    describe(relPath, () => {
      const pkgDir = join(REPO_ROOT, relPath);
      const rootConfigFiles = readdirSync(pkgDir).filter((f) => /\.config\.tsx?$/.test(f));

      if (rootConfigFiles.length === 0) {
        it('has at least one root *.config.ts file (sanity)', () => {
          expect(rootConfigFiles.length, `expected ≥1 root config in ${relPath}`).toBeGreaterThan(
            0,
          );
        });
        return;
      }

      for (const configFile of rootConfigFiles) {
        it(`${configFile} is in some tsconfig.json or tsconfig.config.json include`, () => {
          const mainTsconfigPath = join(pkgDir, 'tsconfig.json');
          const configTsconfigPath = join(pkgDir, 'tsconfig.config.json');

          const candidates: string[] = [];
          if (existsSync(mainTsconfigPath)) candidates.push(readFileSync(mainTsconfigPath, 'utf8'));
          if (existsSync(configTsconfigPath))
            candidates.push(readFileSync(configTsconfigPath, 'utf8'));

          expect(candidates.length, `no tsconfig found in ${relPath}`).toBeGreaterThan(0);

          const covered = candidates.some((src) => isCoveredByInclude(configFile, src));

          expect(
            covered,
            `${configFile} not in any tsconfig include in ${relPath} — add it to tsconfig.config.json per REMEDIATION_PLAN_v10 Task 4`,
          ).toBe(true);
        });
      }
    });
  }
});
