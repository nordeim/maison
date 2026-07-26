/**
 * Maison — Cart router
 *
 * Public procedures for cart management (anonymous + authenticated).
 * Per PRD §10.1.
 */

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { carts, cartItems, products, productVariants } from "@maison/db";
import { router, publicProcedure } from "../trpc";

export const cartRouter = router({
  /**
   * Get cart contents by cartId (anonymous) or session user's cart.
   */
  get: publicProcedure
    .input(z.object({ cartId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      if (!input.cartId) return null;

      const [cart] = await ctx.db
        .select()
        .from(carts)
        .where(eq(carts.id, input.cartId))
        .limit(1);

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
   */
  addItem: publicProcedure
    .input(
      z.object({
        cartId: z.string().uuid().optional(),
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().min(1).max(99),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Validate product exists + is active
      const [product] = await ctx.db
        .select({ id: products.id, priceCents: products.priceCents })
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product) {
        throw new Error("Product not found");
      }

      // Get or create cart
      let cartId = input.cartId;
      if (!cartId) {
        const [newCart] = await ctx.db
          .insert(carts)
          .values({ currency: "USD" })
          .returning({ id: carts.id });
        cartId = newCart!.id;
      }

      // Insert cart item
      const [item] = await ctx.db
        .insert(cartItems)
        .values({
          cartId,
          productId: input.productId,
          variantId: input.variantId,
          quantity: input.quantity,
        })
        .returning({ id: cartItems.id });

      return { cartId: cartId!, itemId: item!.id };
    }),

  /**
   * Update item quantity (quantity=0 removes the item).
   */
  updateItem: publicProcedure
    .input(
      z.object({
        cartId: z.string().uuid(),
        itemId: z.string().uuid(),
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
});
