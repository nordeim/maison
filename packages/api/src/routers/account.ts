/**
 * Maison — Account router
 *
 * Protected procedures for customer account management.
 * Real implementation with DB queries (not stubs).
 */

import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import {
  customers,
  orders,
  lineItems,
  wishlistItems,
  products,
  productImages,
  addresses,
} from "@maison/db";
import { router, protectedProcedure } from "../trpc";

export const accountRouter = router({
  /**
   * Get current customer's profile.
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [customer] = await ctx.db
      .select()
      .from(customers)
      .where(eq(customers.userId, ctx.session.user.id))
      .limit(1);

    return {
      id: ctx.session.user.id,
      email: ctx.session.user.email,
      name: ctx.session.user.name,
      firstName: customer?.firstName ?? null,
      lastName: customer?.lastName ?? null,
      phone: customer?.phone ?? null,
      newsletterSubscribed: customer?.newsletterSubscribed ?? false,
    };
  }),

  /**
   * Update profile (firstName, lastName, phone).
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(50).optional(),
        lastName: z.string().min(1).max(50).optional(),
        phone: z.string().max(30).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Get or create customer record
      const [existing] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);

      if (existing) {
        await ctx.db
          .update(customers)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(customers.id, existing.id));
      } else {
        await ctx.db.insert(customers).values({
          userId: ctx.session.user.id,
          ...input,
        });
      }

      return { success: true };
    }),

  /**
   * List orders (most recent first).
   */
  listOrders: protectedProcedure.query(async ({ ctx }) => {
    // Get customer record
    const [customer] = await ctx.db
      .select()
      .from(customers)
      .where(eq(customers.userId, ctx.session.user.id))
      .limit(1);

    if (!customer) return { items: [] };

    const customerOrders = await ctx.db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalCents: orders.totalCents,
        currency: orders.currency,
        placedAt: orders.placedAt,
        itemCount: lineItems.id,
      })
      .from(orders)
      .leftJoin(lineItems, eq(orders.id, lineItems.orderId))
      .where(eq(orders.customerId, customer.id))
      .orderBy(desc(orders.placedAt));

    // Group by order (the join produces multiple rows per order)
    const orderMap = new Map<string, {
      id: string;
      orderNumber: string;
      status: string;
      totalCents: number;
      currency: string;
      placedAt: Date | null;
      itemCount: number;
    }>();

    for (const row of customerOrders) {
      if (!row.id) continue;
      const existing = orderMap.get(row.id);
      if (existing) {
        existing.itemCount += 1;
      } else {
        orderMap.set(row.id, {
          id: row.id,
          orderNumber: row.orderNumber,
          status: row.status,
          totalCents: row.totalCents,
          currency: row.currency,
          placedAt: row.placedAt,
          itemCount: 1,
        });
      }
    }

    return { items: Array.from(orderMap.values()) };
  }),

  /**
   * Get a single order's details (with line items).
   */
  getOrder: protectedProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);

      if (!customer) return null;

      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(and(eq(orders.orderNumber, input.orderNumber), eq(orders.customerId, customer.id)))
        .limit(1);

      if (!order) return null;

      const items = await ctx.db
        .select()
        .from(lineItems)
        .where(eq(lineItems.orderId, order.id));

      return { ...order, items };
    }),

  /**
   * List wishlist items (with product details).
   */
  listWishlist: protectedProcedure.query(async ({ ctx }) => {
    const [customer] = await ctx.db
      .select()
      .from(customers)
      .where(eq(customers.userId, ctx.session.user.id))
      .limit(1);

    if (!customer) return { items: [] };

    const wishlist = await ctx.db
      .select({
        id: wishlistItems.id,
        productId: wishlistItems.productId,
        createdAt: wishlistItems.createdAt,
        slug: products.slug,
        name: products.name,
        priceCents: products.priceCents,
        currency: products.currency,
        shortDescription: products.shortDescription,
        materials: products.materials,
        primaryImage: productImages.url,
        collectionName: products.slug, // Simplified — join collections in Phase 1.1
        featured: products.featured,
        isNew: products.isNew,
        isBestseller: products.isBestseller,
      })
      .from(wishlistItems)
      .leftJoin(products, eq(wishlistItems.productId, products.id))
      .leftJoin(
        productImages,
        and(eq(productImages.productId, products.id), eq(productImages.sortOrder, 0)),
      )
      .where(and(eq(wishlistItems.customerId, customer.id), eq(products.isActive, true)))
      .orderBy(desc(wishlistItems.createdAt));

    return { items: wishlist };
  }),

  /**
   * Toggle product in wishlist (add if not present, remove if present).
   */
  toggleWishlist: protectedProcedure
    .input(z.object({ productSlug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);

      if (!customer) {
        // Create customer record if it doesn't exist
        const [newCustomer] = await ctx.db
          .insert(customers)
          .values({ userId: ctx.session.user.id })
          .returning({ id: customers.id });
        if (!newCustomer) return { isWishlisted: false };
        return toggleWishlistInternal(ctx.db, newCustomer.id, input.productSlug);
      }

      return toggleWishlistInternal(ctx.db, customer.id, input.productSlug);
    }),

  /**
   * List saved addresses.
   */
  listAddresses: protectedProcedure.query(async ({ ctx }) => {
    const [customer] = await ctx.db
      .select()
      .from(customers)
      .where(eq(customers.userId, ctx.session.user.id))
      .limit(1);

    if (!customer) return { items: [] };

    const customerAddresses = await ctx.db
      .select()
      .from(addresses)
      .where(eq(addresses.customerId, customer.id));

    return { items: customerAddresses };
  }),

  /**
   * Create or update an address.
   * If addressId is provided, updates; otherwise creates.
   */
  upsertAddress: protectedProcedure
    .input(
      z.object({
        addressId: z.string().uuid().optional(),
        label: z.string().max(50).optional(),
        line1: z.string().min(1),
        line2: z.string().optional(),
        city: z.string().min(1),
        region: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().min(2).max(2),
        isDefaultShipping: z.boolean().default(false),
        isDefaultBilling: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);

      if (!customer) {
        // Create customer record if missing
        const [newCustomer] = await ctx.db
          .insert(customers)
          .values({ userId: ctx.session.user.id })
          .returning({ id: customers.id });
        if (!newCustomer) throw new Error("Failed to create customer record");

        // If setting as default, unset other defaults first
        if (input.isDefaultShipping || input.isDefaultBilling) {
          await ctx.db
            .update(addresses)
            .set({
              isDefaultShipping: input.isDefaultShipping ? false : undefined,
              isDefaultBilling: input.isDefaultBilling ? false : undefined,
            })
            .where(eq(addresses.customerId, newCustomer.id));
        }

        const [addr] = await ctx.db
          .insert(addresses)
          .values({
            customerId: newCustomer.id,
            ...input,
          })
          .returning({ id: addresses.id });
        return { id: addr!.id };
      }

      // If setting as default, unset other defaults first
      if (input.isDefaultShipping || input.isDefaultBilling) {
        await ctx.db
          .update(addresses)
          .set({
            isDefaultShipping: input.isDefaultShipping ? false : undefined,
            isDefaultBilling: input.isDefaultBilling ? false : undefined,
          })
          .where(eq(addresses.customerId, customer.id));
      }

      if (input.addressId) {
        await ctx.db
          .update(addresses)
          .set({
            label: input.label,
            line1: input.line1,
            line2: input.line2,
            city: input.city,
            region: input.region,
            postalCode: input.postalCode,
            country: input.country,
            isDefaultShipping: input.isDefaultShipping,
            isDefaultBilling: input.isDefaultBilling,
          })
          .where(and(eq(addresses.id, input.addressId), eq(addresses.customerId, customer.id)));
        return { id: input.addressId };
      }

      const [addr] = await ctx.db
        .insert(addresses)
        .values({
          customerId: customer.id,
          ...input,
        })
        .returning({ id: addresses.id });
      return { id: addr!.id };
    }),

  /**
   * Delete an address.
   */
  deleteAddress: protectedProcedure
    .input(z.object({ addressId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);

      if (!customer) return { success: true };

      await ctx.db
        .delete(addresses)
        .where(and(eq(addresses.id, input.addressId), eq(addresses.customerId, customer.id)));

      return { success: true };
    }),

  /**
   * Update newsletter subscription preference.
   */
  updateNewsletter: protectedProcedure
    .input(z.object({ subscribed: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);

      if (customer) {
        await ctx.db
          .update(customers)
          .set({ newsletterSubscribed: input.subscribed, updatedAt: new Date() })
          .where(eq(customers.id, customer.id));
      } else {
        await ctx.db.insert(customers).values({
          userId: ctx.session.user.id,
          newsletterSubscribed: input.subscribed,
        });
      }

      return { success: true };
    }),
});

/**
 * Helper: toggle wishlist item for a customer.
 */
async function toggleWishlistInternal(
  db: Parameters<Parameters<typeof router>[0]["query"]>[0]["ctx"]["db"],
  customerId: string,
  productSlug: string,
): Promise<{ isWishlisted: boolean }> {
  // Find product by slug
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, productSlug))
    .limit(1);

  if (!product) throw new Error("Product not found");

  // Check if already in wishlist
  const [existing] = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.customerId, customerId), eq(wishlistItems.productId, product.id)))
    .limit(1);

  if (existing) {
    await db
      .delete(wishlistItems)
      .where(eq(wishlistItems.id, existing.id));
    return { isWishlisted: false };
  }

  await db.insert(wishlistItems).values({
    customerId,
    productId: product.id,
  });

  return { isWishlisted: true };
}
