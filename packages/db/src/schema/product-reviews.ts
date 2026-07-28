/**
 * Maison — Product reviews table
 *
 * Customer reviews with ratings (1–5 stars), optional title, body text,
 * and photo URLs. Reviews are moderated (isApproved flag) — admin approves
 * before they appear on the PDP.
 */

import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';
import { customers } from './customers';

export const productReviews = pgTable('product_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, {
    onDelete: 'set null',
  }),
  customerName: text('customer_name').notNull(), // snapshot (for guest reviews)
  customerEmail: text('customer_email'), // for verification (not displayed)
  rating: integer('rating').notNull(), // 1–5
  title: text('title'),
  body: text('body'),
  photoUrls: text('photo_urls').array(), // Phase 3: Cloudflare Images URLs
  isApproved: boolean('is_approved').default(false).notNull(),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ProductReview = typeof productReviews.$inferSelect;
export type NewProductReview = typeof productReviews.$inferInsert;
