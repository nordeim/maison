/**
 * Maison — Addresses table
 *
 * Multiple addresses per customer. Default shipping + billing flags.
 */

import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

import { customers } from './customers';

export const addresses = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  label: text('label'), // "Home", "Work", etc.
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: text('city').notNull(),
  region: text('region'), // state/county
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(), // ISO 3166-1 alpha-2
  isDefaultShipping: boolean('is_default_shipping').default(false).notNull(),
  isDefaultBilling: boolean('is_default_billing').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
