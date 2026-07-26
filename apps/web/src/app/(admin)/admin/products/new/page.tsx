/**
 * Maison — Admin: Create product (Client Component)
 *
 * Form for creating a new product. Calls tRPC admin.productsCreate mutation.
 * Phase 2: basic fields (name, slug, price, collection, description, materials).
 * Phase 3: image upload (Cloudflare Images), variants, SEO fields.
 */

"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

export default function AdminNewProductPage() {
  const router = useRouter();
  const createProduct = trpc.admin.productsCreate.useMutation();
  const { data: collectionsData } = trpc.collections.list.useQuery();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    priceCents: "",
    collectionId: "",
    shortDescription: "",
    longDescription: "",
    materials: "",
    dimensions: "",
  });
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const collections = collectionsData ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.slug || !form.priceCents) {
      setError("Name, slug, and price are required.");
      return;
    }

    const priceCents = Math.round(parseFloat(form.priceCents) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    setIsCreating(true);
    try {
      await createProduct.mutateAsync({
        name: form.name,
        slug: form.slug,
        priceCents,
        collectionId: form.collectionId || undefined,
        shortDescription: form.shortDescription || undefined,
        longDescription: form.longDescription || undefined,
        materials: form.materials || undefined,
        dimensions: form.dimensions || undefined,
      });
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product.");
    } finally {
      setIsCreating(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setForm({
      ...form,
      name: value,
      slug: form.slug || value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500 }}>New Product</h2>
        <a href="/admin/products" style={{ fontSize: 12, color: "var(--ink-2)" }}>← Back to products</a>
      </div>

      {error && <div style={{ padding: "0.75rem 1rem", background: "rgba(168,107,74,0.1)", border: "1px solid var(--clay)", marginBottom: "1.5rem", color: "var(--clay-dark)", fontSize: "0.875rem" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 640 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Name *</label>
          <input type="text" required value={form.name} onChange={(e) => handleNameChange(e.target.value)} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Slug * (URL identifier)</label>
          <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14, fontFamily: "var(--font-mono)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Price (USD) *</label>
            <input type="number" step="0.01" min="0" required value={form.priceCents} onChange={(e) => setForm({ ...form, priceCents: e.target.value })} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Collection</label>
            <select value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }}>
              <option value="">— None —</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Short Description (card display)</label>
          <input type="text" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Long Description (PDP)</label>
          <textarea rows={5} value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14, resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Materials</label>
            <input type="text" value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} placeholder="e.g. Solid oak, natural oil finish" style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Dimensions</label>
            <input type="text" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g. H 74cm × W 78cm × D 82cm" style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit" disabled={isCreating} style={{ padding: "0.75rem 1.5rem", background: "var(--clay)", color: "var(--bg)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: isCreating ? "wait" : "pointer" }}>
            {isCreating ? "Creating…" : "Create Product"}
          </button>
          <a href="/admin/products" style={{ padding: "0.75rem 1.5rem", border: "1px solid var(--line)", color: "var(--ink-2)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", display: "inline-flex", alignItems: "center" }}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
