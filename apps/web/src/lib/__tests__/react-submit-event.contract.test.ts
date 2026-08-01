/**
 * Maison — React 19 SubmitEvent contract test (v17 HIGH, skill REACT-1)
 *
 * Locks the invariant that production code uses React.SubmitEvent (React 19)
 * instead of the deprecated React.SyntheticEvent<HTMLFormElement> for
 * form onSubmit handlers.
 *
 * Per skill nextjs-typescript_SKILL.md §REACT-1 (line 5453) + REMEDIATION_PLAN_v17 Task 2.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');

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

describe('HIGH — React 19 SubmitEvent (no deprecated SyntheticEvent<HTMLFormElement>)', () => {
  it('production code does NOT use React.SyntheticEvent<HTMLFormElement>', () => {
    const webSrc = join(REPO_ROOT, 'apps', 'web', 'src');
    if (!existsSync(webSrc)) return;
    const files = listTsFiles(webSrc, REPO_ROOT);
    const violations: string[] = [];

    for (const relPath of files) {
      const content = readFileSync(join(REPO_ROOT, relPath), 'utf8');
      // Match React.SyntheticEvent<HTMLFormElement> (the deprecated form-event type)
      if (content.includes('React.SyntheticEvent<HTMLFormElement>')) {
        violations.push(relPath);
      }
    }

    expect(
      violations,
      `Files still using deprecated React.SyntheticEvent<HTMLFormElement>:\n  ${violations.join('\n  ')}\nMigrate to React.SubmitEvent per skill §REACT-1.`,
    ).toEqual([]);
  });
});
