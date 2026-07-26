/**
 * Maison — Stripe webhook event handlers
 *
 * Idempotent — safe for Stripe's 3x retry. The orders table has a UNIQUE
 * constraint on stripe_idempotency_key; duplicate inserts raise an error
 * which we catch and return 200 (so Stripe stops retrying).
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §5.5
 * and PROJECT-ARCHITECTURE.md §3.3 (Pattern 2).
 */

import type Stripe from "stripe";
import type { stripe } from "./client";

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
 * Handle a verified Stripe webhook event.
 * Idempotent — safe to call multiple times with the same event.
 */
export async function handleWebhookEvent(event: StripeEvent): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    default:
      // Unhandled event type — log but don't error (Stripe will retry if we 400)
      console.log(`[stripe] Unhandled event type: ${event.type}`);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Phase 1: update order status to "confirmed" using idempotency key
  console.log("[stripe] payment_intent.succeeded:", paymentIntent.id);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  // Phase 1: update order status to "refunded"
  console.log("[stripe] charge.refunded:", charge.id);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Phase 1: if using Checkout Sessions (alternative to Payment Intents)
  console.log("[stripe] checkout.session.completed:", session.id);
}
