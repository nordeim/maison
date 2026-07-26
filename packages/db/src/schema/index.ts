/**
 * Maison — Schema barrel
 *
 * Re-exports all tables, enums, and relations for the Drizzle query API.
 * Consumers: `import { products, orders, db } from "@maison/db"`.
 */

// Enums
export * from "./enums";

// Better Auth managed tables
export { users } from "./users";
export { sessions } from "./sessions";
export { accounts } from "./accounts";
export { verifications } from "./verifications";

// Application tables
export { customers } from "./customers";
export type { Customer, NewCustomer } from "./customers";

export { addresses } from "./addresses";
export type { Address, NewAddress } from "./addresses";

export { collections } from "./collections";
export type { Collection, NewCollection } from "./collections";

export { products } from "./products";
export type { Product, NewProduct } from "./products";

export { productVariants } from "./product-variants";
export type { ProductVariant, NewProductVariant } from "./product-variants";

export { productImages } from "./product-images";
export type { ProductImage } from "./product-images";

export { carts } from "./carts";
export type { Cart, NewCart } from "./carts";

export { cartItems } from "./cart-items";
export type { CartItem, NewCartItem } from "./cart-items";

export { orders } from "./orders";
export type { Order, NewOrder } from "./orders";

export { lineItems } from "./line-items";
export type { LineItem } from "./line-items";

export { wishlistItems } from "./wishlist-items";
export type { WishlistItem } from "./wishlist-items";

export { discounts } from "./discounts";
export type { Discount } from "./discounts";

export { auditLog } from "./audit-log";
export type { AuditLogEntry } from "./audit-log";

// Phase 3 tables
export { productReviews } from "./product-reviews";
export type { ProductReview, NewProductReview } from "./product-reviews";

export { giftCards, giftCardRedemptions } from "./gift-cards";
export type { GiftCard, NewGiftCard, GiftCardRedemption } from "./gift-cards";

export { tradeApplications } from "./trade-applications";
export type { TradeApplication, NewTradeApplication } from "./trade-applications";

export { loyaltyAccounts, loyaltyTransactions } from "./loyalty";
export type { LoyaltyAccount, LoyaltyTransaction } from "./loyalty";

// Relations (for Drizzle query API: db.query.*.findMany({ with: ... }))
export * from "./relations";
