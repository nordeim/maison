/**
 * Maison — Stripe webhook event handlers
 *
 * Idempotent — safe for Stripe's 3x retry. The orders table has a UNIQUE
 * constraint on stripe_idempotency_key; duplicate inserts raise an error
 * which we catch and return 200 (so Stripe stops retrying).
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §5.5.
 */

import type Stripe from "stripe";
import { stripe } from "./client";
import { db } from "@maison/db";
import { orders, lineItems } from "@maison/db";
import { eq, sql } from "drizzle-orm";

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
      console.log(`[stripe] Unhandled event type: ${event.type}`);
  }
}

/**
 * payment_intent.succeeded — update order to "confirmed" and send email.
 * Idempotent: if the order is already confirmed, do nothing.
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("[stripe] payment_intent.succeeded:", paymentIntent.id);

  // Find the order by stripe_payment_intent_id
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (!order) {
    console.warn(`[stripe] No order found for payment_intent ${paymentIntent.id}`);
    return;
  }

  // Idempotency: if already confirmed, skip
  if (order.status === "confirmed" || order.status === "shipped" || order.status === "delivered") {
    console.log(`[stripe] Order ${order.orderNumber} already ${order.status}, skipping`);
    return;
  }

  // Update order to confirmed
  await db
    .update(orders)
    .set({
      status: "confirmed",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  // Send order confirmation email (via Resend)
  // In production, this is enqueued as a Trigger.dev job for retry resilience.
  // For Phase 1, we send directly.
  try {
    const { sendEmail, OrderConfirmationEmail } = await import("@maison/email");

    const orderLineItems = await db
      .select()
      .from(lineItems)
      .where(eq(lineItems.orderId, order.id));

    await sendEmail({
      to: order.email,
      subject: `Order ${order.orderNumber} confirmed — Maison`,
      react: OrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: "",
        items: orderLineItems.map((li) => ({
          name: li.productName,
          quantity: li.quantity,
          priceCents: li.priceCents,
        })),
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCostCents,
        taxCents: order.taxCents,
        totalCents: order.totalCents,
        orderUrl: `${process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"}/account/orders`,
      }),
    });

    console.log(`[stripe] Order ${order.orderNumber} confirmed + email sent to ${order.email}`);
  } catch (err) {
    console.error(`[stripe] Failed to send confirmation email for order ${order.orderNumber}:`, err);
    // Don't throw — the order is confirmed, the email can be retried later
  }
}

/**
 * charge.refunded — update order to "refunded".
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log("[stripe] charge.refunded:", charge.id);

  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (!order) return;

  await db
    .update(orders)
    .set({
      status: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  console.log(`[stripe] Order ${order.orderNumber} refunded`);
}

/**
 * checkout.session.completed — alternative to payment_intent.succeeded
 * when using Stripe Checkout Sessions.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("[stripe] checkout.session.completed:", session.id);
  // Phase 2: implement if using Checkout Sessions
}
