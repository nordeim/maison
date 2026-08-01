/**
 * Maison — Zod v4 native API contract test (v16 HIGH)
 *
 * Locks the invariant that production code uses Zod v4 native APIs
 * (z.uuid(), z.url(), z.email(), z.iso.datetime()) instead of the
 * deprecated v3 string-validation APIs (z.string().uuid(), etc.).
 *
 * Per skill §2.1 (Validation) + REMEDIATION_PLAN_v16 Task 1.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');

// Deprecated Zod v3 patterns that should be migrated to v4 native APIs
const DEPRECATED_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  { pattern: /z\.string\(\)\.uuid\(\)/g, replacement: 'z.uuid()' },
  { pattern: /z\.string\(\)\.url\(\)/g, replacement: 'z.url()' },
  { pattern: /z\.string\(\)\.email\(\)/g, replacement: 'z.email()' },
  { pattern: /z\.string\(\)\.datetime\(\)/g, replacement: 'z.iso.datetime()' },
];

// Files exempt from the check (test files, docs, skills)
function isExempt(relPath: string): boolean {
  return (
    relPath.includes('.test.') ||
    relPath.includes('.spec.') ||
    relPath.includes('node_modules') ||
    relPath.includes('skills/') ||
    relPath.includes('docs/') ||
    relPath.includes('.d.ts')
  );
}

function listTsFiles(dir: string, base: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(base, full);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.turbo' || entry === 'dist') {
        continue;
      }
      listTsFiles(full, base, acc);
    } else if ((entry.endsWith('.ts') || entry.endsWith('.tsx')) && !isExempt(rel)) {
      acc.push(rel);
    }
  }
  return acc;
}

describe('HIGH — Zod v4 native APIs (no deprecated z.string().uuid/url/email/datetime)', () => {
  const searchDirs = ['packages', 'apps/web/src'];
  const allFiles: string[] = [];

  for (const dir of searchDirs) {
    const fullDir = join(REPO_ROOT, dir);
    if (existsSync(fullDir)) {
      allFiles.push(...listTsFiles(fullDir, REPO_ROOT));
    }
  }

  for (const relPath of allFiles) {
    it(`${relPath} uses Zod v4 native APIs`, () => {
      const content = readFileSync(join(REPO_ROOT, relPath), 'utf8');
      const violations: string[] = [];

      for (const { pattern, replacement } of DEPRECATED_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push(`${String(matches.length)}x ${pattern.source} → ${replacement}`);
        }
      }

      expect(
        violations,
        `${relPath} has deprecated Zod v3 APIs:\n  ${violations.join('\n  ')}\nMigrate to Zod v4 native APIs per skill §2.1.`,
      ).toEqual([]);
    });
  }
});
