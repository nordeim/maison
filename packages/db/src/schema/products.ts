/**
 * Maison — Products table
 *
 * The product catalog. Money stored in integer cents (not dollars — see ADR-004).
 * Soft-deleted via is_active = false (never hard-delete — preserve order line item integrity).
 */

import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { collections } from "./collections";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  collectionId: uuid("collection_id").references(() => collections.id, {
    onDelete: "set null",
  }),
  priceCents: integer("price_cents").notNull(),
  compareAtPriceCents: integer("compare_at_price_cents"),
  currency: text("currency").default("USD").notNull(),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  materials: text("materials"),
  dimensions: text("dimensions"),
  weightGrams: integer("weight_grams"),
  featured: boolean("featured").default(false).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  isBestseller: boolean("is_bestseller").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
