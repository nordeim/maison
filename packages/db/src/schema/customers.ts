/**
 * Maison — Customers table
 *
 * One-to-one with users. Stores customer profile data (name, phone, newsletter).
 * A user may exist without a customer row (e.g. admin staff who never shop).
 */

import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  newsletterSubscribed: boolean("newsletter_subscribed").default(false).notNull(),
  notes: text("notes"), // admin-visible only
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
