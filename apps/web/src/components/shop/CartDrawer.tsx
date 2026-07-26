/**
 * Maison — Cart drawer (Client Component)
 *
 * Slide-in panel from the right. Shows cart line items with
 * quantity selectors, remove buttons, subtotal, free-shipping bar,
 * and "Proceed to Checkout" CTA.
 *
 * Reads from CartProvider context.
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD_CENTS = 15000;

export function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    items,
    itemCount,
    subtotalCents,
    updateItemQuantity,
    removeItem,
    isLoading,
  } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  const freeShippingProgress = Math.min(100, (subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(31,27,23,0.4)",
      }}
      onClick={closeDrawer}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "min(100vw, 420px)",
          height: "100vh",
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.5rem",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500 }}>
            Shopping Bag ({itemCount})
          </h2>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Free shipping bar */}
        {itemCount > 0 && (
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--line-soft)" }}>
            <p style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: "0.5rem" }}>
              {remainingForFreeShipping > 0 ? (
                <>Spend <strong>{formatPrice(remainingForFreeShipping)}</strong> more for free shipping</>
              ) : (
                <strong style={{ color: "var(--clay)" }}>✓ You've unlocked free shipping</strong>
              )}
            </p>
            <div style={{ height: 3, background: "var(--line)", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${freeShippingProgress}%`,
                  background: "var(--clay)",
                  transition: "width 0.45s var(--ease-maison)",
                }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 1.5rem" }}>
          {isLoading ? (
            <p style={{ padding: "3rem 0", textAlign: "center", color: "var(--muted)" }}>Loading…</p>
          ) : items.length === 0 ? (
            <div style={{ padding: "3rem 0", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--ink)", marginBottom: "1rem" }}>
                Your bag is empty
              </p>
              <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
                Discover pieces made with care.
              </p>
              <Link
                href="/products"
                onClick={closeDrawer}
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
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
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1.25rem 0",
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 90,
                    background: "var(--bg-2)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                    {item.productName}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--ink-2)", marginBottom: "0.5rem" }}>
                    {formatPrice(item.priceCents, item.currency)}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)" }}>
                      <button
                        onClick={() => updateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                        style={{ width: 28, height: 28, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--ink)" }}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span style={{ width: 28, textAlign: "center", fontSize: 14 }}>{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        style={{ width: 28, height: 28, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--ink)" }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                  {formatPrice(item.priceCents * item.quantity, item.currency)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "1.5rem", borderTop: "1px solid var(--line)", background: "var(--bg-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Subtotal</span>
              <span style={{ fontSize: 16, fontWeight: 500 }}>{formatPrice(subtotalCents)}</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: "1rem" }}>
              Shipping & taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
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
            <button
              onClick={closeDrawer}
              style={{
                display: "block",
                width: "100%",
                padding: "0.75rem",
                background: "none",
                border: "none",
                color: "var(--ink-2)",
                fontSize: 12,
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
