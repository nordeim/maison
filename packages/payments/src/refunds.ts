/**
 * Maison — Stripe refund helper
 *
 * Admin-only. Creates a Stripe refund + updates the order status.
 */

import { stripe } from './client';

/**
 * Stripe Refund status values (from Stripe docs).
 * `Stripe.Refund.Status` is not a namespace member in Stripe 22.3.2;
 * `refund.status` is `string | null` at the resource level.
 */
type RefundStatus = 'pending' | 'requires_action' | 'succeeded' | 'failed' | 'canceled';

export interface RefundResult {
  refundId: string;
  amountCents: number;
  status: RefundStatus;
}

/**
 * Create a Stripe refund.
 * @param paymentIntentId - The Stripe Payment Intent ID to refund
 * @param amountCents - Amount to refund (defaults to full amount if undefined)
 * @param reason - Reason for refund (one of Stripe's allowed values)
 */
export async function createRefund(
  paymentIntentId: string,
  amountCents?: number,
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer',
): Promise<RefundResult> {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents !== undefined ? { amount: amountCents } : {}),
    reason,
  });

  return {
    refundId: refund.id,
    amountCents: refund.amount,
    status: refund.status as RefundStatus,
  };
}
