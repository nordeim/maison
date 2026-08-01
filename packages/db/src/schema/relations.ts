/**
 * Maison — Drizzle relations
 *
 * Defines relationships between tables for the Drizzle query API.
 * Allows: db.query.customers.findMany({ with: { orders: true } })
 */

import { relations } from 'drizzle-orm';

import { accounts } from './accounts';
import { addresses } from './addresses';
import { cartItems } from './cart-items';
import { carts } from './carts';
import { collections } from './collections';
import { customers } from './customers';
import { lineItems } from './line-items';
import { orders } from './orders';
import { paymentEvents } from './payment-events';
import { productImages } from './product-images';
import { productVariants } from './product-variants';
import { products } from './products';
import { sessions } from './sessions';
import { users } from './users';
import { wishlistItems } from './wishlist-items';

export const userRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  customer: one(customers),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const customerRelations = relations(customers, ({ one, many }) => ({
  user: one(users, { fields: [customers.userId], references: [users.id] }),
  addresses: many(addresses),
  orders: many(orders),
  carts: many(carts),
  wishlistItems: many(wishlistItems),
}));

export const addressRelations = relations(addresses, ({ one }) => ({
  customer: one(customers, {
    fields: [addresses.customerId],
    references: [customers.id],
  }),
}));

export const collectionRelations = relations(collections, ({ many }) => ({
  products: many(products),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
}));

export const productVariantRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const cartRelations = relations(carts, ({ one, many }) => ({
  customer: one(customers, {
    fields: [carts.customerId],
    references: [customers.id],
  }),
  items: many(cartItems),
}));

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  lineItems: many(lineItems),
  paymentEvents: many(paymentEvents),
}));

export const paymentEventRelations = relations(paymentEvents, ({ one }) => ({
  order: one(orders, {
    fields: [paymentEvents.orderId],
    references: [orders.id],
  }),
}));

export const lineItemRelations = relations(lineItems, ({ one }) => ({
  order: one(orders, { fields: [lineItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [lineItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [lineItems.variantId],
    references: [productVariants.id],
  }),
}));

export const wishlistItemRelations = relations(wishlistItems, ({ one }) => ({
  customer: one(customers, {
    fields: [wishlistItems.customerId],
    references: [customers.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));
