/**
 * Maison — Gift cards table
 *
 * Digital gift cards with unique codes. Purchased as a product variant
 * and redeemed at checkout by applying the code (like a discount code).
 *
 * Value is stored in cents. Cards have a balance that decreases on redemption.
 */

import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

import { customers } from './customers';
import { orders } from './orders';

export const giftCards = pgTable('gift_cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(), // e.g. "MAIS-GC-XXXX-XXXX"
  initialBalanceCents: integer('initial_balance_cents').notNull(),
  balanceCents: integer('balance_cents').notNull(), // decreases on redemption
  currency: text('currency').default('USD').notNull(),
  purchaserCustomerId: uuid('purchaser_customer_id').references(() => customers.id, {
    onDelete: 'set null',
  }),
  purchaserEmail: text('purchaser_email').notNull(),
  recipientEmail: text('recipient_email').notNull(),
  recipientName: text('recipient_name'),
  message: text('message'), // gift message
  purchasedFromOrderId: uuid('purchased_from_order_id').references(() => orders.id, {
    onDelete: 'set null',
  }),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // null = no expiry
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type GiftCard = typeof giftCards.$inferSelect;
export type NewGiftCard = typeof giftCards.$inferInsert;

/**
 * Gift card redemptions — tracks each partial redemption.
 */
export const giftCardRedemptions = pgTable('gift_card_redemptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  giftCardId: uuid('gift_card_id')
    .notNull()
    .references(() => giftCards.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  amountCents: integer('amount_cents').notNull(),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }).defaultNow().notNull(),
});

export type GiftCardRedemption = typeof giftCardRedemptions.$inferSelect;
