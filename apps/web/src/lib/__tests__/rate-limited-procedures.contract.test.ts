/**
 * Maison — Rate-limited procedures contract test (v15 HIGH)
 *
 * Locks the invariant that the 3 payment mutations use
 * protectedRateLimitedProcedure (not plain protectedProcedure) to
 * prevent payment-abuse attacks.
 *
 * Per REMEDIATION_PLAN_v15 Task 3.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');

const PAYMENT_ROUTERS = [
  { name: 'checkout.createPaymentIntent', path: 'packages/api/src/routers/checkout.ts' },
  { name: 'giftCards.purchase', path: 'packages/api/src/routers/gift-cards.ts' },
  { name: 'trade.submitApplication', path: 'packages/api/src/routers/trade.ts' },
];

describe('HIGH — payment mutations use protectedRateLimitedProcedure', () => {
  for (const { name, path } of PAYMENT_ROUTERS) {
    it(`${name} uses protectedRateLimitedProcedure (not plain protectedProcedure)`, () => {
      const fullPath = join(REPO_ROOT, path);
      const source = readFileSync(fullPath, 'utf8');
      // The mutation should use protectedRateLimitedProcedure, not protectedProcedure
      expect(
        source,
        `${name} must use protectedRateLimitedProcedure for rate limiting (not plain protectedProcedure)`,
      ).toMatch(/protectedRateLimitedProcedure/);
    });
  }
});
