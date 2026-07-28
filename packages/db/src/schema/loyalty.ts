/**
 * Maison — Loyalty program
 *
 * Customers earn points per purchase (1 point per $1 spent).
 * Points determine tier status (Member, Silver, Gold, Platinum).
 * Tiers unlock perks (free shipping threshold, early access, etc.)
 */

import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { customers } from './customers';
import { orders } from './orders';

export const loyaltyAccounts = pgTable('loyalty_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .notNull()
    .unique()
    .references(() => customers.id, { onDelete: 'cascade' }),
  pointsBalance: integer('points_balance').default(0).notNull(),
  lifetimePoints: integer('lifetime_points').default(0).notNull(),
  tier: text('tier').default('member').notNull(), // member, silver, gold, platinum
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
});

export type LoyaltyAccount = typeof loyaltyAccounts.$inferSelect;

/**
 * Loyalty point transactions — tracks points earned and redeemed.
 */
export const loyaltyTransactions = pgTable('loyalty_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  loyaltyAccountId: uuid('loyalty_account_id')
    .notNull()
    .references(() => loyaltyAccounts.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').references(() => orders.id, {
    onDelete: 'set null',
  }),
  type: text('type').notNull(), // "earned", "redeemed", "adjusted"
  points: integer('points').notNull(), // positive for earned, negative for redeemed
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
