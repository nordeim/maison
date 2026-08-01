/**
 * Maison — Root router
 *
 * Merges all domain routers into the single tRPC AppRouter.
 * Exported type AppRouter is used by the client for type-safe calls.
 */

import { accountRouter } from './routers/account';
import { adminRouter } from './routers/admin';
import { cartRouter } from './routers/cart';
import { checkoutRouter } from './routers/checkout';
import { collectionsRouter } from './routers/collections';
import { contactRouter } from './routers/contact';
import { discountsRouter } from './routers/discounts';
import { giftCardsRouter } from './routers/gift-cards';
import { loyaltyRouter } from './routers/loyalty';
import { newsletterRouter } from './routers/newsletter';
import { productsRouter } from './routers/products';
import { reviewsRouter } from './routers/reviews';
import { tradeRouter } from './routers/trade';
import { router } from './trpc';

export const appRouter = router({
  products: productsRouter,
  collections: collectionsRouter,
  cart: cartRouter,
  account: accountRouter,
  checkout: checkoutRouter,
  newsletter: newsletterRouter,
  contact: contactRouter,
  admin: adminRouter,
  discounts: discountsRouter,
  reviews: reviewsRouter,
  giftCards: giftCardsRouter,
  trade: tradeRouter,
  loyalty: loyaltyRouter,
});

export type AppRouter = typeof appRouter;
