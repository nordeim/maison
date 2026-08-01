/**
 * Maison — Gift cards router
 *
 * Public: validate a gift card code (for checkout redemption).
 * Protected: purchase a gift card, list owned gift cards.
 * Admin: list all gift cards.
 */

import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

import { giftCards, customers } from '@maison/db';

import { router, publicProcedure, protectedProcedure, staffProcedure } from '../trpc';

/**
 * Generate a unique gift card code: MAIS-GC-XXXX-XXXX
 */
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MAIS-GC-${part()}-${part()}`;
}

export const giftCardsRouter = router({
  /**
   * Validate a gift card code (public — called from checkout).
   * Returns the current balance if valid.
   */
  validate: publicProcedure
    .input(z.object({ code: z.string().min(1).max(50) }))
    .query(async ({ input, ctx }) => {
      const code = input.code.toUpperCase().trim();

      const [card] = await ctx.db
        .select()
        .from(giftCards)
        .where(and(eq(giftCards.code, code), eq(giftCards.isActive, true)))
        .limit(1);

      if (!card) {
        return { valid: false, error: 'Invalid gift card code.' } as const;
      }

      // Check expiry
      if (card.expiresAt && new Date() > card.expiresAt) {
        return { valid: false, error: 'This gift card has expired.' } as const;
      }

      // Check balance
      if (card.balanceCents <= 0) {
        return {
          valid: false,
          error: 'This gift card has no remaining balance.',
        } as const;
      }

      return {
        valid: true,
        code: card.code,
        balanceCents: card.balanceCents,
        currency: card.currency,
      } as const;
    }),

  /**
   * Purchase a gift card (authenticated users).
   * Creates a gift card record — the actual charge happens via checkout.
   */
  purchase: protectedProcedure
    .input(
      z.object({
        amountCents: z.number().int().min(2500).max(100000), // $25–$1000
        recipientEmail: z.email(),
        recipientName: z.string().min(1).max(100).optional(),
        message: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Get or create customer
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);

      let customerId = customer?.id ?? null;
      if (!customerId) {
        const [newCustomer] = await ctx.db
          .insert(customers)
          .values({ userId: ctx.session.user.id })
          .returning({ id: customers.id });
        customerId = newCustomer!.id;
      }

      // Generate unique code (retry if collision)
      let code = generateGiftCardCode();
      for (let i = 0; i < 5; i++) {
        const [existing] = await ctx.db
          .select({ id: giftCards.id })
          .from(giftCards)
          .where(eq(giftCards.code, code))
          .limit(1);
        if (!existing) break;
        code = generateGiftCardCode();
      }

      const [card] = await ctx.db
        .insert(giftCards)
        .values({
          code,
          initialBalanceCents: input.amountCents,
          balanceCents: input.amountCents,
          currency: 'USD',
          purchaserCustomerId: customerId,
          purchaserEmail: ctx.session.user.email,
          recipientEmail: input.recipientEmail,
          recipientName: input.recipientName,
          message: input.message,
          isActive: false, // activated after payment confirmed
        })
        .returning({ id: giftCards.id, code: giftCards.code });

      return { id: card!.id, code: card!.code };
    }),

  /**
   * List gift cards owned by the current user.
   */
  listMine: protectedProcedure.query(async ({ ctx }) => {
    const [customer] = await ctx.db
      .select()
      .from(customers)
      .where(eq(customers.userId, ctx.session.user.id))
      .limit(1);

    if (!customer) return { items: [] };

    const cards = await ctx.db
      .select()
      .from(giftCards)
      .where(eq(giftCards.purchaserCustomerId, customer.id))
      .orderBy(desc(giftCards.createdAt));

    return { items: cards };
  }),

  /**
   * Admin: list all gift cards.
   */
  listAll: staffProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(giftCards).orderBy(desc(giftCards.createdAt));
  }),
});
