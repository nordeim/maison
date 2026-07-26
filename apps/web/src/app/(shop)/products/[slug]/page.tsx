/**
 * Maison — Product Detail Page (PDP)
 *
 * Async params (Next.js 16): params is a Promise — must be awaited.
 * SSR-rendered from tRPC server caller. Includes JSON-LD structured data.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { formatPrice } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await api().products.getBySlug({ slug });
    if (!product) return { title: "Product not found" };
    return {
      title: product.name,
      description: product.shortDescription ?? product.longDescription?.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.shortDescription ?? undefined,
        images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
      },
    };
  } catch {
    return { title: "Product not found" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: Awaited<ReturnType<ReturnType<typeof api>["products"]["getBySlug"]>> = null;
  try {
    product = await api().products.getBySlug({ slug });
  } catch (err) {
    console.error("[product] Failed to fetch:", err);
  }

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.longDescription,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "3rem 1.25rem" }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: "0.875rem", color: "#8a8178", marginBottom: "2rem" }}>
          <a href="/" style={{ color: "inherit" }}>Home</a>
          {" / "}
          <a href="/products" style={{ color: "inherit" }}>Shop</a>
          {" / "}
          <span style={{ color: "#1f1b17" }}>{product.name}</span>
        </nav>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
          }}
        >
          {/* Image gallery */}
          <div>
            {product.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]!.url}
                alt={product.images[0]!.altText ?? product.name}
                style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "4 / 5", background: "#f3efe8" }} />
            )}
          </div>

          {/* Product info */}
          <div>
            <p className="eyebrow">
              {product.materials}
            </p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, marginBottom: "1rem" }}>
              {product.name}
            </h1>
            <p style={{ fontSize: "1.5rem", fontWeight: 500, marginBottom: "2rem" }}>
              {formatPrice(product.priceCents, product.currency)}
            </p>

            {product.shortDescription && (
              <p style={{ fontSize: "1.125rem", lineHeight: 1.7, color: "#4a433b", marginBottom: "1.5rem" }}>
                {product.shortDescription}
              </p>
            )}

            {product.longDescription && (
              <p style={{ lineHeight: 1.7, color: "#4a433b", marginBottom: "2rem" }}>
                {product.longDescription}
              </p>
            )}

            {product.dimensions && (
              <p style={{ fontSize: "0.875rem", color: "#8a8178", marginBottom: "0.5rem" }}>
                <strong>Dimensions:</strong> {product.dimensions}
              </p>
            )}

            <button
              style={{
                padding: "0.95rem 1.75rem",
                background: "#a86b4a",
                color: "#faf8f5",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                marginTop: "2rem",
                width: "100%",
              }}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
