/**
 * Maison — env.ts server-only access contract test (v13 CRITICAL hotfix)
 *
 * Locks the invariant that the `env` object's server-side variables are
 * only accessed in a server-side context (guarded by a typeof window check).
 *
 * Why this matters: the `createEnv()` from @t3-oss/env-core uses a proxy
 * that THROWS when server-side env vars (like BETTER_AUTH_URL) are accessed
 * on the client (isServer=false). The v12 `warnOnAuthUrlMismatch` call
 * accessed `env.BETTER_AUTH_URL` at module load time WITHOUT a server guard,
 * breaking client-side hydration → "This page couldn't load" error on the
 * live site.
 *
 * Per REMEDIATION_PLAN_v13 Task 1 (CRITICAL hotfix).
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');
const ENV_PATH = join(REPO_ROOT, 'packages', 'config', 'src', 'env.ts');

describe('CRITICAL — env.ts guards server-side env access with typeof window check', () => {
  it('env.ts exists', () => {
    expect(existsSync(ENV_PATH)).toBe(true);
  });

  it('warnOnAuthUrlMismatch call is guarded by a server-side check (window undefined)', () => {
    const source = readFileSync(ENV_PATH, 'utf8');
    // The warnOnAuthUrlMismatch call must be inside a guard that checks
    // for the absence of `window` (i.e., server-side only).
    // Use a multiline-aware search (the prettier-formatted code may span lines).
    expect(
      source,
      'warnOnAuthUrlMismatch must be guarded by a typeof window/globalThis check to prevent client-side throws',
    ).toMatch(
      /typeof\s+globalThis[\s\S]*?window[\s\S]*?undefined|typeof\s+window[\s\S]*?undefined/,
    );
  });

  it('env.BETTER_AUTH_URL is NOT accessed in an unguarded top-level call', () => {
    const source = readFileSync(ENV_PATH, 'utf8');
    // The dangerous pattern is: warnOnAuthUrlMismatch(env.BETTER_AUTH_URL, ...)
    // called directly after `export const env = loadEnv();` WITHOUT an if guard.
    // The safe pattern wraps it in `if (isServer) { ... }` or similar.
    const lines = source.split('\n');
    let foundUnguardedCall = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      // Look for warnOnAuthUrlMismatch(env.BETTER_AUTH_URL
      if (line.includes('warnOnAuthUrlMismatch(env.BETTER_AUTH_URL')) {
        // Check the previous 8 lines for an if statement that contains a
        // server-side guard keyword (window/globalThis/isServer) anywhere
        // in the if block (may span multiple lines due to prettier formatting).
        let hasGuard = false;
        for (let j = Math.max(0, i - 8); j < i; j++) {
          const prevLine = lines[j];
          if (prevLine?.trim().startsWith('if')) {
            // Found an if statement — now check if any line between the if
            // and the warnOnAuthUrlMismatch call contains a guard keyword.
            for (let k = j; k <= i; k++) {
              const checkLine = lines[k];
              if (
                checkLine &&
                (checkLine.includes('window') ||
                  checkLine.includes('globalThis') ||
                  checkLine.includes('isServer'))
              ) {
                hasGuard = true;
                break;
              }
            }
            if (hasGuard) break;
          }
        }
        if (!hasGuard) {
          foundUnguardedCall = true;
          break;
        }
      }
    }

    expect(
      foundUnguardedCall,
      'warnOnAuthUrlMismatch(env.BETTER_AUTH_URL, ...) is called WITHOUT a server-side guard (if statement checking window/globalThis/isServer). This breaks client-side hydration.',
    ).toBe(false);
  });
});
