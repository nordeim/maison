/**
 * Maison — Line items table
 *
 * Order line items. Snapshots product name, variant name, price, and image
 * at order time — so order history is preserved even if products are later
 * edited or soft-deleted.
 */

import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { products } from './products';
import { productVariants } from './product-variants';

export const lineItems = pgTable('line_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  variantId: uuid('variant_id').references(() => productVariants.id, {
    onDelete: 'set null',
  }),
  productName: text('product_name').notNull(), // snapshot
  variantName: text('variant_name'), // snapshot
  priceCents: integer('price_cents').notNull(), // snapshot
  quantity: integer('quantity').notNull(),
  imageUrl: text('image_url'), // snapshot
});

export type LineItem = typeof lineItems.$inferSelect;
