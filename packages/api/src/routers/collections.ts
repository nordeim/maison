/**
 * Maison — Collections router
 *
 * Public procedures for browsing collections.
 */

import { z } from 'zod';
import { eq, asc } from 'drizzle-orm';
import { collections, products, productImages } from '@maison/db';
import { and, sql } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';

export const collectionsRouter = router({
  /**
   * List all active collections, ordered by sortOrder.
   */
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(collections)
      .where(eq(collections.isActive, true))
      .orderBy(asc(collections.sortOrder));
  }),

  /**
   * Get a single collection by slug, with its products.
   */
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input, ctx }) => {
    const [collection] = await ctx.db
      .select()
      .from(collections)
      .where(and(eq(collections.slug, input.slug), eq(collections.isActive, true)))
      .limit(1);

    if (!collection) return null;

    const collectionProducts = await ctx.db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        priceCents: products.priceCents,
        shortDescription: products.shortDescription,
        featured: products.featured,
        isNew: products.isNew,
        primaryImage: productImages.url,
      })
      .from(products)
      .leftJoin(
        productImages,
        and(eq(productImages.productId, products.id), eq(productImages.sortOrder, 0)),
      )
      .where(and(eq(products.collectionId, collection.id), eq(products.isActive, true)));

    return { ...collection, products: collectionProducts };
  }),
});
