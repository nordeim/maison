/**
 * Maison — Account order history (Server Component)
 */

import { api } from "@/lib/trpc/server";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AccountOrdersPage() {
  let orders: { items: Array<{ id: string; orderNumber: string; status: string; totalCents: number; placedAt: Date | null; itemCount: number }> } = { items: [] };

  try {
    orders = await api().account.listOrders();
  } catch (err) {
    console.error("[account orders] Failed to fetch:", err);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>
        Order History
      </h2>

      {orders.items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>You haven't placed any orders yet.</p>
          <a href="/products" style={{ color: "var(--clay)", borderBottom: "1px solid var(--clay)" }}>Start shopping →</a>
        </div>
      ) : (
        <div style={{ borderTop: "1px solid var(--line)" }}>
          {orders.items.map((order) => (
            <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0", borderBottom: "1px solid var(--line-soft)" }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: "1rem", marginBottom: "0.25rem" }}>{order.orderNumber}</p>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  {order.placedAt ? formatDate(order.placedAt) : "—"} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{formatPrice(order.totalCents)}</p>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.2rem 0.6rem", background: order.status === "delivered" ? "rgba(139,154,130,0.15)" : "rgba(168,107,74,0.15)", color: order.status === "delivered" ? "var(--sage)" : "var(--clay)" }}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
