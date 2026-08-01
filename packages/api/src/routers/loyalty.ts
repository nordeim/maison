/**
 * Maison — Loyalty program router
 *
 * Protected: view loyalty account, points history.
 * Admin: list all loyalty accounts.
 *
 * Points: 1 point per $1 spent (100 cents = 1 point).
 * Tiers: member (0), silver (500), gold (2000), platinum (5000).
 */

import { TRPCError } from '@trpc/server';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

import { loyaltyAccounts, loyaltyTransactions, customers, users } from '@maison/db';

import { router, protectedProcedure, staffProcedure } from '../trpc';

const TIER_THRESHOLDS = {
  member: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
} as const;

const TIER_PERKS = {
  member: 'Earn 1 point per $1 spent',
  silver: '1.25× points + free shipping over $100',
  gold: '1.5× points + free shipping over $75 + early access',
  platinum: '2× points + free shipping + exclusive releases + personal shopper',
} as const;

function calculateTier(lifetimePoints: number): keyof typeof TIER_THRESHOLDS {
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold';
  if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver';
  return 'member';
}

export const loyaltyRouter = router({
  /**
   * Get current user's loyalty account.
   * Creates one if it doesn't exist.
   */
  myAccount: protectedProcedure.query(async ({ ctx }) => {
    const [customer] = await ctx.db
      .select()
      .from(customers)
      .where(eq(customers.userId, ctx.session.user.id))
      .limit(1);

    if (!customer) {
      // Create customer + loyalty account
      const [newCustomer] = await ctx.db
        .insert(customers)
        .values({ userId: ctx.session.user.id })
        .returning({ id: customers.id });

      if (!newCustomer) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create customer record',
        });
      }

      const [loyaltyAccount] = await ctx.db
        .insert(loyaltyAccounts)
        .values({ customerId: newCustomer.id })
        .returning();

      if (!loyaltyAccount) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create loyalty account',
        });
      }

      return formatLoyaltyAccount(loyaltyAccount);
    }

    let [loyaltyAccount] = await ctx.db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.customerId, customer.id))
      .limit(1);

    if (!loyaltyAccount) {
      [loyaltyAccount] = await ctx.db
        .insert(loyaltyAccounts)
        .values({ customerId: customer.id })
        .returning();
    }

    if (!loyaltyAccount) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Loyalty account not found',
      });
    }

    // Check if tier should be upgraded
    const correctTier = calculateTier(loyaltyAccount.lifetimePoints);
    if (loyaltyAccount.tier !== correctTier) {
      await ctx.db
        .update(loyaltyAccounts)
        .set({ tier: correctTier })
        .where(eq(loyaltyAccounts.id, loyaltyAccount.id));
      loyaltyAccount.tier = correctTier;
    }

    return formatLoyaltyAccount(loyaltyAccount);
  }),

  /**
   * Get loyalty transaction history.
   */
  myHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input, ctx }) => {
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.session.user.id))
        .limit(1);

      if (!customer) return { items: [] };

      const [loyaltyAccount] = await ctx.db
        .select()
        .from(loyaltyAccounts)
        .where(eq(loyaltyAccounts.customerId, customer.id))
        .limit(1);

      if (!loyaltyAccount) return { items: [] };

      const transactions = await ctx.db
        .select()
        .from(loyaltyTransactions)
        .where(eq(loyaltyTransactions.loyaltyAccountId, loyaltyAccount.id))
        .orderBy(desc(loyaltyTransactions.createdAt))
        .limit(input.limit);

      return { items: transactions };
    }),

  /**
   * Admin: list all loyalty accounts.
   */
  listAll: staffProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.db
      .select({
        id: loyaltyAccounts.id,
        customerId: loyaltyAccounts.customerId,
        pointsBalance: loyaltyAccounts.pointsBalance,
        lifetimePoints: loyaltyAccounts.lifetimePoints,
        tier: loyaltyAccounts.tier,
        joinedAt: loyaltyAccounts.joinedAt,
        customerEmail: users.email,
      })
      .from(loyaltyAccounts)
      .leftJoin(customers, eq(loyaltyAccounts.customerId, customers.id))
      .leftJoin(users, eq(customers.userId, users.id))
      .orderBy(desc(loyaltyAccounts.lifetimePoints));

    return accounts;
  }),
});

function formatLoyaltyAccount(account: typeof loyaltyAccounts.$inferSelect) {
  // Validate the tier string against TIER_THRESHOLDS keys before casting.
  // If the DB contains an invalid tier (e.g. from a migration or manual edit),
  // default to 'member' instead of passing an unknown value to getNextTier.
  // Per analysis-1/2/3-feedback §6 (upstream cast safety).
  const tierKeys = Object.keys(TIER_THRESHOLDS) as (keyof typeof TIER_THRESHOLDS)[];
  const currentTier = tierKeys.includes(account.tier as keyof typeof TIER_THRESHOLDS)
    ? (account.tier as keyof typeof TIER_THRESHOLDS)
    : 'member';
  const nextTier = getNextTier(currentTier);
  const pointsToNextTier = nextTier ? TIER_THRESHOLDS[nextTier] - account.lifetimePoints : 0;

  return {
    pointsBalance: account.pointsBalance,
    lifetimePoints: account.lifetimePoints,
    tier: currentTier,
    tierPerk: TIER_PERKS[currentTier],
    nextTier,
    pointsToNextTier: Math.max(0, pointsToNextTier),
    progressToNextTier: nextTier
      ? Math.min(
          100,
          ((account.lifetimePoints - TIER_THRESHOLDS[currentTier]) /
            (TIER_THRESHOLDS[nextTier] - TIER_THRESHOLDS[currentTier])) *
            100,
        )
      : 100,
    joinedAt: account.joinedAt,
  };
}

/**
 * Lookup map for tier progression. O(1) lookup, self-documenting,
 * eliminates indexOf entirely. Returns null for unknown keys at runtime
 * (the latent bug fix from analysis-1/2/3-feedback — Option B).
 *
 * Per REMEDIATION_PLAN_v18 Task 1.
 */
const NEXT_TIER: Record<keyof typeof TIER_THRESHOLDS, keyof typeof TIER_THRESHOLDS | null> = {
  member: 'silver',
  silver: 'gold',
  gold: 'platinum',
  platinum: null,
};

function getNextTier(current: keyof typeof TIER_THRESHOLDS): keyof typeof TIER_THRESHOLDS | null {
  return NEXT_TIER[current] ?? null;
}
