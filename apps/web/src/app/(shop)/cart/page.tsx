/**
 * Maison — Shopping bag page (Client Component)
 *
 * Full-page cart view with line items, quantity selectors, subtotal,
 * free-shipping bar, and "Proceed to Checkout" CTA.
 *
 * Reads from CartProvider context.
 */

"use client";

import Link from "next/link";
import { useCart } from "@/components/shop/CartProvider";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD_CENTS = 15000;

export default function CartPage() {
  const { items, itemCount, subtotalCents, updateItemQuantity, removeItem, isLoading } = useCart();

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  const freeShippingProgress = Math.min(100, (subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100);

  if (isLoading) {
    return (
      <main style={{ maxWidth: "var(--container-narrow)", margin: "0 auto", padding: "5rem var(--gutter)" }}>
        <p style={{ color: "var(--muted)", textAlign: "center" }}>Loading your bag…</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main style={{ maxWidth: "var(--container-narrow)", margin: "0 auto", padding: "5rem var(--gutter)", textAlign: "center" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--clay)", marginBottom: "1rem" }}>Shopping Bag</span>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, marginBottom: "2rem" }}>
          Your <em style={{ color: "var(--clay)", fontStyle: "italic" }}>bag</em> is empty
        </h1>
        <p style={{ color: "var(--ink-2)", marginBottom: "2rem" }}>
          Discover pieces made with care — each one crafted to last a lifetime.
        </p>
        <Link
          href="/products"
          style={{
            display: "inline-block",
            padding: "0.95rem 1.75rem",
            background: "var(--clay)",
            color: "var(--bg)",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Shop the Collection
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "5rem var(--gutter)" }}>
      <div style={{ marginBottom: "3rem" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--clay)", marginBottom: "1rem" }}>Shopping Bag</span>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}>
          Your <em style={{ color: "var(--clay)", fontStyle: "italic" }}>bag</em> ({itemCount})
        </h1>
      </div>

      <div className="cart-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "3rem", alignItems: "start" }}>
        {/* Line items */}
        <div>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "1.5rem",
                padding: "1.5rem 0",
                borderBottom: "1px solid var(--line-soft)",
              }}
            >
              <Link href={`/products/${item.productSlug}`} style={{ width: 96, height: 120, background: "var(--bg-2)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/products/${item.productSlug}`}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                    {item.productName}
                  </h3>
                </Link>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  {formatPrice(item.priceCents, item.currency)} each
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)" }}>
                    <button
                      onClick={() => updateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                      style={{ width: 32, height: 32, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--ink)" }}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span style={{ width: 32, textAlign: "center", fontSize: 14 }}>{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      style={{ width: 32, height: 32, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--ink)" }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p style={{ fontSize: "1rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                {formatPrice(item.priceCents * item.quantity, item.currency)}
              </p>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <aside style={{ position: "sticky", top: "6rem", padding: "2rem", background: "var(--bg-2)", border: "1px solid var(--line)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>
            Order Summary
          </h2>

          {/* Free shipping bar */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: "0.5rem" }}>
              {remainingForFreeShipping > 0 ? (
                <>Spend <strong>{formatPrice(remainingForFreeShipping)}</strong> more for free shipping</>
              ) : (
                <strong style={{ color: "var(--clay)" }}>✓ You've unlocked free shipping</strong>
              )}
            </p>
            <div style={{ height: 3, background: "var(--line)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${freeShippingProgress}%`, background: "var(--clay)", transition: "width 0.45s var(--ease-maison)" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.9375rem", color: "var(--ink-2)" }}>Subtotal</span>
            <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>{formatPrice(subtotalCents)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.9375rem", color: "var(--ink-2)" }}>Shipping</span>
            <span style={{ fontSize: "0.9375rem", color: "var(--muted)" }}>Calculated at checkout</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid var(--line)", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "1rem", fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 500 }}>{formatPrice(subtotalCents)}</span>
          </div>

          <Link
            href="/checkout"
            style={{
              display: "block",
              padding: "0.95rem",
              background: "var(--clay)",
              color: "var(--bg)",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            style={{
              display: "block",
              padding: "0.75rem",
              color: "var(--ink-2)",
              fontSize: 12,
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            Continue Shopping
          </Link>
        </aside>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
