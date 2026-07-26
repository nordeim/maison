/**
 * Maison — Order confirmation job (stub — Phase 1)
 *
 * Triggered by: order.created event (from checkout.confirmOrder tRPC mutation)
 * Sends OrderConfirmation email via Resend.
 * Retry: 5x with exponential backoff (email is critical).
 * If all retries fail: alert admin (Sentry + Slack webhook).
 */

export const orderConfirmationJobSpec = {
  name: "order-confirmation",
  trigger: { event: "order.created" },
  concurrency: 10,
  retry: { limit: 5, backoff: "exponential" },
} as const;

export async function orderConfirmationHandler(payload: {
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
}): Promise<void> {
  console.log("[jobs] order-confirmation: stub — would send email for", payload.orderNumber);
}
