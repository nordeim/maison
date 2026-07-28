/**
 * Maison — Wishlist items table
 *
 * Saved products per customer. UNIQUE constraint prevents duplicates.
 */

import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { customers } from './customers';
import { products } from './products';

export const wishlistItems = pgTable(
  'wishlist_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique('wishlist_customer_product_unique').on(table.customerId, table.productId)],
);

export type WishlistItem = typeof wishlistItems.$inferSelect;
