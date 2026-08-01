/**
 * Maison — Dependency hygiene contract test (v10 MEDIUM-1..6 + 12 additional)
 *
 * Locks the invariant that the unused dependencies identified in
 * AUDIT_REPORT.md (MEDIUM-1 through MEDIUM-6) plus 12 additional unused
 * deps discovered during independent re-audit are NOT present in the
 * corresponding package.json files.
 *
 * Why this matters: unused dependencies bloat install size, slow CI,
 * create false impressions of what the codebase depends on, and can
 * pull in transitive deps with security or compatibility issues.
 *
 * Per REMEDIATION_PLAN_v10 Task 2.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');

interface PkgCheck {
  pkgName: string;
  relPath: string;
  deps: string[]; // dep names that must NOT be in dependencies or devDependencies
}

const CHECKS: PkgCheck[] = [
  // MEDIUM-1: @maison/api
  {
    pkgName: '@maison/api',
    relPath: 'packages/api',
    deps: ['@maison/config'],
  },
  // MEDIUM-2: @maison/auth — zod KEPT (transitive type dependency)
  // Better Auth's inferred type for `auth` in config.ts:56 references
  // zod/v4/core internally (TS2742 error if zod is removed). zod is not
  // directly imported in src/ but is required for type portability.
  // The AUDIT_REPORT.md MEDIUM-2 claim was incorrect — zod IS needed.
  // See REMEDIATION_PLAN_v10 Task 2 REFACTOR note.
  // {
  //   pkgName: '@maison/auth',
  //   relPath: 'packages/auth',
  //   deps: ['zod'],
  // },
  // MEDIUM-3: @maison/db
  {
    pkgName: '@maison/db',
    relPath: 'packages/db',
    deps: ['zod', 'testcontainers'],
  },
  // MEDIUM-4: @maison/payments
  {
    pkgName: '@maison/payments',
    relPath: 'packages/payments',
    deps: ['zod'],
  },
  // MEDIUM-5: @maison/email
  {
    pkgName: '@maison/email',
    relPath: 'packages/email',
    deps: ['zod', 'react-dom', '@types/react-dom'],
  },
  // MEDIUM-6: @maison/web — original 20 from AUDIT_REPORT (excl. stripe which is used via @maison/payments)
  {
    pkgName: '@maison/web',
    relPath: 'apps/web',
    deps: [
      'lucide-react',
      'react-hook-form',
      'sonner',
      'cmdk',
      'class-variance-authority',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@sanity/client',
      '@sanity/image-url',
      '@t3-oss/env-nextjs',
      '@trpc/next',
      'next-sanity',
      'nuqs',
      'posthog-js',
      'superjson',
      'zod',
      // 12 additional unused deps discovered during independent re-audit
      '@hookform/resolvers',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@tailwindcss/typography',
      '@testing-library/react',
      '@testing-library/user-event',
      'autoprefixer',
    ],
  },
];

describe('MEDIUM-1..6 + 12 additional — unused deps removed from package.json', () => {
  for (const { pkgName, relPath, deps } of CHECKS) {
    describe(`${pkgName} (${relPath})`, () => {
      const pkgJsonPath = join(REPO_ROOT, relPath, 'package.json');
      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      for (const dep of deps) {
        it(`does NOT declare "${dep}" in dependencies or devDependencies`, () => {
          const inDeps = Object.keys(pkg.dependencies ?? {}).includes(dep);
          const inDevDeps = Object.keys(pkg.devDependencies ?? {}).includes(dep);
          expect(
            inDeps || inDevDeps,
            `${pkgName} still declares "${dep}" (in ${inDeps ? 'dependencies' : 'devDependencies'}) — remove it per REMEDIATION_PLAN_v10 Task 2`,
          ).toBe(false);
        });
      }
    });
  }
});
