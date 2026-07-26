/**
 * Maison — Admin dashboard (Server Component)
 *
 * Shows KPIs (today's revenue, order count, AOV), recent orders, low-stock alerts.
 */

import { api } from "@/lib/trpc/server";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  let overview: {
    todayRevenueCents: number;
    todayOrderCount: number;
    aovCents: number;
    conversionRate: number;
    allTimeRevenueCents: number;
    allTimeOrderCount: number;
    recentOrders: Array<{ id: string; orderNumber: string; email: string; status: string; totalCents: number; placedAt: Date | null }>;
    lowStockVariants: Array<{ id: string; sku: string; name: string; stockQuantity: number; productName: string | null }>;
  } | null = null;

  try {
    overview = await api().admin.overview();
  } catch (err) {
    console.error("[admin dashboard] Failed to fetch:", err);
  }

  if (!overview) {
    return (
      <div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Dashboard</h2>
        <p style={{ color: "var(--muted)" }}>Unable to load dashboard data. Make sure the database is configured and seeded.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Dashboard</h2>

      {/* KPI cards */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
        {[
          { label: "Today's Revenue", value: formatPrice(overview.todayRevenueCents) },
          { label: "Today's Orders", value: String(overview.todayOrderCount) },
          { label: "Average Order Value", value: formatPrice(overview.aovCents) },
          { label: "All-Time Revenue", value: formatPrice(overview.allTimeRevenueCents) },
        ].map((kpi) => (
          <div key={kpi.label} style={{ padding: "1.5rem", border: "1px solid var(--line)", background: "var(--bg-card)" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>{kpi.label}</p>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 500, marginTop: "0.5rem" }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders + Low stock */}
      <div className="admin-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Recent orders */}
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>Recent Orders</h3>
          {overview.recentOrders.length === 0 ? (
            <p style={{ color: "var(--muted)", padding: "1rem 0" }}>No orders yet.</p>
          ) : (
            <div style={{ borderTop: "1px solid var(--line)" }}>
              {overview.recentOrders.map((order) => (
                <div key={order.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--line-soft)" }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>{order.orderNumber}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{order.email} · {order.placedAt ? formatDate(order.placedAt) : "—"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>{formatPrice(order.totalCents)}</p>
                    <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--clay)" }}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock alerts */}
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>Low Stock Alerts</h3>
          {overview.lowStockVariants.length === 0 ? (
            <p style={{ color: "var(--muted)", padding: "1rem 0" }}>All variants well-stocked.</p>
          ) : (
            <div style={{ borderTop: "1px solid var(--line)" }}>
              {overview.lowStockVariants.map((variant) => (
                <div key={variant.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--line-soft)" }}>
                  <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>{variant.productName ?? "Unknown"}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{variant.sku} · {variant.name}</p>
                  <span style={{ fontSize: 11, color: variant.stockQuantity === 0 ? "var(--clay)" : "var(--warning)" }}>
                    {variant.stockQuantity} in stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 768px) { .kpi-grid { grid-template-columns: 1fr !important; } .admin-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
