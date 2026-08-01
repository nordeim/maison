/**
 * Maison — Payment Events table (ADR-014 — webhook idempotency log)
 *
 * Every Stripe webhook event inserts a row here after processing.
 * The `stripeEventId` UNIQUE INDEX is the first line of defense in the
 * dual-defense idempotency pattern (ADR-014):
 *
 *   1. Fast-path check: findFirst by stripeEventId — return early if exists
 *   2. Open transaction, acquire pg_advisory_xact_lock(hash(event.id))
 *   3. Double-check: findFirst again (in case concurrent request inserted)
 *   4. Process event + insert payment_events record
 *   5. On catch: detect PG code 23505 (isUniqueViolation) → return success
 *
 * Per Stillwater v3.0.0 §15.21.1 and ADR-014.
 */

import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

import { orders } from './orders';

export const paymentEvents = pgTable('payment_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  stripeEventId: text('stripe_event_id').notNull().unique(),
  stripeEventType: text('stripe_event_type').notNull(),
  orderId: uuid('order_id').references(() => orders.id, {
    onDelete: 'set null',
  }),
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type PaymentEvent = typeof paymentEvents.$inferSelect;
export type NewPaymentEvent = typeof paymentEvents.$inferInsert;
