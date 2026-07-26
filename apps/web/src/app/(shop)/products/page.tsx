/**
 * Maison — Product Listing Page (PLP)
 *
 * URL-driven state via nuqs (sort, page, collection filter).
 * SSR-rendered from tRPC server caller.
 */

import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse our full collection of handcrafted Scandinavian home goods.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    collection?: string;
    sort?: "featured" | "newest" | "price_asc" | "price_desc";
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const sort = params.sort ?? "featured";

  let products: Array<{
    slug: string;
    name: string;
    priceCents: number;
    shortDescription: string | null;
    primaryImage: string | null;
    collectionName: string | null;
  }> = [];

  try {
    const result = await api().products.list({
      collection: params.collection,
      sort,
      limit: 24,
    });
    products = result.items;
  } catch (err) {
    console.error("[products] Failed to fetch:", err);
  }

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 1.25rem" }}>
      <div style={{ marginBottom: "3rem" }}>
        <p className="eyebrow">Shop All</p>
        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 400 }}>
          {params.collection
            ? `${params.collection.charAt(0).toUpperCase()}${params.collection.slice(1)}`
            : "All Pieces"}
        </h1>
        <p style={{ color: "#8a8178", marginTop: "0.5rem" }}>
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "#8a8178" }}>
          <p>
            {products.length === 0
              ? "No products available yet. Run `pnpm db:seed` to load the initial catalog."
              : "No pieces match this filter."}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1.75rem 1.25rem",
          }}
        >
          {products.map((p) => (
            <a key={p.slug} href={`/products/${p.slug}`} style={{ color: "inherit" }}>
              <div
                style={{
                  aspectRatio: "4 / 5",
                  background: "#f3efe8",
                  marginBottom: "1rem",
                  overflow: "hidden",
                }}
              >
                {p.primaryImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.primaryImage}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
              {p.collectionName && (
                <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8178" }}>
                  {p.collectionName}
                </p>
              )}
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 500 }}>
                {p.name}
              </h3>
              <p style={{ fontSize: "0.95rem", fontWeight: 500, marginTop: "0.25rem" }}>
                {formatPrice(p.priceCents)}
              </p>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
