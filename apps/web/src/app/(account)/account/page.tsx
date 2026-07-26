/**
 * Maison — Account dashboard (Server Component)
 *
 * Shows customer profile summary, recent orders count, wishlist count.
 */

import { api } from "@/lib/trpc/server";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AccountDashboardPage() {
  let profile: { name: string | null; email: string; firstName: string | null } | null = null;
  let orders: { items: Array<{ orderNumber: string; status: string; totalCents: number; placedAt: Date | null }> } = { items: [] };
  let wishlist: { items: unknown[] } = { items: [] };

  try {
    [profile, orders, wishlist] = await Promise.all([
      api().account.getProfile(),
      api().account.listOrders(),
      api().account.listWishlist(),
    ]);
  } catch (err) {
    console.error("[account] Failed to fetch data:", err);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>
        Dashboard
      </h2>

      <div className="account-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
        <div style={{ padding: "1.5rem", border: "1px solid var(--line)", background: "var(--bg-card)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Total Orders</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 500, marginTop: "0.5rem" }}>{orders.items.length}</p>
        </div>
        <div style={{ padding: "1.5rem", border: "1px solid var(--line)", background: "var(--bg-card)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Wishlist Items</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 500, marginTop: "0.5rem" }}>{wishlist.items.length}</p>
        </div>
        <div style={{ padding: "1.5rem", border: "1px solid var(--line)", background: "var(--bg-card)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Member Since</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginTop: "0.5rem" }}>2026</p>
        </div>
      </div>

      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>Recent Orders</h3>
      {orders.items.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "2rem 0" }}>
          No orders yet.{" "}
          <a href="/products" style={{ color: "var(--clay)", borderBottom: "1px solid var(--clay)" }}>Start shopping →</a>
        </p>
      ) : (
        <div style={{ borderTop: "1px solid var(--line)" }}>
          {orders.items.slice(0, 5).map((order) => (
            <div key={order.orderNumber} style={{ display: "flex", justifyContent: "space-between", padding: "1rem 0", borderBottom: "1px solid var(--line-soft)" }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{order.orderNumber}</p>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{order.placedAt ? formatDate(order.placedAt) : "—"}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 500 }}>{formatPrice(order.totalCents)}</p>
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: order.status === "delivered" ? "var(--sage)" : "var(--clay)" }}>{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@media (max-width: 768px) { .account-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
