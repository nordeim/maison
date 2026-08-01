/**
 * Maison — Stripe idempotency key contract test (v15 HIGH)
 *
 * Locks the invariant that checkout.ts passes { idempotencyKey } as the
 * second argument to stripe.paymentIntents.create(). Without this, a
 * retry would create duplicate Payment Intents.
 *
 * Per REMEDIATION_PLAN_v15 Task 2.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');
const CHECKOUT_ROUTER = join(REPO_ROOT, 'packages', 'api', 'src', 'routers', 'checkout.ts');

describe('HIGH — Stripe idempotency key passed to SDK', () => {
  it('checkout.ts passes idempotencyKey to stripe.paymentIntents.create()', () => {
    const source = readFileSync(CHECKOUT_ROUTER, 'utf8');
    // The stripe.paymentIntents.create() call should have a second argument
    // containing idempotencyKey
    expect(source).toMatch(/stripe\.paymentIntents\.create\(/);
    expect(
      source,
      'stripe.paymentIntents.create() must pass { idempotencyKey } as the second argument',
    ).toMatch(/idempotencyKey/);
    // Verify it's in the second-arg position (after the closing brace of the first arg)
    expect(
      source,
      'idempotencyKey must be in the second argument object, not just in the first arg metadata',
    ).toMatch(/\}\s*,\s*\{\s*idempotencyKey\s*\}/);
  });
});
