/**
 * Maison — Carts table
 *
 * Supports both anonymous (cookie-tracked) and authenticated carts.
 * Anonymous carts merge into customer carts on login.
 */

import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

import { customers } from './customers';

export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, {
    onDelete: 'cascade',
  }),
  anonymousId: text('anonymous_id'), // cookie ID for guest carts
  currency: text('currency').default('USD').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
