/**
 * Maison — Shared enums (PostgreSQL enum types)
 *
 * Defined separately so they can be reused across tables without circular imports.
 */

import { pgEnum } from "drizzle-orm/pg-core";

/** User role — determines access level (RBAC). */
export const userRoleEnum = pgEnum("user_role", ["customer", "staff", "admin"]);

/** Order status — lifecycle of an order from placement to delivery. */
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

/** Discount type — how a promo code reduces the order total. */
export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
  "free_shipping",
]);

/** Shipping method — selected at checkout. */
export const shippingMethodEnum = pgEnum("shipping_method", [
  "standard",
  "express",
  "white_glove",
]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type DiscountType = (typeof discountTypeEnum.enumValues)[number];
export type ShippingMethod = (typeof shippingMethodEnum.enumValues)[number];
