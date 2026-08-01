/**
 * Maison — Discounts router
 *
 * Public procedure for validating discount codes.
 * Admin procedures for CRUD (admin role only).
 *
 * Per PRD §4.4 (CK-006: Promo/discount code application).
 */

import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

import { discounts } from '@maison/db';

import { router, publicProcedure, staffProcedure, ownerProcedure } from '../trpc';

export const discountsRouter = router({
  /**
   * Validate a discount code (public — called from checkout).
   * Returns the discount details if valid, null if invalid/expired/over-used.
   */
  validate: publicProcedure
    .input(
      z.object({
        code: z.string().min(1).max(50),
        subtotalCents: z.number().int().positive(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const code = input.code.toUpperCase().trim();

      const [discount] = await ctx.db
        .select()
        .from(discounts)
        .where(and(eq(discounts.code, code), eq(discounts.isActive, true)))
        .limit(1);

      if (!discount) {
        return { valid: false, error: 'Invalid discount code.' } as const;
      }

      // Check date range
      const now = new Date();
      if (discount.startsAt && now < discount.startsAt) {
        return {
          valid: false,
          error: 'This discount code is not yet active.',
        } as const;
      }
      if (discount.endsAt && now > discount.endsAt) {
        return {
          valid: false,
          error: 'This discount code has expired.',
        } as const;
      }

      // Check usage limit
      if (discount.maxUses !== null && discount.usesCount >= discount.maxUses) {
        return {
          valid: false,
          error: 'This discount code has reached its usage limit.',
        } as const;
      }

      // Check minimum order
      if (discount.minOrderCents > 0 && input.subtotalCents < discount.minOrderCents) {
        const minFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(discount.minOrderCents / 100);
        return {
          valid: false,
          error: `This discount requires a minimum order of ${minFormatted}.`,
        } as const;
      }

      // Calculate discount amount
      let discountAmountCents = 0;
      let freeShipping = false;

      switch (discount.type) {
        case 'percentage':
          discountAmountCents = Math.round(input.subtotalCents * (discount.value / 100));
          break;
        case 'fixed':
          discountAmountCents = Math.min(discount.value, input.subtotalCents);
          break;
        case 'free_shipping':
          freeShipping = true;
          break;
      }

      return {
        valid: true,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmountCents,
        freeShipping,
        minOrderCents: discount.minOrderCents,
      } as const;
    }),

  /**
   * List all discounts (admin only).
   */
  list: staffProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(discounts)
      .orderBy(sql`${discounts.createdAt} DESC`);
  }),

  /**
   * Create a discount (admin only).
   */
  create: ownerProcedure
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
      return { id: discount!.id };
    }),

  /**
   * Deactivate a discount (admin only — soft delete).
   */
  deactivate: ownerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.update(discounts).set({ isActive: false }).where(eq(discounts.id, input.id));
      return { success: true };
    }),
});
