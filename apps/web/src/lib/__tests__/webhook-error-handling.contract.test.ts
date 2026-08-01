/**
 * Maison — Stripe webhook error handling contract test (v11 CRITICAL)
 *
 * Locks the invariant that the Stripe webhook route returns HTTP 200
 * (not 500) on handler errors after signature verification passes.
 *
 * Why this matters: Stripe retries webhooks for up to 3 days if it
 * doesn't receive a 200. Returning 500 on transient errors (DB blip,
 * etc.) causes infinite Stripe retries. The idempotency layer
 * (payment_events.stripe_event_id UNIQUE + pg_advisory_xact_lock)
 * ensures duplicate events are safe to re-process.
 *
 * Per skill §16.5 line 4685 + REMEDIATION_PLAN_v11 Task 2.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_SRC = join(HERE, '..', '..'); // apps/web/src
const WEBHOOK_ROUTE = join(WEB_SRC, 'app', 'api', 'webhooks', 'stripe', 'route.ts');

describe('CRITICAL — Stripe webhook returns 200 on handler errors (not 500)', () => {
  it('webhook route does NOT return status: 500 in the handler-error catch block', () => {
    const source = readFileSync(WEBHOOK_ROUTE, 'utf8');
    // The catch block at the end of the POST handler must not return 500.
    // It should return 200 so Stripe stops retrying.
    // Match the pattern: NextResponse.json(..., { status: 500 }) in the
    // final catch block (after the unique/duplicate check).
    const lines = source.split('\n');
    let inFinalCatch = false;
    let found500InFinalCatch = false;
    let braceDepth = 0;

    for (const line of lines) {
      if (line.includes('} catch (err) {') && !line.includes('constructWebhookEvent')) {
        inFinalCatch = true;
        braceDepth = 1;
        continue;
      }
      if (inFinalCatch) {
        if (line.includes('{')) braceDepth += (line.match(/\{/g) ?? []).length;
        if (line.includes('}')) braceDepth -= (line.match(/\}/g) ?? []).length;
        if (line.includes('status: 500')) {
          found500InFinalCatch = true;
        }
        if (braceDepth <= 0) {
          inFinalCatch = false;
        }
      }
    }

    expect(
      found500InFinalCatch,
      'webhook route must NOT return status: 500 in the handler-error catch block — return 200 instead so Stripe stops retrying (skill §16.5 line 4685)',
    ).toBe(false);
  });

  it('webhook route returns 200 (received: true) in the handler-error catch block', () => {
    const source = readFileSync(WEBHOOK_ROUTE, 'utf8');
    // After the unique/duplicate check, the final return should be 200.
    expect(source).toMatch(/return\s+NextResponse\.json\(\s*\{\s*received:\s*true/);
  });
});
