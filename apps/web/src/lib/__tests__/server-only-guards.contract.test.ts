/**
 * Maison — server-only guard contract test (v13 HIGH)
 *
 * Locks the invariant that all server-only modules include `import 'server-only'`
 * at the top of the file. This is a build-time guard that prevents accidental
 * client-side bundling of server-only code (e.g. env var reads, DB clients,
 * Better Auth config).
 *
 * Why this matters: the v12 bug was caused by env.BETTER_AUTH_URL being
 * accessed on the client. The `import 'server-only'` statement turns this
 * class of bug into a build-time error instead of a production hydration crash.
 *
 * Per REMEDIATION_PLAN_v13 Task 2.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');

const SERVER_ONLY_MODULES = [
  'packages/auth/src/config.ts',
  'packages/db/src/index.ts',
  'packages/payments/src/client.ts',
  'packages/email/src/send.ts',
  'packages/auth/src/resend-client.ts',
  'packages/api/src/context.ts',
  'packages/api/src/trpc.ts',
];

describe('HIGH — server-only modules have import "server-only" guard', () => {
  for (const relPath of SERVER_ONLY_MODULES) {
    it(`${relPath} has import 'server-only' at the top`, () => {
      const fullPath = join(REPO_ROOT, relPath);
      expect(existsSync(fullPath), `file not found: ${relPath}`).toBe(true);
      const source = readFileSync(fullPath, 'utf8');
      // Check that `import 'server-only'` or `import "server-only"` is present
      expect(
        source,
        `${relPath} must have \`import 'server-only'\` to prevent accidental client-side bundling`,
      ).toMatch(/import\s+['"]server-only['"]/);
    });
  }
});
