/**
 * Maison — Cart items table
 *
 * Line items in a cart. Quantity 1–99 (CHECK constraint enforced at app layer).
 */

import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { carts } from "./carts";
import { products } from "./products";
import { productVariants } from "./product-variants";

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
