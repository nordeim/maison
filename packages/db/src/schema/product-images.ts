/**
 * Maison — Product images table
 *
 * Multiple images per product, sort-ordered. Used in PDP gallery and PLP hover-swap.
 */

import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core';

import { products } from './products';

export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
