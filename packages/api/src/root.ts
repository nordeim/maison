/**
 * Maison — Root router
 *
 * Merges all domain routers into the single tRPC AppRouter.
 * Exported type AppRouter is used by the client for type-safe calls.
 */

import { router } from "./trpc";
import { productsRouter } from "./routers/products";
import { collectionsRouter } from "./routers/collections";
import { cartRouter } from "./routers/cart";
import { accountRouter } from "./routers/account";
import { checkoutRouter } from "./routers/checkout";
import { newsletterRouter } from "./routers/newsletter";
import { contactRouter } from "./routers/contact";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  products: productsRouter,
  collections: collectionsRouter,
  cart: cartRouter,
  account: accountRouter,
  checkout: checkoutRouter,
  newsletter: newsletterRouter,
  contact: contactRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
