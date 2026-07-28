/**
 * Maison — Discounts table (Phase 2)
 *
 * Promo codes. Percentage, fixed amount, or free shipping.
 */

import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { discountTypeEnum } from './enums';

export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  type: discountTypeEnum('type').notNull(),
  value: integer('value').notNull(), // percentage 0–100 or cents
  minOrderCents: integer('min_order_cents').default(0).notNull(),
  maxUses: integer('max_uses'),
  usesCount: integer('uses_count').default(0).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Discount = typeof discounts.$inferSelect;
