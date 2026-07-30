/**
 * Maison — Seed script
 *
 * Seeds the database with:
 *  - 8 collections
 *  - 20 products (13 original + 7 UAT additions, with images and default variants)
 *
 * Idempotent: safe to re-run. Existing rows are updated, not duplicated.
 *
 * Usage: pnpm db:seed  (from repo root)
 */

import './env'; // Load .env before db client reads DATABASE_URL
import { db } from '../index';
import { collections, products, productVariants, productImages } from '../schema';
import { eq } from 'drizzle-orm';
import { seedCollections } from './fixtures/collections';
import { seedProducts, productCollectionMap, productImagesMap } from './fixtures/products';

async function seed() {
  console.log('── Maison seed ──────────────────────────────────────────');

  // 1. Collections
  console.log(`→ Upserting ${seedCollections.length} collections…`);
  for (const col of seedCollections) {
    const [existing] = await db
      .select()
      .from(collections)
      .where(eq(collections.slug, col.slug!))
      .limit(1);

    if (existing) {
      await db
        .update(collections)
        .set({ ...col, updatedAt: new Date() })
        .where(eq(collections.slug, col.slug!));
    } else {
      await db.insert(collections).values(col);
    }
  }

  // 2. Build slug → collectionId map
  const allCollections = await db.select().from(collections);
  const collectionBySlug = new Map(allCollections.map((c) => [c.slug, c.id]));

  // 3. Products + images + default variant
  console.log(`→ Upserting ${seedProducts.length} products…`);
  for (const product of seedProducts) {
    const collectionSlug = productCollectionMap[product.slug!];
    const collectionId = collectionSlug ? (collectionBySlug.get(collectionSlug) ?? null) : null;

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.slug, product.slug!))
      .limit(1);

    let productId: string;

    if (existing) {
      await db
        .update(products)
        .set({ ...product, collectionId, updatedAt: new Date() })
        .where(eq(products.slug, product.slug!));
      productId = existing.id;
    } else {
      const [inserted] = await db
        .insert(products)
        .values({ ...product, collectionId })
        .returning({ id: products.id });
      productId = inserted!.id;
    }

    // 3a. Images
    const imageUrls = productImagesMap[product.slug!] ?? [];
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i]!;
      const [existingImg] = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .limit(1)
        .offset(i);

      if (!existingImg) {
        await db.insert(productImages).values({
          productId,
          url,
          altText: `${product.name} — view ${i + 1}`,
          sortOrder: i,
        });
      }
    }

    // 3b. Default variant (single, no options — covers stock for the product)
    const sku = product.slug!.toUpperCase().replace(/-/g, '-').slice(0, 20);
    const [existingVariant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.sku, sku))
      .limit(1);

    if (!existingVariant) {
      await db.insert(productVariants).values({
        productId,
        sku,
        name: 'Default',
        stockQuantity: 25, // reasonable default for seed
        leadTimeDays: 0,
        isActive: true,
      });
    }
  }

  console.log('── ✓ Seed complete ──────────────────────────────────────');
  console.log(`  Collections: ${seedCollections.length}`);
  console.log(`  Products:    ${seedProducts.length}`);
  console.log(`  Variants:    ${seedProducts.length} (1 default per product)`);
  console.log(
    `  Images:      ${Object.values(productImagesMap).reduce((a, b) => a + b.length, 0)}`,
  );

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
