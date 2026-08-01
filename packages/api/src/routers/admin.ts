/**
 * Maison — Admin router
 *
 * Admin procedures for product, order, customer, inventory management.
 * Read procedures require staff/manager/owner role (staffProcedure — ADR-008).
 * Mutation procedures require owner role (ownerProcedure — ADR-008).
 */

import { eq, desc, asc, and, ilike, sql, count } from 'drizzle-orm';
import { z } from 'zod';

import {
  products,
  productVariants,
  collections,
  orders,
  lineItems,
  customers,
  users,
  auditLog,
  discounts,
  cartItems,
} from '@maison/db';

import { router, staffProcedure, ownerProcedure } from '../trpc';

export const adminRouter = router({
  /**
   * Dashboard overview — KPIs + recent orders.
   */
  overview: staffProcedure.query(async ({ ctx }) => {
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
  productsList: staffProcedure
    .input(
      z.object({
        search: z.string().optional(),
        collection: z.string().optional(),
        status: z.enum(['active', 'inactive', 'all']).default('all'),
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
      if (input.status === 'active') {
        conditions.push(eq(products.isActive, true));
      } else if (input.status === 'inactive') {
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
  productsCreate: ownerProcedure
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
      const [product] = await ctx.db.insert(products).values(input).returning({ id: products.id });

      // Write audit log
      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: 'product.create',
        entityType: 'product',
        entityId: product!.id,
        diff: input,
      });

      return { id: product!.id };
    }),

  /**
   * Update product (admin only).
   */
  productsUpdate: ownerProcedure
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
      const [_product] = await ctx.db
        .update(products)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning({ id: products.id });

      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: 'product.update',
        entityType: 'product',
        entityId: id,
        diff: updates,
      });

      return { success: true };
    }),

  /**
   * List orders (admin view).
   */
  ordersList: staffProcedure
    .input(
      z.object({
        status: z
          .enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded', 'all'])
          .default('all'),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input, ctx }) => {
      const whereClause = input.status === 'all' ? undefined : eq(orders.status, input.status);

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
  ordersUpdateStatus: ownerProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        status: z.enum(['confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']),
        trackingNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updates: Record<string, unknown> = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.status === 'shipped') {
        updates.shippedAt = new Date();
        if (input.trackingNumber) {
          updates.trackingNumber = input.trackingNumber;
        }
      }
      if (input.status === 'delivered') {
        updates.deliveredAt = new Date();
      }

      await ctx.db.update(orders).set(updates).where(eq(orders.id, input.orderId));

      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: 'order.update_status',
        entityType: 'order',
        entityId: input.orderId,
        diff: { status: input.status, trackingNumber: input.trackingNumber },
      });

      return { success: true };
    }),

  /**
   * List customers (admin view).
   */
  customersList: staffProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input, ctx }) => {
      const conditions = [];
      if (input.search) {
        conditions.push(ilike(users.email, `%${input.search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Shape at the router boundary — `users.email` is nullable in the Better
      // Auth schema, so the left join yields `string | null`. Coerce to a
      // non-null string for the admin customer list contract.
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

      return {
        items: items.map((row) => ({ ...row, email: row.email ?? '' })),
        total: items.length,
      };
    }),

  /**
   * List inventory (all variants with stock levels).
   */
  inventoryList: staffProcedure
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
  inventoryUpdate: ownerProcedure
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
        action: 'inventory.restock',
        entityType: 'variant',
        entityId: input.variantId,
        diff: { stockQuantity: input.stockQuantity },
      });

      return { success: true };
    }),

  /**
   * List all discount codes (admin only).
   */
  discountsList: staffProcedure.query(async ({ ctx }) => {
    const allDiscounts = await ctx.db.select().from(discounts).orderBy(desc(discounts.createdAt));

    return allDiscounts;
  }),

  /**
   * Create a discount code (admin only).
   */
  discountsCreate: ownerProcedure
    .input(
      z.object({
        code: z
          .string()
          .min(1)
          .max(50)
          .transform((s) => s.toUpperCase().trim()),
        type: z.enum(['percentage', 'fixed', 'free_shipping']),
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
        action: 'discount.create',
        entityType: 'discount',
        entityId: discount!.id,
        diff: input,
      });

      return { id: discount!.id };
    }),

  /**
   * Deactivate a discount (admin only — soft delete).
   */
  discountsDeactivate: ownerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.update(discounts).set({ isActive: false }).where(eq(discounts.id, input.id));

      await ctx.db.insert(auditLog).values({
        actorUserId: ctx.session.user.id,
        action: 'discount.deactivate',
        entityType: 'discount',
        entityId: input.id,
      });

      return { success: true };
    }),

  /**
   * Analytics: revenue over time (last 30 days, grouped by day).
   */
  analyticsRevenue: staffProcedure
    .input(z.object({ days: z.number().min(1).max(365).default(30) }))
    .query(async ({ input, ctx }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);

      // Raw SQL aggregation (GROUP BY + SUM). Drizzle's `db.execute()` returns
      // `{ rows: Record<string, unknown>[] }` — map each row through typed
      // accessors to avoid `as unknown as` cast (Skill 2 §9.2).
      const result = await ctx.db.execute(sql`
        SELECT
          DATE(${orders.placedAt}) as date,
          COUNT(*) as order_count,
          SUM(${orders.totalCents}) as revenue_cents
        FROM ${orders}
        WHERE ${orders.placedAt} >= ${daysAgo}
          AND ${orders.status} NOT IN ('cancelled', 'refunded')
        GROUP BY DATE(${orders.placedAt})
        ORDER BY DATE(${orders.placedAt})
      `);
      const rows = (result?.rows ?? []).map((row) => ({
        date: String(row.date ?? ''),
        order_count: Number(row.order_count ?? 0),
        revenue_cents: Number(row.revenue_cents ?? 0),
      }));

      return rows.map((row) => ({
        date: row.date,
        orderCount: row.order_count,
        revenueCents: row.revenue_cents,
      }));
    }),

  /**
   * Analytics: top products by revenue.
   */
  analyticsTopProducts: staffProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.execute(sql`
        SELECT
          ${products.name} as product_name,
          ${products.slug} as product_slug,
          SUM(${lineItems.quantity}) as units_sold,
          SUM(${lineItems.quantity} * ${lineItems.priceCents}) as revenue_cents
        FROM ${lineItems}
        JOIN ${orders} ON ${lineItems.orderId} = ${orders.id}
        JOIN ${products} ON ${lineItems.productId} = ${products.id}
        WHERE ${orders.status} NOT IN ('cancelled', 'refunded')
        GROUP BY ${products.id}, ${products.name}, ${products.slug}
        ORDER BY revenue_cents DESC
        LIMIT ${input.limit}
      `);
      const rows = (result?.rows ?? []).map((row) => ({
        product_name: String(row.product_name ?? ''),
        product_slug: String(row.product_slug ?? ''),
        units_sold: Number(row.units_sold ?? 0),
        revenue_cents: Number(row.revenue_cents ?? 0),
      }));

      return rows.map((row) => ({
        productName: row.product_name,
        productSlug: row.product_slug,
        unitsSold: row.units_sold,
        revenueCents: row.revenue_cents,
      }));
    }),

  /**
   * Analytics: conversion funnel (views, carts, checkouts, purchases).
   * Phase 3: views/carts are approximated from PostHog events (stub).
   */
  analyticsFunnel: staffProcedure.query(async ({ ctx }) => {
    const totalOrders = await ctx.db
      .select({ count: count() })
      .from(orders)
      .where(sql`${orders.status} NOT IN ('cancelled', 'refunded')`);

    const totalCarts = await ctx.db.select({ count: count() }).from(cartItems);

    return {
      productViews: 0, // Phase 3.1: PostHog integration
      cartAdds: totalCarts[0]?.count ?? 0,
      checkouts: totalOrders[0]?.count ?? 0,
      purchases: totalOrders[0]?.count ?? 0,
    };
  }),

  /**
   * Analytics: customer cohorts (signup month + retention).
   * Phase 3: simplified — returns new customers per month.
   */
  analyticsCohorts: staffProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.execute(sql`
      SELECT
        DATE_TRUNC('month', ${customers.createdAt}) as cohort_month,
        COUNT(*) as new_customers
      FROM ${customers}
      GROUP BY DATE_TRUNC('month', ${customers.createdAt})
      ORDER BY cohort_month DESC
      LIMIT 12
    `);
    const rows = (result?.rows ?? []).map((row) => ({
      cohort_month: String(row.cohort_month ?? ''),
      new_customers: Number(row.new_customers ?? 0),
    }));

    return rows.map((row) => ({
      cohortMonth: row.cohort_month,
      newCustomers: row.new_customers,
    }));
  }),
});
