/**
 * Maison — Products router
 *
 * Public procedures for browsing/searching products.
 * Per PRD §10.1.
 */

import { z } from "zod";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import {
  products,
  productImages,
  productVariants,
  collections,
} from "@maison/db";
import { router, publicProcedure } from "../trpc";

// Note: productVariants imported for future use in PDP variant display

const SORT_OPTIONS = ["featured", "newest", "price_asc", "price_desc"] as const;

export const productsRouter = router({
  /**
   * List products with optional filters + sort + pagination.
   */
  list: publicProcedure
    .input(
      z.object({
        collection: z.string().optional(),
        sort: z.enum(SORT_OPTIONS).default("featured"),
        cursor: z.string().uuid().optional(),
        limit: z.number().min(1).max(48).default(24),
      }),
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(products.isActive, true)];

      if (input.collection) {
        conditions.push(eq(collections.slug, input.collection));
      }

      const orderBy =
        input.sort === "price_asc"
          ? asc(products.priceCents)
          : input.sort === "price_desc"
            ? desc(products.priceCents)
            : input.sort === "newest"
              ? desc(products.createdAt)
              : desc(products.featured);

      const items = await ctx.db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          priceCents: products.priceCents,
          compareAtPriceCents: products.compareAtPriceCents,
          currency: products.currency,
          shortDescription: products.shortDescription,
          materials: products.materials,
          featured: products.featured,
          isNew: products.isNew,
          isBestseller: products.isBestseller,
          collectionName: collections.name,
          collectionSlug: collections.slug,
          primaryImage: productImages.url,
        })
        .from(products)
        .leftJoin(collections, eq(products.collectionId, collections.id))
        .leftJoin(
          productImages,
          and(eq(productImages.productId, products.id), eq(productImages.sortOrder, 0)),
        )
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(input.limit + 1);

      const hasMore = items.length > input.limit;
      const itemsToSend = hasMore ? items.slice(0, input.limit) : items;
      const nextCursor = hasMore ? itemsToSend[itemsToSend.length - 1]?.id : undefined;

      return {
        items: itemsToSend,
        nextCursor,
      };
    }),

  /**
   * Get a single product by slug (for PDP).
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const [product] = await ctx.db
        .select()
        .from(products)
        .where(and(eq(products.slug, input.slug), eq(products.isActive, true)))
        .limit(1);

      if (!product) {
        return null;
      }

      const images = await ctx.db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(asc(productImages.sortOrder));

      const variants = await ctx.db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id));

      return { ...product, images, variants };
    }),

  /**
   * Get related products (same collection, max 4).
   */
  getRelated: publicProcedure
    .input(z.object({ productId: z.string().uuid(), limit: z.number().min(1).max(8).default(4) }))
    .query(async ({ input, ctx }) => {
      // Get the product's collection
      const [current] = await ctx.db
        .select({ collectionId: products.collectionId })
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!current?.collectionId) return [];

      const related = await ctx.db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          priceCents: products.priceCents,
          currency: products.currency,
          shortDescription: products.shortDescription,
          primaryImage: productImages.url,
        })
        .from(products)
        .leftJoin(
          productImages,
          and(eq(productImages.productId, products.id), eq(productImages.sortOrder, 0)),
        )
        .where(
          and(
            eq(products.collectionId, current.collectionId),
            eq(products.isActive, true),
            sql`${products.id} != ${input.productId}`,
          ),
        )
        .limit(input.limit);

      return related;
    }),

  /**
   * Full-text search across name, description, materials.
   */
  search: publicProcedure
    .input(z.object({ q: z.string().min(1), limit: z.number().min(1).max(24).default(8) }))
    .query(async ({ input, ctx }) => {
      const pattern = `%${input.q}%`;
      const results = await ctx.db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          priceCents: products.priceCents,
          shortDescription: products.shortDescription,
          primaryImage: productImages.url,
        })
        .from(products)
        .leftJoin(
          productImages,
          and(eq(productImages.productId, products.id), eq(productImages.sortOrder, 0)),
        )
        .where(
          and(
            eq(products.isActive, true),
            sql`(${products.name} ILIKE ${pattern} OR ${products.shortDescription} ILIKE ${pattern} OR ${products.materials} ILIKE ${pattern})`,
          ),
        )
        .limit(input.limit);

      return results;
    }),
});
