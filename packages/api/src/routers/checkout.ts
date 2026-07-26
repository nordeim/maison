/**
 * Maison — Checkout router (stub — Phase 1)
 *
 * Protected procedures for creating Stripe Payment Intents and confirming orders.
 * Full implementation in Phase 1 with idempotency keys.
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const checkoutRouter = router({
  /**
   * Create a Stripe Payment Intent + pending order.
   * Returns clientSecret for Stripe Elements.
   */
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        cartId: z.string().uuid(),
        shippingAddress: z.record(z.unknown()),
        shippingMethod: z.enum(["standard", "express", "white_glove"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Phase 1: create Stripe PaymentIntent, create order row (status: pending)
      // For now, return a stub
      console.log("[checkout] createPaymentIntent for cart", input.cartId, "user", ctx.session.user.id);
      return {
        clientSecret: "pi_stub_secret",
        orderId: "stub-order-id",
      };
    }),

  /**
   * Confirm order after Stripe payment succeeds.
   * Idempotent — safe to retry (stripe_idempotency_key UNIQUE constraint).
   */
  confirmOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        paymentIntentId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Phase 1: update order status to "confirmed", enqueue order-confirmation email job
      console.log("[checkout] confirmOrder", input.orderId, "user", ctx.session.user.id);
      return { orderNumber: "MAI-2026-00001" };
    }),
});
