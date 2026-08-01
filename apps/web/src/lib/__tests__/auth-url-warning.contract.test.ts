/**
 * Maison — BETTER_AUTH_URL host-mismatch warning contract test (v12 HIGH)
 *
 * Locks the invariant that packages/config/src/env.ts contains a runtime
 * check comparing BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL hosts in production.
 *
 * Why this matters: a mismatch causes session cookies to be set for the
 * wrong domain → P0 auth outage.
 *
 * Per REMEDIATION_PLAN_v12 Task 4.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');
const ENV_PATH = join(REPO_ROOT, 'packages', 'config', 'src', 'env.ts');

describe('HIGH — env.ts has BETTER_AUTH_URL host-mismatch warning', () => {
  it('env.ts exists', () => {
    expect(existsSync(ENV_PATH)).toBe(true);
  });

  it('env.ts contains a host-mismatch check comparing BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL', () => {
    const source = readFileSync(ENV_PATH, 'utf8');
    // Look for evidence of a host comparison between the two URLs
    expect(
      source,
      'env.ts must contain a host-mismatch check comparing BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL',
    ).toMatch(/BETTER_AUTH_URL.*NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_APP_URL.*BETTER_AUTH_URL/);
    // Must use URL parsing to compare hosts
    expect(source).toMatch(/new URL/);
    expect(source).toMatch(/\.host/);
    // Must be gated on production
    expect(source).toMatch(/NODE_ENV.*production|production.*NODE_ENV/);
  });
});
