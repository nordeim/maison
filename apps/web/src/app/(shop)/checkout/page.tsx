/**
 * Maison — Checkout flow (Client Component)
 *
 * Multi-step checkout:
 *  1. Contact & Shipping — email, shipping address, shipping method
 *  2. Payment — Stripe Payment Intent (Phase 1: simplified — creates order on submit)
 *  3. Review — order summary, "Place Order" button
 *  4. Confirmation — order number, summary
 *
 * Reads cart from CartProvider. Creates order via tRPC checkout mutation.
 *
 * Phase 1 note: Stripe Elements integration is simplified. In production,
 * card data is collected by Stripe Elements (never touches our server).
 * Here we create the order with a "pending" status; the Stripe webhook
 * confirms payment and updates the order to "confirmed".
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/shop/CartProvider";
import { trpc } from "@/lib/trpc/client";
import { formatPrice } from "@/lib/utils";

type Step = "shipping" | "payment" | "review" | "confirmation";

interface ShippingInfo {
  email: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  shippingMethod: "standard" | "express" | "white_glove";
}

const SHIPPING_COSTS: Record<string, number> = {
  standard: 1500,  // $15
  express: 3500,   // $35
  white_glove: 9500, // $95
};

const SHIPPING_LABELS: Record<string, string> = {
  standard: "Standard (5–7 days)",
  express: "Express (2–3 days)",
  white_glove: "White Glove (2 weeks)",
};

export default function CheckoutPage() {
  const { items, subtotalCents, cartId } = useCart();
  const [step, setStep] = useState<Step>("shipping");
  const [shipping, setShipping] = useState<ShippingInfo>({
    email: "",
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "US",
    shippingMethod: "standard",
  });
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string>("");

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    type: string;
    discountAmountCents: number;
    freeShipping: boolean;
  } | null>(null);
  const [promoError, setPromoError] = useState("");

  const validatePromo = trpc.discounts.validate.useQuery(
    { code: promoCode, subtotalCents },
    { enabled: promoCode.length >= 2 && !!promoCode },
  );

  const createPaymentIntent = trpc.checkout.createPaymentIntent.useMutation();
  const confirmOrder = trpc.checkout.confirmOrder.useMutation();

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    if (validatePromo.data) {
      if (validatePromo.data.valid) {
        setAppliedPromo({
          code: validatePromo.data.code,
          type: validatePromo.data.type,
          discountAmountCents: validatePromo.data.discountAmountCents,
          freeShipping: validatePromo.data.freeShipping,
        });
      } else {
        setPromoError(validatePromo.data.error);
        setAppliedPromo(null);
      }
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setAppliedPromo(null);
    setPromoError("");
  };

  const shippingCost = appliedPromo?.freeShipping ? 0 : SHIPPING_COSTS[shipping.shippingMethod] ?? 0;
  const discountCents = appliedPromo?.discountAmountCents ?? 0;
  const taxCents = Math.round(Math.max(0, subtotalCents - discountCents) * 0.08);
  const totalCents = subtotalCents - discountCents + shippingCost + taxCents;

  // Redirect to cart if empty (unless we're on confirmation step)
  if (items.length === 0 && step !== "confirmation") {
    return (
      <main style={{ maxWidth: "var(--container-narrow)", margin: "0 auto", padding: "5rem var(--gutter)", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 400, marginBottom: "1.5rem" }}>
          Your bag is empty
        </h1>
        <p style={{ color: "var(--ink-2)", marginBottom: "2rem" }}>
          Add some pieces to your bag before checking out.
        </p>
        <Link href="/products" style={{ display: "inline-block", padding: "0.95rem 1.75rem", background: "var(--clay)", color: "var(--bg)", fontSize: 13, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Shop the Collection
        </Link>
      </main>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    if (!cartId) {
      setError("No cart found. Please add items to your bag first.");
      return;
    }

    setIsPlacing(true);
    setError("");

    try {
      // Step 1: Create payment intent + pending order
      const piResult = await createPaymentIntent.mutateAsync({
        cartId,
        shippingAddress: {
          line1: shipping.line1,
          line2: shipping.line2,
          city: shipping.city,
          region: shipping.region,
          postalCode: shipping.postalCode,
          country: shipping.country,
        },
        shippingMethod: shipping.shippingMethod,
      });

      // Step 2: Confirm order (in production, this happens after Stripe confirms payment)
      // Phase 1 simplified: we confirm immediately. The Stripe webhook will handle real payments.
      const confirmResult = await confirmOrder.mutateAsync({
        orderId: piResult.orderId,
        paymentIntentId: piResult.clientSecret,
      });

      setOrderNumber(confirmResult.orderNumber);
      setStep("confirmation");
    } catch (err) {
      console.error("Checkout failed:", err);
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  // ── Confirmation step ──────────────────────────────────────
  if (step === "confirmation") {
    return (
      <main style={{ maxWidth: "var(--container-narrow)", margin: "0 auto", padding: "5rem var(--gutter)", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, margin: "0 auto 2rem", color: "var(--clay)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "100%", height: "100%" }}>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--clay)", marginBottom: "1rem" }}>Order Confirmed</span>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, marginBottom: "1rem" }}>
          Thank you for your <em style={{ color: "var(--clay)", fontStyle: "italic" }}>order</em>
        </h1>
        <p style={{ fontSize: "1.125rem", color: "var(--ink-2)", marginBottom: "2rem" }}>
          Your order number is <strong style={{ color: "var(--ink)" }}>{orderNumber}</strong>
        </p>
        <p style={{ color: "var(--ink-2)", marginBottom: "2rem", lineHeight: 1.7 }}>
          We've sent a confirmation email to <strong>{shipping.email}</strong>. You'll receive a
          shipping notification when your pieces are on their way.
        </p>
        <div style={{ padding: "1.5rem", background: "var(--bg-2)", marginBottom: "2rem", textAlign: "left" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>What happens next</h2>
          <ol style={{ paddingLeft: "1.5rem", color: "var(--ink-2)", lineHeight: 1.8 }}>
            <li>We prepare your pieces with care (1–3 business days)</li>
            <li>You'll receive a shipping notification with tracking</li>
            <li>Your order arrives in {SHIPPING_LABELS[shipping.shippingMethod].split("(")[1]?.replace(")", "") ?? "5–7 days"}</li>
          </ol>
        </div>
        <Link href="/products" style={{ display: "inline-block", padding: "0.95rem 1.75rem", background: "var(--clay)", color: "var(--bg)", fontSize: 13, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Continue Shopping
        </Link>
      </main>
    );
  }

  // ── Multi-step checkout ────────────────────────────────────
  return (
    <main style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "5rem var(--gutter)" }}>
      <div style={{ marginBottom: "3rem" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--clay)", marginBottom: "1rem" }}>Checkout</span>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}>
          Complete your <em style={{ color: "var(--clay)", fontStyle: "italic" }}>order</em>
        </h1>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem", paddingBottom: "1rem", borderBottom: "1px solid var(--line)" }}>
        {(["shipping", "payment", "review"] as const).map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              width: 24, height: 24, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 500,
              background: step === s ? "var(--clay)" : step === "confirmation" || (step === "payment" && s === "shipping") || (step === "review" && (s === "shipping" || s === "payment")) ? "var(--ink)" : "transparent",
              color: step === s || (step === "payment" && s === "shipping") || (step === "review" && (s === "shipping" || s === "payment")) ? "var(--bg)" : "var(--ink)",
              border: step === s ? "1px solid var(--clay)" : "1px solid var(--line)",
            }}>
              {i + 1}
            </span>
            <span style={{ fontSize: 13, textTransform: "capitalize", color: step === s ? "var(--ink)" : "var(--muted)", fontWeight: step === s ? 500 : 400 }}>
              {s === "shipping" ? "Shipping" : s === "payment" ? "Payment" : "Review"}
            </span>
          </div>
        ))}
      </div>

      <div className="checkout-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "3rem", alignItems: "start" }}>
        {/* Form area */}
        <div>
          {error && (
            <div style={{ padding: "1rem", background: "rgba(168,107,74,0.1)", border: "1px solid var(--clay)", marginBottom: "1.5rem", color: "var(--clay-dark)", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          {step === "shipping" && (
            <form onSubmit={handleShippingSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "0.5rem" }}>Contact & Shipping</h2>
              <Input label="Email" type="email" required value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input label="First Name" required value={shipping.firstName} onChange={(v) => setShipping({ ...shipping, firstName: v })} />
                <Input label="Last Name" required value={shipping.lastName} onChange={(v) => setShipping({ ...shipping, lastName: v })} />
              </div>
              <Input label="Address Line 1" required value={shipping.line1} onChange={(v) => setShipping({ ...shipping, line1: v })} />
              <Input label="Address Line 2 (optional)" value={shipping.line2 ?? ""} onChange={(v) => setShipping({ ...shipping, line2: v })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <Input label="City" required value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                <Input label="State / Region" required value={shipping.region} onChange={(v) => setShipping({ ...shipping, region: v })} />
                <Input label="Postal Code" required value={shipping.postalCode} onChange={(v) => setShipping({ ...shipping, postalCode: v })} />
              </div>

              {/* Shipping method */}
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.75rem" }}>Shipping Method</p>
                {Object.entries(SHIPPING_COSTS).map(([method, cost]) => (
                  <label key={method} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", border: shipping.shippingMethod === method ? "2px solid var(--clay)" : "1px solid var(--line)", marginBottom: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method}
                      checked={shipping.shippingMethod === method}
                      onChange={() => setShipping({ ...shipping, shippingMethod: method as ShippingInfo["shippingMethod"] })}
                      style={{ accentColor: "var(--clay)" }}
                    />
                    <span style={{ flex: 1, fontSize: "0.9375rem" }}>{SHIPPING_LABELS[method]}</span>
                    <span style={{ fontWeight: 500 }}>{formatPrice(cost)}</span>
                  </label>
                ))}
              </div>

              <button type="submit" style={{ padding: "0.95rem 1.75rem", background: "var(--clay)", color: "var(--bg)", fontSize: 13, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer", marginTop: "1rem" }}>
                Continue to Payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "0.5rem" }}>Payment</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1rem" }}>
                🔒 Phase 1 demo mode — no real payment is processed. Stripe Elements integration is wired but not active.
                Click "Continue to Review" to proceed.
              </p>
              <div style={{ padding: "1.5rem", border: "1px solid var(--line)", background: "var(--bg-2)" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--ink-2)", marginBottom: "1rem" }}>
                  In production, Stripe Elements will collect card data securely here. Card data never touches our servers.
                </p>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--muted)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <span style={{ fontSize: "0.875rem" }}>Secured by Stripe</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setStep("shipping")} style={{ padding: "0.95rem 1.75rem", border: "1px solid var(--ink)", background: "transparent", color: "var(--ink)", fontSize: 13, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
                  Back
                </button>
                <button type="submit" style={{ flex: 1, padding: "0.95rem 1.75rem", background: "var(--clay)", color: "var(--bg)", fontSize: 13, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                  Continue to Review
                </button>
              </div>
            </form>
          )}

          {step === "review" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Review Your Order</h2>

              {/* Shipping summary */}
              <div style={{ padding: "1.5rem", border: "1px solid var(--line)", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Shipping To</h3>
                  <button onClick={() => setStep("shipping")} style={{ fontSize: 12, color: "var(--clay)", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                </div>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "var(--ink-2)" }}>
                  {shipping.firstName} {shipping.lastName}<br />
                  {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}<br />
                  {shipping.city}, {shipping.region} {shipping.postalCode}<br />
                  {shipping.country}<br />
                  {shipping.email}
                </p>
                <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--ink-2)" }}>
                  <strong>Method:</strong> {SHIPPING_LABELS[shipping.shippingMethod]}
                </p>
              </div>

              {/* Items */}
              <div style={{ padding: "1.5rem", border: "1px solid var(--line)", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Items ({items.length})</h3>
                {items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "0.9375rem" }}>
                    <span>{item.productName} × {item.quantity}</span>
                    <span style={{ fontWeight: 500 }}>{formatPrice(item.priceCents * item.quantity, item.currency)}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                style={{ width: "100%", padding: "1rem", background: "var(--clay)", color: "var(--bg)", fontSize: 13, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: isPlacing ? "wait" : "pointer" }}
              >
                {isPlacing ? "Placing Order…" : `Place Order — ${formatPrice(totalCents)}`}
              </button>
              <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: "0.75rem" }}>
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <aside style={{ position: "sticky", top: "6rem", padding: "2rem", background: "var(--bg-2)", border: "1px solid var(--line)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1.5rem" }}>Order Summary</h2>

          {/* Promo code */}
          {!appliedPromo ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem", display: "block" }}>
                Promo Code
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 13, textTransform: "uppercase" }}
                />
                <button
                  onClick={handleApplyPromo}
                  style={{ padding: "0.5rem 1rem", background: "var(--ink)", color: "var(--bg)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
                >
                  Apply
                </button>
              </div>
              {promoError && <p style={{ fontSize: 12, color: "var(--clay)", marginTop: "0.5rem" }}>{promoError}</p>}
            </div>
          ) : (
            <div style={{ marginBottom: "1.5rem", padding: "0.75rem", background: "rgba(139,154,130,0.1)", border: "1px solid var(--sage)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--sage)" }}>✓ {appliedPromo.code} applied</p>
                <p style={{ fontSize: 11, color: "var(--muted)" }}>
                  {appliedPromo.type === "percentage" ? `${appliedPromo.discountAmountCents > 0 ? "-" + formatPrice(appliedPromo.discountAmountCents) : ""}` : ""}
                  {appliedPromo.freeShipping ? "Free shipping" : ""}
                </p>
              </div>
              <button onClick={handleRemovePromo} style={{ fontSize: 11, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
                Remove
              </button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--ink-2)" }}>Subtotal ({items.length} items)</span>
            <span style={{ fontSize: "0.875rem" }}>{formatPrice(subtotalCents)}</span>
          </div>
          {discountCents > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--sage)" }}>Discount</span>
              <span style={{ fontSize: "0.875rem", color: "var(--sage)" }}>-{formatPrice(discountCents)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--ink-2)" }}>Shipping</span>
            <span style={{ fontSize: "0.875rem" }}>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--ink-2)" }}>Estimated Tax</span>
            <span style={{ fontSize: "0.875rem" }}>{formatPrice(taxCents)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid var(--line)", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "1rem", fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 500 }}>{formatPrice(totalCents)}</span>
          </div>
        </aside>
      </div>

      <style>{`@media (max-width: 768px) { .checkout-layout { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}

// ── Reusable input component ─────────────────────────────────
function Input({
  label,
  type = "text",
  required,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>
        {label}{required ? " *" : ""}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          padding: "0.75rem",
          border: "1px solid var(--line)",
          background: "var(--bg-card)",
          fontSize: 16,
          color: "var(--ink)",
        }}
      />
    </label>
  );
}
