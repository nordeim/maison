/**
 * Maison — Reviews router
 *
 * Public: list approved reviews for a product, get average rating.
 * Protected: create a review (must be authenticated).
 * Admin: approve/reject reviews, list pending.
 */

import { z } from 'zod';
import { eq, and, desc, sql, avg, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { productReviews, products, orders, lineItems, customers, users } from '@maison/db';
import {
  router,
  publicProcedure,
  protectedProcedure,
  staffProcedure,
  ownerProcedure,
} from '../trpc';

export const reviewsRouter = router({
  /**
   * List approved reviews for a product.
   */
  list: publicProcedure
    .input(
      z.object({
        productSlug: z.string(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [product] = await ctx.db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, input.productSlug))
        .limit(1);

      if (!product) return { items: [], averageRating: 0, totalReviews: 0 };

      const reviews = await ctx.db
        .select({
          id: productReviews.id,
          customerName: productReviews.customerName,
          rating: productReviews.rating,
          title: productReviews.title,
          body: productReviews.body,
          photoUrls: productReviews.photoUrls,
          isVerifiedPurchase: productReviews.isVerifiedPurchase,
          createdAt: productReviews.createdAt,
        })
        .from(productReviews)
        .where(and(eq(productReviews.productId, product.id), eq(productReviews.isApproved, true)))
        .orderBy(desc(productReviews.createdAt))
        .limit(input.limit);

      const avgResult = await ctx.db
        .select({
          avg: avg(productReviews.rating),
          count: sql<number>`count(*)`,
        })
        .from(productReviews)
        .where(and(eq(productReviews.productId, product.id), eq(productReviews.isApproved, true)));

      return {
        items: reviews,
        averageRating: avgResult[0]?.avg ? Math.round(Number(avgResult[0].avg) * 10) / 10 : 0,
        totalReviews: avgResult[0]?.count ?? 0,
      };
    }),

  /**
   * Create a review (authenticated users only).
   * Checks if the user has purchased the product (verified purchase badge).
   */
  create: protectedProcedure
    .input(
      z.object({
        productSlug: z.string(),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(100).optional(),
        body: z.string().max(5000).optional(),
        photoUrls: z.array(z.string().url()).max(5).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [product] = await ctx.db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, input.productSlug))
        .limit(1);

      if (!product)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });

      // Check if user is a customer (typed Drizzle query — no raw SQL cast)
      const customerRows = await ctx.db
        .select({
          id: customers.id,
          firstName: customers.firstName,
          lastName: customers.lastName,
          email: users.email,
        })
        .from(customers)
        .innerJoin(users, eq(customers.userId, users.id))
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);
      const customer = customerRows[0];

      let customerId: string | null = null;
      let customerName = ctx.session.user.name ?? 'Anonymous';
      let customerEmail = ctx.session.user.email;
      let isVerifiedPurchase = false;

      if (customer) {
        customerId = customer.id;
        customerName =
          [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customerName;
        customerEmail = customer.email;

        // Check if customer purchased this product (typed Drizzle count query)
        const purchaseRows = await ctx.db
          .select({ count: count() })
          .from(lineItems)
          .innerJoin(orders, eq(lineItems.orderId, orders.id))
          .where(
            and(
              eq(orders.customerId, customerId),
              eq(lineItems.productId, product.id),
              sql`${orders.status} NOT IN ('cancelled', 'refunded')`,
            ),
          );
        isVerifiedPurchase = (purchaseRows[0]?.count ?? 0) > 0;
      }

      const [review] = await ctx.db
        .insert(productReviews)
        .values({
          productId: product.id,
          customerId,
          customerName,
          customerEmail,
          rating: input.rating,
          title: input.title,
          body: input.body,
          photoUrls: input.photoUrls,
          isApproved: false, // requires admin approval
          isVerifiedPurchase,
        })
        .returning({ id: productReviews.id });

      return { id: review!.id, pendingApproval: true };
    }),

  /**
   * Admin: list pending reviews.
   */
  pendingList: staffProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: productReviews.id,
        productName: products.name,
        productSlug: products.slug,
        customerName: productReviews.customerName,
        rating: productReviews.rating,
        title: productReviews.title,
        body: productReviews.body,
        isVerifiedPurchase: productReviews.isVerifiedPurchase,
        createdAt: productReviews.createdAt,
      })
      .from(productReviews)
      .leftJoin(products, eq(productReviews.productId, products.id))
      .where(eq(productReviews.isApproved, false))
      .orderBy(desc(productReviews.createdAt));
  }),

  /**
   * Admin: approve a review.
   */
  approve: ownerProcedure
    .input(z.object({ reviewId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(productReviews)
        .set({ isApproved: true, updatedAt: new Date() })
        .where(eq(productReviews.id, input.reviewId));
      return { success: true };
    }),

  /**
   * Admin: reject (delete) a review.
   */
  reject: ownerProcedure
    .input(z.object({ reviewId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(productReviews).where(eq(productReviews.id, input.reviewId));
      return { success: true };
    }),
});
