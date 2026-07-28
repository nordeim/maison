/**
 * Maison — Product variants table
 *
 * Size/finish/material variants per product. Each has its own SKU + stock.
 * If a product has no variants, create a single variant with the product's default values.
 */

import { pgTable, uuid, text, integer, boolean } from 'drizzle-orm/pg-core';
import { products } from './products';

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(), // e.g. "Sand", "Oak / Natural"
  priceCents: integer('price_cents'), // override of product price; null = use product price
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  leadTimeDays: integer('lead_time_days').default(0).notNull(), // 0 = in stock, >0 = made-to-order
  isActive: boolean('is_active').default(true).notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
