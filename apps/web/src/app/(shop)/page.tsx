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

import { api } from "@/lib/trpc/server";
import { Hero } from "@/components/shop/sections/Hero";
import { Marquee } from "@/components/shop/sections/Marquee";
import { FeaturedCollection } from "@/components/shop/sections/FeaturedCollection";
import { CategoryGrid } from "@/components/shop/sections/CategoryGrid";
import { ProductGrid } from "@/components/shop/sections/ProductGrid";
import { Philosophy } from "@/components/shop/sections/Philosophy";
import { Materials } from "@/components/shop/sections/Materials";
import { HyggeEdit } from "@/components/shop/sections/HyggeEdit";
import { Testimonials } from "@/components/shop/sections/Testimonials";
import { JournalSection } from "@/components/shop/sections/JournalSection";
import { InstagramGrid } from "@/components/shop/sections/InstagramGrid";
import { NewsletterForm } from "@/components/shop/NewsletterForm";

export default async function HomePage() {
  // Fetch products + collections via server caller (zero HTTP round-trip)
  let products: Array<{
    slug: string;
    name: string;
    priceCents: number;
    shortDescription: string | null;
    materials: string | null;
    primaryImage: string | null;
    collectionName: string | null;
    featured: boolean | null;
    isNew: boolean | null;
    isBestseller: boolean | null;
  }> = [];

  let collections: Array<{
    slug: string;
    name: string;
    description: string | null;
    heroImageUrl: string | null;
  }> = [];

  try {
    const [productsResult, collectionsResult] = await Promise.all([
      api().products.list({ limit: 8, sort: "featured" }),
      api().collections.list(),
    ]);
    products = productsResult.items;
    collections = collectionsResult;
  } catch (err) {
    // Database not configured — render the page with fallback content
    console.error("[home] Failed to fetch data:", err);
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
