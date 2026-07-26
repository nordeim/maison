/**
 * Maison — Orders table
 *
 * Placed orders. Money in integer cents. Stripe idempotency key prevents duplicate orders.
 * Shipping/billing addresses are JSONB snapshots (preserve order history if address book changes).
 */

import { pgTable, uuid, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { orderStatusEnum, shippingMethodEnum } from "./enums";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // e.g. "MAI-2026-00142"
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  email: text("email").notNull(), // snapshot at order time (for guest orders)
  status: orderStatusEnum("status").default("pending").notNull(),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCostCents: integer("shipping_cost_cents").notNull(),
  taxCents: integer("tax_cents").notNull(),
  discountCents: integer("discount_cents").default(0).notNull(),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").default("USD").notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  billingAddress: jsonb("billing_address").notNull(),
  shippingMethod: shippingMethodEnum("shipping_method"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeIdempotencyKey: text("stripe_idempotency_key").unique(),
  placedAt: timestamp("placed_at", { withTimezone: true }),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
