/**
 * Maison — Account router (stub — Phase 1)
 *
 * Protected procedures for customer account management.
 * Full implementation in Phase 1.
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const accountRouter = router({
  /**
   * Get current customer's profile.
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // Phase 1: query customers table by ctx.session.user.id
    return {
      id: ctx.session.user.id,
      email: ctx.session.user.email,
      name: ctx.session.user.name,
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
      // Phase 1: update customers table
      console.log("[account] updateProfile for", ctx.session.user.id, input);
      return { success: true };
    }),

  /**
   * List orders (paginated).
   */
  listOrders: protectedProcedure
    .input(z.object({ cursor: z.string().optional() }))
    .query(async ({ ctx }) => {
      // Phase 1: query orders where customerId = ctx.session.user.customerId
      return { items: [] as [], nextCursor: undefined };
    }),

  /**
   * List wishlist items.
   */
  listWishlist: protectedProcedure.query(async () => {
    // Phase 1: query wishlist_items
    return { items: [] as [] };
  }),
});
