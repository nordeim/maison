/**
 * Maison — Admin products page (Server Component)
 *
 * Product table with name, collection, price, stock, status.
 */

import { api } from "@/lib/trpc/server";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  let products: { items: Array<{ id: string; slug: string; name: string; priceCents: number; isActive: boolean; featured: boolean; isNew: boolean; isBestseller: boolean; collectionName: string | null; createdAt: Date }>, total: number } = { items: [], total: 0 };

  try {
    products = await api().admin.productsList({ status: "all", limit: 50 });
  } catch (err) {
    console.error("[admin products] Failed to fetch:", err);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500 }}>Products ({products.total})</h2>
        <a href="/admin/products/new" style={{ padding: "0.75rem 1.5rem", background: "var(--clay)", color: "var(--bg)", fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          + New Product
        </a>
      </div>

      {products.items.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "2rem 0" }}>No products found. Run <code style={{ color: "var(--clay)" }}>pnpm db:seed</code> to load the catalog.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Name</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Collection</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Price</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Badges</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.items.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{product.name}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--ink-2)" }}>{product.collectionName ?? "—"}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>{formatPrice(product.priceCents)}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {product.featured && <span style={{ fontSize: 10, padding: "0.15rem 0.5rem", background: "var(--bg-2)", marginRight: "0.25rem" }}>Featured</span>}
                    {product.isNew && <span style={{ fontSize: 10, padding: "0.15rem 0.5rem", background: "var(--ink)", color: "var(--bg)", marginRight: "0.25rem" }}>New</span>}
                    {product.isBestseller && <span style={{ fontSize: 10, padding: "0.15rem 0.5rem", background: "var(--clay)", color: "var(--bg)" }}>Bestseller</span>}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: product.isActive ? "var(--sage)" : "var(--muted)" }}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <a href={`/products/${product.slug}`} style={{ fontSize: 12, color: "var(--clay)", marginRight: "0.75rem" }}>View</a>
                    <a href={`/admin/products/${product.id}`} style={{ fontSize: 12, color: "var(--ink-2)" }}>Edit</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
