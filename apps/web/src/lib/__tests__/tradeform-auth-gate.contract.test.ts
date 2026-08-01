/**
 * Maison — TradeForm auth-gate contract test (v11 E2E-HIGH)
 *
 * Locks the invariant that TradeForm skips the protected `trade.myStatus`
 * query when the user is unauthenticated (using `enabled: !!session`).
 *
 * Why this matters: without the `enabled` flag, the protected query
 * retries 3x with exponential backoff (~7 seconds) before erroring,
 * leaving unauthenticated visitors stuck on "Loading…" for 7 seconds.
 *
 * Mirrors the pattern in WishlistButton.tsx:52 (`enabled: !!session`).
 *
 * Per REMEDIATION_PLAN_v11 Task 1.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_SRC = join(HERE, '..', '..'); // apps/web/src
const TRADE_FORM = join(WEB_SRC, 'components', 'shop', 'TradeForm.tsx');

describe('E2E-HIGH — TradeForm skips protected query when unauthenticated', () => {
  it('imports useSession from @maison/auth/client', () => {
    const source = readFileSync(TRADE_FORM, 'utf8');
    expect(source).toMatch(/useSession/);
    expect(source).toMatch(/from\s+['"]@maison\/auth\/client['"]/);
  });

  it('calls useSession() to get the session', () => {
    const source = readFileSync(TRADE_FORM, 'utf8');
    expect(source).toMatch(/const\s*\{\s*data:\s*session\s*\}\s*=\s*useSession\(\)/);
  });

  it('passes enabled: !!session to the trade.myStatus useQuery call', () => {
    const source = readFileSync(TRADE_FORM, 'utf8');
    // The useQuery call should have { enabled: !!session } as the second argument
    expect(source).toMatch(/trpc\.trade\.myStatus\.useQuery\(/);
    expect(source).toMatch(/enabled:\s*!!session/);
  });
});
