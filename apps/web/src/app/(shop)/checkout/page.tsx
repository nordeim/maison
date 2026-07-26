/**
 * Maison — Checkout page (stub — Phase 1)
 *
 * Multi-step: Contact/Shipping → Payment → Review → Confirmation.
 * Stripe Payment Intents with idempotent order creation.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout with Stripe.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "5rem 1.25rem" }}>
      <p className="eyebrow">Checkout</p>
      <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, marginBottom: "2rem" }}>
        Complete your <em style={{ color: "#a86b4a" }}>order</em>
      </h1>
      <p style={{ color: "#8a8178", textAlign: "center", padding: "4rem 0" }}>
        Multi-step checkout (Stripe Payment Intents, address form, order summary) — Phase 1.
      </p>
    </main>
  );
}
