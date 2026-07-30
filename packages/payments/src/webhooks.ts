/**
 * Maison — Stripe webhook event handlers
 *
 * Idempotent via dual-defense pattern (ADR-014):
 *   1. payment_events.stripe_event_id UNIQUE INDEX (first defense)
 *   2. pg_advisory_xact_lock (second defense — transaction-scoped)
 *
 * Per Stillwater v3.0.0 §15.21.1 and ADR-014.
 */

import type Stripe from 'stripe';
import { stripe } from './client';
import { db } from '@maison/db';
import { orders, lineItems, paymentEvents } from '@maison/db';
import { env } from '@maison/config';
import { eq, sql } from 'drizzle-orm';
import { isUniqueViolation, hashStringToBigInt } from './idempotency';

type StripeEvent = Stripe.Event;

/**
 * Verify the Stripe webhook signature.
 * Throws if invalid — caller should return 400.
 */
export function constructWebhookEvent(
  body: string,
  signature: string,
  secret: string,
): StripeEvent {
  return stripe.webhooks.constructEvent(body, signature, secret);
}

/**
 * Handle a verified Stripe webhook event with dual-defense idempotency (ADR-014).
 *
 * Pattern:
 *   1. Fast-path: check if event already processed (payment_events table)
 *   2. Open transaction + acquire pg_advisory_xact_lock
 *   3. Double-check inside lock
 *   4. Process event + insert payment_events record
 *   5. On unique violation (23505): return success (already processed)
 */
export async function handleWebhookEvent(event: StripeEvent): Promise<void> {
  // 1. Fast-path idempotency check — return early if already processed
  const [existing] = await db
    .select({ id: paymentEvents.id })
    .from(paymentEvents)
    .where(eq(paymentEvents.stripeEventId, event.id))
    .limit(1);

  if (existing) {
    console.log(`[stripe] Event ${event.id} (${event.type}) already processed, skipping`);
    return;
  }

  // 2-5. Dual-defense: transaction + advisory lock + double-check + process
  try {
    await db.transaction(async (tx) => {
      // Acquire transaction-scoped advisory lock (auto-releases at COMMIT/ROLLBACK)
      const lockKey = hashStringToBigInt(event.id);
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockKey})`);

      // 3. Double-check inside lock (concurrent request may have inserted)
      const [doubleCheck] = await tx
        .select({ id: paymentEvents.id })
        .from(paymentEvents)
        .where(eq(paymentEvents.stripeEventId, event.id))
        .limit(1);

      if (doubleCheck) {
        console.log(`[stripe] Event ${event.id} processed by concurrent request, skipping`);
        return;
      }

      // 4. Process the event
      await processEventByType(event, tx);

      // Insert payment_events record (marks as processed)
      // The `payload` column is `jsonb().notNull()` with no `.$type<>()`, so
      // Drizzle infers the insert type as `unknown` — `event` (Stripe.Event)
      // is assignable to `unknown` without a cast. Per Skill 2 §9 (no
      // `as unknown as` casts).
      await tx.insert(paymentEvents).values({
        stripeEventId: event.id,
        stripeEventType: event.type,
        orderId: null, // Set by specific handlers if applicable
        payload: event,
      });
    });
  } catch (err) {
    // 5. On unique violation: already processed by a concurrent request — success
    if (isUniqueViolation(err)) {
      console.log(`[stripe] Event ${event.id} idempotency conflict resolved (already processed)`);
      return;
    }
    throw err;
  }
}

/**
 * Dispatch to the appropriate event handler (inside the transaction).
 */
async function processEventByType(
  event: StripeEvent,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<void> {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, tx);
      break;
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge, tx);
      break;
    default:
      console.log(`[stripe] Unhandled event type: ${event.type}`);
  }
}

/**
 * payment_intent.succeeded — update order to "confirmed" and send email.
 * Idempotent: if the order is already confirmed, do nothing.
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<void> {
  console.log('[stripe] payment_intent.succeeded:', paymentIntent.id);

  // Find the order by stripe_payment_intent_id
  const [order] = await tx
    .select()
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (!order) {
    console.warn(`[stripe] No order found for payment_intent ${paymentIntent.id}`);
    return;
  }

  // Idempotency: if already confirmed, skip
  if (order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered') {
    console.log(`[stripe] Order ${order.orderNumber} already ${order.status}, skipping`);
    return;
  }

  // Update order to confirmed
  await tx
    .update(orders)
    .set({
      status: 'confirmed',
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  // Send order confirmation email (via Resend)
  // In production, this is enqueued as a Trigger.dev job for retry resilience.
  // For Phase 1, we send directly.
  try {
    const { sendEmail, OrderConfirmationEmail } = await import('@maison/email');

    const orderLineItems = await tx.select().from(lineItems).where(eq(lineItems.orderId, order.id));

    await sendEmail({
      to: order.email,
      subject: `Order ${order.orderNumber} confirmed — Maison`,
      react: OrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: '',
        items: orderLineItems.map((li) => ({
          name: li.productName,
          quantity: li.quantity,
          priceCents: li.priceCents,
        })),
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCostCents,
        taxCents: order.taxCents,
        totalCents: order.totalCents,
        orderUrl: `${env.NEXT_PUBLIC_APP_URL}/account/orders`,
      }),
    });

    console.log(`[stripe] Order ${order.orderNumber} confirmed + email sent (PII redacted)`);
  } catch (err) {
    console.error(
      `[stripe] Failed to send confirmation email for order ${order.orderNumber}:`,
      err,
    );
    // Don't throw — the order is confirmed, the email can be retried later
  }
}

/**
 * charge.refunded — update order to "refunded".
 */
async function handleChargeRefunded(
  charge: Stripe.Charge,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<void> {
  console.log('[stripe] charge.refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  const [order] = await tx
    .select()
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (!order) return;

  await tx
    .update(orders)
    .set({
      status: 'refunded',
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  console.log(`[stripe] Order ${order.orderNumber} refunded`);
}
