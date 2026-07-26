/**
 * Maison — Homepage (Server Component)
 *
 * Renders the 15 sections from docs/landing_page_unified.html.
 * In Phase 0, this is a placeholder that renders the hero + a link to the
 * static landing page mockup. Phase 1 will replace this with the full
 * server-rendered homepage calling the tRPC server caller.
 */

import { api } from "@/lib/trpc/server";
import { formatPrice } from "@/lib/utils";

export default async function HomePage() {
  // Phase 0: fetch products via server caller to verify the tRPC → DB pipeline.
  // Phase 1: replace with full 15-section homepage from landing_page_unified.html.
  let products: Array<{
    slug: string;
    name: string;
    priceCents: number;
    shortDescription: string | null;
  }> = [];

  try {
    const result = await api().products.list({ limit: 4 });
    products = result.items;
  } catch (err) {
    // Database not configured — render the page without products
    console.error("[home] Failed to fetch products:", err);
  }

  return (
    <main>
      {/* Hero — minimal Phase 0 version */}
      <section
        style={{
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
          background: "linear-gradient(135deg, #faf8f5 0%, #f3efe8 100%)",
        }}
      >
        <p className="eyebrow">Curated for Considered Living</p>
        <h1
          style={{
            fontSize: "clamp(3rem, 8.5vw, 7.5rem)",
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Objects of
          <br />
          <em style={{ color: "#c4a265", fontWeight: 300 }}>Quiet Beauty</em>
        </h1>
        <p
          style={{
            maxWidth: "52ch",
            fontSize: "1.125rem",
            lineHeight: 1.7,
            color: "#4a433b",
          }}
        >
          Handcrafted home goods, sculptural lighting, and tactile lifestyle pieces —
          made by Nordic artisans from solid oak, linen, and clay, designed to bring
          warmth and intention to everyday moments.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.95rem 1.75rem",
              background: "#a86b4a",
              color: "#faf8f5",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Shop the Collection
          </a>
          <a
            href="/about"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.95rem 1.75rem",
              border: "1px solid #1f1b17",
              color: "#1f1b17",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Our Craft
          </a>
        </div>
      </section>

      {/* Featured products (Phase 0 — verifies tRPC + DB pipeline) */}
      {products.length > 0 && (
        <section style={{ padding: "5rem 1.25rem", maxWidth: 1280, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", marginBottom: "2rem" }}>
            Pieces we'd <em style={{ color: "#a86b4a" }}>live with</em>.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.75rem",
            }}
          >
            {products.map((p) => (
              <a key={p.slug} href={`/products/${p.slug}`} style={{ color: "inherit" }}>
                <div
                  style={{
                    aspectRatio: "4 / 5",
                    background: "#f3efe8",
                    marginBottom: "1rem",
                  }}
                />
                <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8178" }}>
                  Maison
                </p>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 500 }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                  {formatPrice(p.priceCents)}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Phase 0 notice */}
      <section
        style={{
          padding: "3rem 1.25rem",
          textAlign: "center",
          maxWidth: 760,
          margin: "0 auto",
          color: "#8a8178",
        }}
      >
        <p style={{ fontSize: "0.875rem", lineHeight: 1.65 }}>
          Phase 0 scaffold — the full 15-section homepage (hero, marquee, featured collection,
          categories, products, philosophy, materials, Hygge Edit, testimonials, journal,
          Instagram, newsletter) will be implemented in Phase 1 per{" "}
          <code style={{ color: "#a86b4a" }}>docs/PRD_unified.md §6.1</code>.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <a
            href="/docs/landing_page_unified.html"
            style={{ color: "#a86b4a", borderBottom: "1px solid #a86b4a" }}
          >
            View the canonical visual reference
          </a>
        </p>
      </section>
    </main>
  );
}
