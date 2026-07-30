/**
 * Maison — `as unknown as` cast contract test (N1, Skill 2 §9.2)
 *
 * Locks the invariant that production code does NOT use `as unknown as` casts
 * (the most dangerous TS escape hatch). Per Skill 2 §9.2 + REMEDIATION_PLAN_v8
 * Task 1.1.
 *
 * Exceptions (allowed):
 * - `packages/db/src/index.ts:88` — Drizzle `NeonHttpDatabase | NodePgDatabase`
 *   union is non-unifiable due to diverging `*QueryResultHKT` type params.
 *   The cast is structurally required and documented. See the file's inline
 *   comments at lines 64–85.
 * - Test files (`*.test.*`) — test mocks are exempt.
 * - Comment-only mentions (the literal string in a `// comment`).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..', '..'); // up from packages/api/src/routers/

// Files where `as unknown as` is ALLOWED (with documented justification).
const ALLOWED_FILES: ReadonlySet<string> = new Set([
  // Drizzle NeonHttpDatabase | NodePgDatabase union is non-unifiable.
  'packages/db/src/index.ts',
]);

function listTsFiles(dir: string, base: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(base, full);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.turbo' || entry === 'dist') {
        continue;
      }
      listTsFiles(full, base, acc);
    } else if (
      (entry.endsWith('.ts') || entry.endsWith('.tsx')) &&
      !entry.endsWith('.test.ts') &&
      !entry.endsWith('.test.tsx') &&
      !entry.endsWith('.d.ts')
    ) {
      acc.push(rel);
    }
  }
  return acc;
}

function findCastViolations(): string[] {
  const violations: string[] = [];
  const searchDirs = ['packages', 'apps/web/src', 'services'];
  for (const dir of searchDirs) {
    const fullDir = join(REPO_ROOT, dir);
    if (!existsSync(fullDir)) continue;
    const files = listTsFiles(fullDir, REPO_ROOT);
    for (const file of files) {
      if (ALLOWED_FILES.has(file)) continue;
      const content = readFileSync(join(REPO_ROOT, file), 'utf8');
      // Match `as unknown as` but NOT inside a comment line.
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comment-only lines
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
          continue;
        }
        // Check for the pattern (also exclude lines that are just comments
        // containing the literal string).
        if (/\bas\s+unknown\s+as\b/.test(line) && !trimmed.startsWith('//')) {
          violations.push(`${file}:${i + 1}: ${trimmed.slice(0, 100)}`);
        }
      }
    }
  }
  return violations;
}

describe('N1 — no `as unknown as` casts in production code (Skill 2 §9.2)', () => {
  it('production code does NOT use `as unknown as` (except documented exceptions)', () => {
    const violations = findCastViolations();
    expect(violations, `Found ${violations.length} violations:\n${violations.join('\n')}`).toEqual(
      [],
    );
  });
});
