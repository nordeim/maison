/**
 * Maison — Admin dashboard (stub — Phase 1)
 */

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>
        Dashboard
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {[
          { label: "Today's Revenue", value: "—" },
          { label: "Today's Orders", value: "—" },
          { label: "AOV", value: "—" },
          { label: "Conversion Rate", value: "—" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              padding: "1.5rem",
              border: "1px solid #e5ddd1",
              background: "#ffffff",
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8178" }}>
              {kpi.label}
            </p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 500, marginTop: "0.5rem" }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>
      <p style={{ color: "#8a8178", marginTop: "2rem" }}>
        Full admin dashboard (KPI charts, recent orders, low-stock alerts) — Phase 1.
      </p>
    </div>
  );
}
