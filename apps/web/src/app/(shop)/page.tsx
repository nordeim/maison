/**
 * Maison — Homepage (Server Component)
 *
 * Assembles all 15 sections from docs/landing_page_unified.html:
 *  1. Hero (full-bleed, Ken Burns)
 *  2. Marquee (brand promises)
 *  3. Featured Collection (Lighting spotlight)
 *  4. Category Grid (4-col)
 *  5. Product Grid (4-col, seeded products)
 *  6. Philosophy (asymmetric editorial)
 *  7. Materials (3-col: oak, linen, clay)
 *  8. Hygge Edit (full-bleed editorial)
 *  9. Testimonials (3-col)
 * 10. Journal (3-col articles)
 * 11. Instagram (6-col grid)
 * 12. Newsletter ("Letters from Maison")
 *
 * Data is fetched via the tRPC server caller (zero HTTP round-trip).
 */

import { NewsletterForm } from '@/components/shop/NewsletterForm';
import { CategoryGrid } from '@/components/shop/sections/CategoryGrid';
import { FeaturedCollection } from '@/components/shop/sections/FeaturedCollection';
import { Hero } from '@/components/shop/sections/Hero';
import { HyggeEdit } from '@/components/shop/sections/HyggeEdit';
import { InstagramGrid } from '@/components/shop/sections/InstagramGrid';
import { JournalSection } from '@/components/shop/sections/JournalSection';
import { Marquee } from '@/components/shop/sections/Marquee';
import { Materials } from '@/components/shop/sections/Materials';
import { Philosophy } from '@/components/shop/sections/Philosophy';
import { ProductGrid } from '@/components/shop/sections/ProductGrid';
import { Testimonials } from '@/components/shop/sections/Testimonials';
import { api } from '@/lib/trpc/server';

export default async function HomePage() {
  // Fetch products + collections via server caller (zero HTTP round-trip)
  let products: {
    slug: string;
    name: string;
    priceCents: number;
    shortDescription: string | null;
    materials: string | null;
    primaryImage: string | null;
    collectionName: string | null;
    featured: boolean;
    isNew: boolean;
    isBestseller: boolean;
  }[] = [];

  let collections: {
    slug: string;
    name: string;
    description: string | null;
    heroImageUrl: string | null;
  }[] = [];

  try {
    const caller = await api();
    const [productsResult, collectionsResult] = await Promise.all([
      caller.products.list({ limit: 8, sort: 'featured' }),
      caller.collections.list(),
    ]);
    products = productsResult.items;
    collections = collectionsResult;
  } catch (err) {
    // Database not configured — render the page with fallback content
    console.error('[home] Failed to fetch data:', err);
  }

  return (
    <>
      <Hero />
      <Marquee />
      <FeaturedCollection />
      <CategoryGrid collections={collections} />
      <ProductGrid products={products} />
      <Philosophy />
      <Materials />
      <HyggeEdit />
      <Testimonials />
      <JournalSection />
      <InstagramGrid />
      <NewsletterForm />
    </>
  );
}
