/**
 * Maison — Products router
 *
 * Public procedures for browsing/searching products.
 * Per PRD §10.1.
 */

import { eq, desc, asc, and, sql, lt, gt, or } from 'drizzle-orm';
import { z } from 'zod';

import { products, productImages, productVariants, collections } from '@maison/db';

import { router, publicProcedure } from '../trpc';

// Note: productVariants imported for future use in PDP variant display

const SORT_OPTIONS = ['featured', 'newest', 'price_asc', 'price_desc'] as const;

/**
 * Encode a compound cursor: `${sortValue}|${id}`.
 * sortValue is the sort column value (priceCents, createdAt, or '1'/'0' for featured).
 * id is the product UUID (tiebreaker).
 */
function encodeCursor(sortValue: string | number, id: string): string {
  return `${sortValue}|${id}`;
}

/**
 * Decode a compound cursor into { sortValue, id }.
 * Returns null if the cursor is malformed.
 */
function decodeCursor(cursor: string): { sortValue: string; id: string } | null {
  const parts = cursor.split('|');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { sortValue: parts[0], id: parts[1] };
}

export const productsRouter = router({
  /**
   * List products with optional filters + sort + pagination.
   *
   * Uses compound cursor pagination: cursor is encoded as `${sortValue}|${id}`
   * to support stable pagination across all sort options (including ties).
   * Per REMEDIATION_PLAN_v12 Task 2 (CRITICAL — cursor was previously
   * accepted but never used in the WHERE clause, causing duplicate pages).
   */
  list: publicProcedure
    .input(
      z.object({
        collection: z.string().optional(),
        sort: z.enum(SORT_OPTIONS).default('featured'),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(48).default(24),
      }),
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(products.isActive, true)];

      if (input.collection) {
        conditions.push(eq(collections.slug, input.collection));
      }

      // Compound cursor pagination: decode cursor and add WHERE clause
      // based on the sort option. Uses OR for tie-breaking on the UUID id.
      if (input.cursor) {
        const decoded = decodeCursor(input.cursor);
        if (decoded) {
          const { sortValue, id } = decoded;
          if (input.sort === 'price_asc') {
            const price = Number(sortValue);
            conditions.push(
              or(
                gt(products.priceCents, price),
                and(eq(products.priceCents, price), gt(products.id, id)),
              )!,
            );
          } else if (input.sort === 'price_desc') {
            const price = Number(sortValue);
            conditions.push(
              or(
                lt(products.priceCents, price),
                and(eq(products.priceCents, price), lt(products.id, id)),
              )!,
            );
          } else if (input.sort === 'newest') {
            // sortValue is ISO timestamp
            const createdAt = new Date(sortValue);
            conditions.push(
              or(
                lt(products.createdAt, createdAt),
                and(eq(products.createdAt, createdAt), lt(products.id, id)),
              )!,
            );
          } else {
            // featured: sortValue is '1' or '0' (boolean as string)
            const featured = sortValue === '1';
            // For featured desc: featured products first, then non-featured.
            // Cursor tiebreaker: within same featured value, use id DESC.
            if (featured) {
              // Current cursor is a featured product. Next page: either non-featured,
              // or featured with id < cursor id.
              conditions.push(
                or(
                  eq(products.featured, false),
                  and(eq(products.featured, true), lt(products.id, id)),
                )!,
              );
            } else {
              // Current cursor is non-featured. Next page: non-featured with id < cursor id.
              conditions.push(and(eq(products.featured, false), lt(products.id, id))!);
            }
          }
        }
      }

      const orderBy =
        input.sort === 'price_asc'
          ? [asc(products.priceCents), asc(products.id)]
          : input.sort === 'price_desc'
            ? [desc(products.priceCents), desc(products.id)]
            : input.sort === 'newest'
              ? [desc(products.createdAt), desc(products.id)]
              : [desc(products.featured), desc(products.id)];

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
          createdAt: products.createdAt,
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
        .orderBy(...orderBy)
        .limit(input.limit + 1);

      const hasMore = items.length > input.limit;
      const itemsToSend = hasMore ? items.slice(0, input.limit) : items;

      // Encode nextCursor from the last row's sort value + id
      let nextCursor: string | undefined;
      if (hasMore && itemsToSend.length > 0) {
        const last = itemsToSend[itemsToSend.length - 1];
        if (last) {
          const sortValue =
            input.sort === 'price_asc' || input.sort === 'price_desc'
              ? String(last.priceCents)
              : input.sort === 'newest'
                ? last.createdAt.toISOString()
                : last.featured
                  ? '1'
                  : '0';
          nextCursor = encodeCursor(sortValue, last.id);
        }
      }

      // Shape at the router boundary — coerce left-join-nullable product flags to
      // strict booleans so UI components receive a non-null contract.
      return {
        items: itemsToSend.map((row) => ({
          ...row,
          collectionName: row.collectionName,
          featured: Boolean(row.featured),
          isNew: Boolean(row.isNew),
          isBestseller: Boolean(row.isBestseller),
        })),
        nextCursor,
      };
    }),

  /**
   * Get a single product by slug (for PDP).
   */
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input, ctx }) => {
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
    .input(
      z.object({
        productId: z.string().uuid(),
        limit: z.number().min(1).max(8).default(4),
      }),
    )
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
    .input(
      z.object({
        q: z.string().min(1),
        limit: z.number().min(1).max(24).default(8),
      }),
    )
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
