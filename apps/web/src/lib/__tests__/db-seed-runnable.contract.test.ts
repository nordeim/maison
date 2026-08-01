/**
 * Maison — db client CLI-runnable contract test (v14 CRITICAL)
 *
 * Locks the invariant that packages/db/src/index.ts does NOT contain
 * `import 'server-only'` — because it's imported by tsx-based CLI scripts
 * (db:seed, db:reset) that cannot set the react-server export condition.
 *
 * Why this matters: the v13 remediation added `import 'server-only'` to
 * packages/db/src/index.ts, which caused `pnpm db:seed` to fail with
 * "This module cannot be imported from a Client Component module".
 *
 * The `server-only` guard belongs at the API/server boundary consumer
 * (like api/context.ts, api/trpc.ts, auth/config.ts), NOT the low-level
 * db utility layer. Per nextjs16-react19-tailwind4-better-auth-monorepo
 * skill §db-client-pattern (lines 6064-6095).
 *
 * Per REMEDIATION_PLAN_v14 Task 1.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');
const DB_INDEX = join(REPO_ROOT, 'packages', 'db', 'src', 'index.ts');

describe('CRITICAL — db client does NOT have import "server-only" (CLI scripts must be able to import it)', () => {
  it('packages/db/src/index.ts exists', () => {
    expect(existsSync(DB_INDEX)).toBe(true);
  });

  it('packages/db/src/index.ts does NOT contain import "server-only"', () => {
    const source = readFileSync(DB_INDEX, 'utf8');
    expect(
      source,
      "packages/db/src/index.ts must NOT have `import 'server-only'` — it is imported by tsx-based CLI scripts (db:seed, db:reset) that cannot set the react-server condition. The guard belongs at the API/server boundary consumer, not the db utility layer. Per skill §db-client-pattern.",
    ).not.toMatch(/import\s+['"]server-only['"]/);
  });
});
