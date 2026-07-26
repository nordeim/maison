/**
 * Maison — Admin router (stub — Phase 1)
 *
 * Admin procedures for product, order, customer, inventory management.
 * All procedures require staff or admin role (adminProcedure).
 * Mutation procedures require admin role (adminWriteProcedure).
 */

import { z } from "zod";
import { router, adminProcedure, adminWriteProcedure } from "../trpc";

export const adminRouter = router({
  /**
   * Dashboard overview — KPIs + recent orders.
   */
  overview: adminProcedure.query(async ({ ctx }) => {
    // Phase 1: query today's revenue, order count, AOV, recent orders
    return {
      todayRevenueCents: 0,
      todayOrderCount: 0,
      aovCents: 0,
      conversionRate: 0,
      recentOrders: [] as [],
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
      }),
    )
    .query(async () => {
      // Phase 1: query products with filters
      return { items: [] as [], total: 0 };
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
      // Phase 1: insert product + write audit_log
      console.log("[admin] productsCreate by", ctx.session.user.id, input.name);
      return { id: "stub-product-id" };
    }),

  /**
   * List orders (admin view).
   */
  ordersList: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded", "all"]).default("all"),
      }),
    )
    .query(async () => {
      return { items: [] as [], total: 0 };
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
      console.log("[admin] ordersUpdateStatus", input.orderId, "→", input.status, "by", ctx.session.user.id);
      return { success: true };
    }),
});
