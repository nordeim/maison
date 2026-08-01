/**
 * Maison — Cart router
 *
 * Public procedures for cart management (anonymous + authenticated).
 * Per PRD §10.1.
 *
 * The addItem mutation accepts a productSlug (not UUID) for convenience —
 * the ProductCard and PDP pass slugs. The router resolves the slug to a
 * productId server-side.
 */

import { TRPCError } from '@trpc/server';
import { eq, and, isNull } from 'drizzle-orm';
import { z } from 'zod';

import { carts, cartItems, products } from '@maison/db';

import { router, publicProcedure } from '../trpc';

export const cartRouter = router({
  /**
   * Get cart contents by cartId.
   */
  get: publicProcedure
    .input(z.object({ cartId: z.uuid().optional() }))
    .query(async ({ input, ctx }) => {
      if (!input.cartId) return null;

      const [cart] = await ctx.db.select().from(carts).where(eq(carts.id, input.cartId)).limit(1);

      if (!cart) return null;

      const items = await ctx.db
        .select({
          id: cartItems.id,
          productId: cartItems.productId,
          variantId: cartItems.variantId,
          quantity: cartItems.quantity,
          productName: products.name,
          productSlug: products.slug,
          priceCents: products.priceCents,
          currency: products.currency,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));

      return { ...cart, items };
    }),

  /**
   * Add item to cart. Creates a cart if none exists.
   * Accepts productSlug (resolved to productId server-side).
   */
  addItem: publicProcedure
    .input(
      z.object({
        cartId: z.uuid().optional(),
        productSlug: z.string().min(1),
        variantId: z.uuid().optional(),
        quantity: z.number().min(1).max(99).default(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Resolve product slug to ID
      const [product] = await ctx.db
        .select({ id: products.id, priceCents: products.priceCents })
        .from(products)
        .where(and(eq(products.slug, input.productSlug), eq(products.isActive, true)))
        .limit(1);

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      // Get or create cart
      let cartId = input.cartId;
      if (!cartId) {
        const [newCart] = await ctx.db
          .insert(carts)
          .values({ currency: 'USD' })
          .returning({ id: carts.id });
        if (!newCart) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create cart',
          });
        }
        cartId = newCart.id;
      }

      // Check if item already exists in cart (same product + variant) — if so, increment quantity
      const [existingItem] = await ctx.db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, cartId),
            eq(cartItems.productId, product.id),
            input.variantId
              ? eq(cartItems.variantId, input.variantId)
              : isNull(cartItems.variantId),
          ),
        )
        .limit(1);

      if (existingItem) {
        await ctx.db
          .update(cartItems)
          .set({ quantity: existingItem.quantity + input.quantity })
          .where(eq(cartItems.id, existingItem.id));
        return { cartId, itemId: existingItem.id };
      }

      // Insert new cart item
      const [item] = await ctx.db
        .insert(cartItems)
        .values({
          cartId,
          productId: product.id,
          variantId: input.variantId,
          quantity: input.quantity,
        })
        .returning({ id: cartItems.id });

      if (!item) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add item to cart',
        });
      }
      return { cartId, itemId: item.id };
    }),

  /**
   * Update item quantity (quantity=0 removes the item).
   */
  updateItem: publicProcedure
    .input(
      z.object({
        cartId: z.uuid(),
        itemId: z.uuid(),
        quantity: z.number().min(0).max(99),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.quantity === 0) {
        await ctx.db
          .delete(cartItems)
          .where(and(eq(cartItems.id, input.itemId), eq(cartItems.cartId, input.cartId)));
      } else {
        await ctx.db
          .update(cartItems)
          .set({ quantity: input.quantity })
          .where(and(eq(cartItems.id, input.itemId), eq(cartItems.cartId, input.cartId)));
      }
      return { success: true };
    }),

  /**
   * Remove item from cart (deletes the row regardless of quantity).
   */
  removeItem: publicProcedure
    .input(
      z.object({
        cartId: z.uuid(),
        itemId: z.uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .delete(cartItems)
        .where(and(eq(cartItems.id, input.itemId), eq(cartItems.cartId, input.cartId)));
      return { success: true };
    }),
});
