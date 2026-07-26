/**
 * Maison — Admin router
 *
 * Admin procedures for product, order, customer, inventory management.
 * Read procedures require staff or admin role (adminProcedure).
 * Mutation procedures require admin role (adminWriteProcedure).
 */

import { z } from "zod";
import { eq, desc, asc, and, ilike, sql, count } from "drizzle-orm";
import {
  products,
  productVariants,
  productImages,
  collections,
  orders,
  lineItems,
  customers,
  users,
  auditLog,
  discounts,
} from "@maison/db";
import { router, adminProcedure, adminWriteProcedure } from "../trpc";

export const adminRouter = router({
  /**
   * Dashboard overview — KPIs + recent orders.
   */
  overview: adminProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's orders
    const todayOrders = await ctx.db
      .select({
        count: count(),
        revenue: sql<number>`sum(${orders.totalCents})`,
      })
      .from(orders)
      .where(and(sql`${orders.placedAt} >= ${today}`, sql`${orders.status} != 'cancelled'`));

    const todayOrderCount = todayOrders[0]?.count ?? 0;
    const todayRevenueCents = todayOrders[0]?.revenue ?? 0;

    // All-time AOV
    const allOrders = await ctx.db
      .select({
        count: count(),
        revenue: sql<number>`sum(${orders.totalCents})`,
      })
      .from(orders)
      .where(sql`${orders.status} != 'cancelled'`);

    const allOrderCount = allOrders[0]?.count ?? 0;
    const allRevenueCents = allOrders[0]?.revenue ?? 0;
    const aovCents = allOrderCount > 0 ? Math.round(allRevenueCents / allOrderCount) : 0;

    // Recent orders
    const recentOrders = await ctx.db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        email: orders.email,
        status: orders.status,
        totalCents: orders.totalCents,
        placedAt: orders.placedAt,
      })
      .from(orders)
      .orderBy(desc(orders.placedAt))
      .limit(10);

    // Low stock variants
    const lowStockVariants = await ctx.db
      .select({
        id: productVariants.id,
        sku: productVariants.sku,
        name: productVariants.name,
        stockQuantity: productVariants.stockQuantity,
        productName: products.name,
      })
      .from(productVariants)
      .leftJoin(products, eq(productVariants.productId, products.id))
      .where(sql`${productVariants.stockQuantity} < 5`)
      .limit(5);

    return {
      todayRevenueCents,
      todayOrderCount,
      aovCents,
      conversionRate: 0, // Phase 2: requires analytics integration
      allTimeRevenueCents: allRevenueCents,
      allTimeOrderCount: allOrderCount,
      recentOrders,
      lowStockVariants,
    };
  }),

  /**
   * List products (admin view — includes inactive).
   */
  productsList: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        collection: z.string().optional(),
        status: z.enum(["active", "inactive", "all"]).default("all"),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input, ctx }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(ilike(products.name, `%${input.search}%`));
      }
      if (input.collection) {
        conditions.push(eq(collections.slug, input.collection));
      }
      if (input.status === "active") {
        conditions.push(eq(products.isActive, true));
      } else if (input.status === "inactive") {
        conditions.push(eq(products.isActive, false));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = whereClause
        ? await ctx.db
            .select({
              id: products.id,
              slug: products.slug,
              name: products.name,
              priceCents: products.priceCents,
              isActive: products.isActive,
              featured: products.featured,
              isNew: products.isNew,
              isBestseller: products.isBestseller,
              collectionName: collections.name,
              createdAt: products.createdAt,
            })
            .from(products)
            .leftJoin(collections, eq(products.collectionId, collections.id))
            .where(whereClause)
            .orderBy(desc(products.createdAt))
            .limit(input.limit)
        : await ctx.db
            .select({
              id: products.id,
              slug: products.slug,
              name: products.name,
              priceCents: products.priceCents,
              isActive: products.isActive,
              featured: products.featured,
              isNew: products.isNew,
              isBestseller: products.isBestseller,
              collectionName: collections.name,
              createdAt: products.createdAt,
            })
            .from(products)
            .leftJoin(collections, eq(products.collectionId, collections.id))
            .orderBy(desc(products.createdAt))
            .limit(input.limit);

      return { items, total: items.length };
    }),

  /**
   * Create product (admin only).
   */
  productsCreate: adminWriteProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        priceCents: z.number().int().positive(),
        collectionId: z.string().uuid().optional(),
        shortDescription: z.string().optional(),
        longDescription: z.string().optional(),
        materials: z.string().optional(),
        dimensions: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [product] = await ctx.db
        .insert(products)
        .values(input)
        .returning({ id: products.id });

      // Write audit log
      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: "product.create",
        entityType: "product",
        entityId: product!.id,
        diff: input,
      });

      return { id: product!.id };
    }),

  /**
   * Update product (admin only).
   */
  productsUpdate: adminWriteProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        priceCents: z.number().int().positive().optional(),
        shortDescription: z.string().optional(),
        isActive: z.boolean().optional(),
        featured: z.boolean().optional(),
        isNew: z.boolean().optional(),
        isBestseller: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      const [product] = await ctx.db
        .update(products)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning({ id: products.id });

      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: "product.update",
        entityType: "product",
        entityId: id,
        diff: updates,
      });

      return { success: true };
    }),

  /**
   * List orders (admin view).
   */
  ordersList: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded", "all"]).default("all"),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input, ctx }) => {
      const whereClause = input.status === "all" ? undefined : eq(orders.status, input.status);

      const items = whereClause
        ? await ctx.db
            .select({
              id: orders.id,
              orderNumber: orders.orderNumber,
              email: orders.email,
              status: orders.status,
              totalCents: orders.totalCents,
              placedAt: orders.placedAt,
              shippedAt: orders.shippedAt,
            })
            .from(orders)
            .where(whereClause)
            .orderBy(desc(orders.placedAt))
            .limit(input.limit)
        : await ctx.db
            .select({
              id: orders.id,
              orderNumber: orders.orderNumber,
              email: orders.email,
              status: orders.status,
              totalCents: orders.totalCents,
              placedAt: orders.placedAt,
              shippedAt: orders.shippedAt,
            })
            .from(orders)
            .orderBy(desc(orders.placedAt))
            .limit(input.limit);

      return { items, total: items.length };
    }),

  /**
   * Update order status (admin only — fulfillment actions).
   */
  ordersUpdateStatus: adminWriteProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        status: z.enum(["confirmed", "shipped", "delivered", "cancelled", "refunded"]),
        trackingNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updates: Record<string, unknown> = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.status === "shipped") {
        updates.shippedAt = new Date();
        if (input.trackingNumber) {
          updates.trackingNumber = input.trackingNumber;
        }
      }
      if (input.status === "delivered") {
        updates.deliveredAt = new Date();
      }

      await ctx.db
        .update(orders)
        .set(updates)
        .where(eq(orders.id, input.orderId));

      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: "order.update_status",
        entityType: "order",
        entityId: input.orderId,
        diff: { status: input.status, trackingNumber: input.trackingNumber },
      });

      return { success: true };
    }),

  /**
   * List customers (admin view).
   */
  customersList: adminProcedure
    .input(z.object({ search: z.string().optional(), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input, ctx }) => {
      const conditions = [];
      if (input.search) {
        conditions.push(ilike(users.email, `%${input.search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = whereClause
        ? await ctx.db
            .select({
              id: customers.id,
              userId: customers.userId,
              email: users.email,
              firstName: customers.firstName,
              lastName: customers.lastName,
              newsletterSubscribed: customers.newsletterSubscribed,
              createdAt: customers.createdAt,
            })
            .from(customers)
            .leftJoin(users, eq(customers.userId, users.id))
            .where(whereClause)
            .orderBy(desc(customers.createdAt))
            .limit(input.limit)
        : await ctx.db
            .select({
              id: customers.id,
              userId: customers.userId,
              email: users.email,
              firstName: customers.firstName,
              lastName: customers.lastName,
              newsletterSubscribed: customers.newsletterSubscribed,
              createdAt: customers.createdAt,
            })
            .from(customers)
            .leftJoin(users, eq(customers.userId, users.id))
            .orderBy(desc(customers.createdAt))
            .limit(input.limit);

      return { items, total: items.length };
    }),

  /**
   * List inventory (all variants with stock levels).
   */
  inventoryList: adminProcedure
    .input(z.object({ lowStockOnly: z.boolean().default(false) }))
    .query(async ({ input, ctx }) => {
      const whereClause = input.lowStockOnly
        ? sql`${productVariants.stockQuantity} < 5`
        : undefined;

      const items = whereClause
        ? await ctx.db
            .select({
              id: productVariants.id,
              sku: productVariants.sku,
              name: productVariants.name,
              stockQuantity: productVariants.stockQuantity,
              leadTimeDays: productVariants.leadTimeDays,
              productName: products.name,
              productSlug: products.slug,
            })
            .from(productVariants)
            .leftJoin(products, eq(productVariants.productId, products.id))
            .where(whereClause)
            .orderBy(asc(productVariants.stockQuantity))
        : await ctx.db
            .select({
              id: productVariants.id,
              sku: productVariants.sku,
              name: productVariants.name,
              stockQuantity: productVariants.stockQuantity,
              leadTimeDays: productVariants.leadTimeDays,
              productName: products.name,
              productSlug: products.slug,
            })
            .from(productVariants)
            .leftJoin(products, eq(productVariants.productId, products.id))
            .orderBy(asc(productVariants.stockQuantity));

      return { items, total: items.length };
    }),

  /**
   * Update inventory (restock a variant).
   */
  inventoryUpdate: adminWriteProcedure
    .input(
      z.object({
        variantId: z.string().uuid(),
        stockQuantity: z.number().int().min(0),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(productVariants)
        .set({ stockQuantity: input.stockQuantity })
        .where(eq(productVariants.id, input.variantId));

      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: "inventory.restock",
        entityType: "variant",
        entityId: input.variantId,
        diff: { stockQuantity: input.stockQuantity },
      });

      return { success: true };
    }),

  /**
   * List all discount codes (admin only).
   */
  discountsList: adminProcedure.query(async ({ ctx }) => {
    const allDiscounts = await ctx.db
      .select()
      .from(discounts)
      .orderBy(desc(discounts.createdAt));

    return allDiscounts;
  }),

  /**
   * Create a discount code (admin only).
   */
  discountsCreate: adminWriteProcedure
    .input(
      z.object({
        code: z.string().min(1).max(50).transform((s) => s.toUpperCase().trim()),
        type: z.enum(["percentage", "fixed", "free_shipping"]),
        value: z.number().int().min(0),
        minOrderCents: z.number().int().min(0).default(0),
        maxUses: z.number().int().positive().nullable().optional(),
        startsAt: z.string().datetime().optional(),
        endsAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [discount] = await ctx.db
        .insert(discounts)
        .values({
          code: input.code,
          type: input.type,
          value: input.value,
          minOrderCents: input.minOrderCents,
          maxUses: input.maxUses ?? null,
          startsAt: input.startsAt ? new Date(input.startsAt) : null,
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
          isActive: true,
        })
        .returning({ id: discounts.id });

      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: "discount.create",
        entityType: "discount",
        entityId: discount!.id,
        diff: input,
      });

      return { id: discount!.id };
    }),

  /**
   * Deactivate a discount (admin only — soft delete).
   */
  discountsDeactivate: adminWriteProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(discounts)
        .set({ isActive: false })
        .where(eq(discounts.id, input.id));

      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: "discount.deactivate",
        entityType: "discount",
        entityId: input.id,
      });

      return { success: true };
    }),
});
