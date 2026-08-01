/**
 * Maison — Stripe webhook handler
 *
 * CRITICAL: Signature verification + idempotency.
 * Stripe retries webhooks up to 3 times if it doesn't receive a 200.
 * The orders table has a UNIQUE constraint on stripe_idempotency_key —
 * duplicate processing raises an error which we catch and return 200.
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §5.5
 * and PROJECT-ARCHITECTURE.md §3.3 (Pattern 2).
 *
 * Body must be raw (not JSON-parsed) for signature verification.
 */

import { NextResponse } from 'next/server';

import { env } from '@maison/config';
import { constructWebhookEvent, handleWebhookEvent } from '@maison/payments';

export async function POST(req: Request) {
  // Read env var lazily inside the handler (not at module load) to avoid
  // the v12-style createEnv proxy throw on client-side evaluation.
  // Per REMEDIATION_PLAN_v13 Task 3.
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe-webhook] Signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  try {
    await handleWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe-webhook] Event handling failed:', message);

    // If the error is a unique constraint violation, the event was already
    // processed (Stripe retried). Return 200 so Stripe stops retrying.
    if (message.includes('unique') || message.includes('duplicate')) {
      console.warn('[stripe-webhook] Duplicate event — returning 200 to stop retries');
      return NextResponse.json({ received: true, duplicate: true });
    }

    // CRITICAL: Return 200 for ALL handler errors after signature verification
    // passes. Stripe retries webhooks for up to 3 days if it doesn't receive
    // a 200. The idempotency layer (payment_events.stripe_event_id UNIQUE +
    // pg_advisory_xact_lock) ensures duplicate events are safe to re-process.
    // Returning 500 for transient errors (DB connection blip, etc.) causes
    // infinite Stripe retries. Per skill §16.5 line 4685.
    console.error('[stripe-webhook] Handler error (returning 200 to stop retries):', message);
    return NextResponse.json({ received: true, error: message });
  }
}
