/**
 * Maison — Shopping bag page (stub — Phase 1)
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Bag",
  description: "Review your selected pieces.",
};

export default function CartPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "5rem 1.25rem" }}>
      <p className="eyebrow">Shopping Bag</p>
      <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, marginBottom: "2rem" }}>
        Your <em style={{ color: "#a86b4a" }}>bag</em>
      </h1>
      <p style={{ color: "#8a8178", textAlign: "center", padding: "4rem 0" }}>
        Your bag is empty.{" "}
        <a href="/products" style={{ color: "#a86b4a", borderBottom: "1px solid #a86b4a" }}>
          Shop the collection
        </a>
      </p>
    </main>
  );
}
