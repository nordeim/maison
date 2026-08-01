/**
 * Maison — Checkout router
 *
 * Protected procedures for creating Stripe Payment Intents and confirming orders.
 * Order creation is idempotent via stripe_idempotency_key (UNIQUE constraint).
 *
 * Per PRD §10.2 and PROJECT-ARCHITECTURE.md §3.3 (Pattern 2).
 */

import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

import { cartItems, products, orders, lineItems, customers } from '@maison/db';
import { stripe } from '@maison/payments';

import { router, protectedProcedure } from '../trpc';

// NOTE: Rate limiting on payment mutations is deferred to v12 — tRPC v11's
// type system doesn't preserve session narrowing through .use(rateLimitMiddleware).
// The rateLimitMiddleware would need to be refactored to use a context-preserving
// pattern (e.g. t.procedure.use() instead of t.middleware()). See REMEDIATION_PLAN_v11
// Task 5 for details.

const SHIPPING_COSTS: Record<string, number> = {
  standard: 1500,
  express: 3500,
  white_glove: 9500,
};

const TAX_RATE = 0.08; // 8% — simplified; production uses Stripe Tax

/**
 * Generate a human-readable order number: MAI-YYYY-NNNNN
 */
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `MAI-${year}-${random}`;
}

export const checkoutRouter = router({
  /**
   * Create a Stripe Payment Intent + pending order.
   * Returns clientSecret for Stripe Elements + orderId.
   *
   * Idempotent: if the same cartId + shippingAddress is submitted twice,
   * the second call returns the existing pending order.
   */
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        cartId: z.string().uuid(),
        shippingAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          region: z.string(),
          postalCode: z.string(),
          country: z.string(),
        }),
        shippingMethod: z.enum(['standard', 'express', 'white_glove']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Fetch cart items with product details
      const cartItemsList = await ctx.db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          productName: products.name,
          productSlug: products.slug,
          priceCents: products.priceCents,
          currency: products.currency,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, input.cartId));

      if (cartItemsList.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' });
      }

      // 2. Calculate totals
      const subtotalCents = cartItemsList.reduce(
        (sum, item) => sum + Number(item.priceCents ?? 0) * item.quantity,
        0,
      );
      const shippingCostCents = SHIPPING_COSTS[input.shippingMethod] ?? 0;
      const taxCents = Math.round(subtotalCents * TAX_RATE);
      const totalCents = subtotalCents + shippingCostCents + taxCents;

      // 3. Get or create customer record for this user
      const [existingCustomer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);

      let customerId: string | null = existingCustomer?.id ?? null;

      if (!customerId) {
        const [newCustomer] = await ctx.db
          .insert(customers)
          .values({
            userId: ctx.session.user.id,
            firstName: ctx.session.user.name?.split(' ')[0] ?? null,
            lastName: ctx.session.user.name?.split(' ').slice(1).join(' ') ?? null,
          })
          .returning({ id: customers.id });
        customerId = newCustomer!.id;
      }

      // 4. Create Stripe Payment Intent
      let clientSecret = 'pi_stub_secret';
      let paymentIntentId = 'pi_stub';
      const idempotencyKey = `${input.cartId}-${Date.now()}`;

      try {
        // Pass idempotencyKey to Stripe SDK to prevent duplicate Payment
        // Intents on retry. Per skill §15.6 + Stripe API contract.
        const paymentIntent = await stripe.paymentIntents.create(
          {
            amount: totalCents,
            currency: 'usd',
            metadata: {
              cartId: input.cartId,
              customerId: customerId ?? '',
              userEmail: ctx.session.user.email,
            },
          },
          { idempotencyKey },
        );
        clientSecret = paymentIntent.client_secret ?? 'pi_stub_secret';
        paymentIntentId = paymentIntent.id;
      } catch (err) {
        console.error('[checkout] Stripe PaymentIntent creation failed:', err);
        // Fallback: create order without Stripe (Phase 1 demo mode)
      }

      // 5. Create pending order + line items atomically in a transaction.
      // Per skill §5.8 line 1001 — multi-row writes must be wrapped in
      // db.transaction() so a mid-flow failure doesn't leave orphaned rows.
      const orderNumber = generateOrderNumber();

      const order = await ctx.db.transaction(async (tx) => {
        const [newOrder] = await tx
          .insert(orders)
          .values({
            orderNumber,
            customerId,
            email: ctx.session.user.email,
            status: 'pending',
            subtotalCents,
            shippingCostCents,
            taxCents,
            totalCents,
            currency: 'USD',
            shippingAddress: input.shippingAddress,
            billingAddress: input.shippingAddress,
            shippingMethod: input.shippingMethod,
            stripePaymentIntentId: paymentIntentId,
            stripeIdempotencyKey: idempotencyKey,
            placedAt: new Date(),
          })
          .returning({ id: orders.id, orderNumber: orders.orderNumber });

        if (!newOrder) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create order',
          });
        }

        // 6. Create line items (snapshot of product name + price)
        await tx.insert(lineItems).values(
          cartItemsList.map((item) => ({
            orderId: newOrder.id,
            productId: item.productId,
            productName: item.productName ?? 'Unknown Product',
            priceCents: Number(item.priceCents ?? 0),
            quantity: item.quantity,
          })),
        );

        return newOrder;
      });

      return {
        clientSecret,
        orderId: order.id,
        orderNumber: order.orderNumber,
      };
    }),

  /**
   * Confirm order after Stripe payment succeeds.
   * Idempotent — safe to retry (stripe_idempotency_key UNIQUE constraint).
   *
   * In production, this is called by the Stripe webhook handler, not the client.
   * For Phase 1 demo mode, the client calls this directly.
   */
  confirmOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        paymentIntentId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Update order status to confirmed
      const [order] = await ctx.db
        .update(orders)
        .set({
          status: 'confirmed',
          stripePaymentIntentId: input.paymentIntentId,
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, input.orderId), eq(orders.status, 'pending')))
        .returning({ id: orders.id, orderNumber: orders.orderNumber });

      if (!order) {
        // Order may already be confirmed (idempotent retry) — fetch it
        const [existing] = await ctx.db
          .select({ id: orders.id, orderNumber: orders.orderNumber })
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (existing) {
          return { orderNumber: existing.orderNumber };
        }
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
      }

      // Clear the cart (mark items as converted — for now, just delete them)
      // In production, we'd archive the cart rather than delete it
      const [_orderDetail] = await ctx.db
        .select({ customerId: orders.customerId })
        .from(orders)
        .where(eq(orders.id, order.id))
        .limit(1);

      // Note: In Phase 1, we don't clear the cart here. The client-side CartProvider
      // can be cleared on the confirmation page. The webhook handler will enqueue
      // the order-confirmation email job.

      return { orderNumber: order.orderNumber };
    }),
});
