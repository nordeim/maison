/**
 * Maison — Stripe webhook handler contract test (ADR-009 — Payment Intents)
 *
 * Locks the invariant that the Stripe webhook handler dispatches ONLY on
 * Payment Intents events (per ADR-009 flipped to "Payment Intents" in
 * REMEDIATION_PLAN_v4). The previous `checkout.session.completed` handler
 * was a dead-code leftover from the abandoned Checkout Sessions path.
 *
 * Canonical event flow (post-remediation):
 *   - `payment_intent.succeeded` → primary confirmation trigger
 *   - `charge.refunded` → refund handling
 *   - All other events → logged and skipped
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// HERE = packages/payments/src (this test lives next to webhooks.ts)
const WEBHOOKS_PATH = join(HERE, 'webhooks.ts');

function readWebhooksSource(): string {
  return readFileSync(WEBHOOKS_PATH, 'utf8');
}

describe('ADR-009 — Stripe Payment Intents webhook contract', () => {
  it('dispatches on payment_intent.succeeded', () => {
    const source = readWebhooksSource();
    expect(source).toMatch(/case\s+['"]payment_intent\.succeeded['"]/);
  });

  it('dispatches on charge.refunded', () => {
    const source = readWebhooksSource();
    expect(source).toMatch(/case\s+['"]charge\.refunded['"]/);
  });

  it('does NOT dispatch on checkout.session.completed (ADR-009 — Payment Intents only)', () => {
    const source = readWebhooksSource();
    expect(source).not.toMatch(/case\s+['"]checkout\.session\.completed['"]/);
  });

  it('does NOT define handleCheckoutSessionCompleted function', () => {
    const source = readWebhooksSource();
    expect(source).not.toMatch(/function\s+handleCheckoutSessionCompleted\b/);
  });

  it('handlePaymentIntentSucceeded is the primary confirmation handler', () => {
    const source = readWebhooksSource();
    expect(source).toMatch(/function\s+handlePaymentIntentSucceeded\b/);
  });

  it('constructWebhookEvent is exported for signature verification', () => {
    const source = readWebhooksSource();
    expect(source).toMatch(/export\s+function\s+constructWebhookEvent\b/);
  });

  it('handleWebhookEvent is exported for dispatch', () => {
    const source = readWebhooksSource();
    expect(source).toMatch(/export\s+async\s+function\s+handleWebhookEvent\b/);
  });
});
