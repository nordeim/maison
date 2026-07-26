/**
 * Maison — Admin analytics page (Server Component)
 *
 * Revenue over time (30-day chart), top products, conversion funnel, cohorts.
 */

import { api } from "@/lib/trpc/server";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  let revenue: Array<{ date: string; orderCount: number; revenueCents: number }> = [];
  let topProducts: Array<{ productName: string; productSlug: string; unitsSold: number; revenueCents: number }> = [];
  let funnel: { productViews: number; cartAdds: number; checkouts: number; purchases: number } = { productViews: 0, cartAdds: 0, checkouts: 0, purchases: 0 };
  let cohorts: Array<{ cohortMonth: string; newCustomers: number }> = [];

  try {
    [revenue, topProducts, funnel, cohorts] = await Promise.all([
      api().admin.analyticsRevenue({ days: 30 }),
      api().admin.analyticsTopProducts({ limit: 10 }),
      api().admin.analyticsFunnel(),
      api().admin.analyticsCohorts(),
    ]);
  } catch (err) {
    console.error("[admin analytics] Failed to fetch:", err);
  }

  const totalRevenue30d = revenue.reduce((sum, r) => sum + r.revenueCents, 0);
  const totalOrders30d = revenue.reduce((sum, r) => sum + r.orderCount, 0);
  const maxRevenue = Math.max(...revenue.map((r) => r.revenueCents), 1);

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Analytics</h2>

      {/* Summary KPIs */}
      <div className="analytics-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ padding: "1.25rem", border: "1px solid var(--line)", background: "var(--bg-card)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Revenue (30d)</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginTop: "0.4rem" }}>{formatPrice(totalRevenue30d)}</p>
        </div>
        <div style={{ padding: "1.25rem", border: "1px solid var(--line)", background: "var(--bg-card)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Orders (30d)</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginTop: "0.4rem" }}>{totalOrders30d}</p>
        </div>
        <div style={{ padding: "1.25rem", border: "1px solid var(--line)", background: "var(--bg-card)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Cart Adds</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginTop: "0.4rem" }}>{funnel.cartAdds}</p>
        </div>
        <div style={{ padding: "1.25rem", border: "1px solid var(--line)", background: "var(--bg-card)" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Purchases</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginTop: "0.4rem" }}>{funnel.purchases}</p>
        </div>
      </div>

      {/* Revenue chart (CSS bars) */}
      <div style={{ marginBottom: "3rem" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>Revenue — Last 30 Days</h3>
        {revenue.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No revenue data yet.</p>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 200, padding: "1rem 0", borderBottom: "1px solid var(--line)" }}>
            {revenue.map((r) => (
              <div
                key={r.date}
                title={`${formatDate(r.date)}: ${formatPrice(r.revenueCents)} (${r.orderCount} orders)`}
                style={{
                  flex: 1,
                  height: `${(r.revenueCents / maxRevenue) * 100}%`,
                  background: "var(--clay)",
                  minHeight: 2,
                  transition: "height 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="analytics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Top products */}
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>Top Products</h3>
          {topProducts.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No sales data yet.</p>
          ) : (
            <div style={{ borderTop: "1px solid var(--line)" }}>
              {topProducts.map((p, i) => (
                <div key={p.productSlug} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--line-soft)" }}>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{i + 1}. {p.productName}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{p.unitsSold} units sold</p>
                  </div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{formatPrice(p.revenueCents)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer cohorts */}
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>New Customers by Month</h3>
          {cohorts.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No customer data yet.</p>
          ) : (
            <div style={{ borderTop: "1px solid var(--line)" }}>
              {cohorts.map((c) => (
                <div key={c.cohortMonth} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--line-soft)" }}>
                  <p style={{ fontSize: "0.875rem" }}>{formatDate(c.cohortMonth)}</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{c.newCustomers} new</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .analytics-kpis { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 768px) { .analytics-kpis { grid-template-columns: 1fr !important; } .analytics-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
