/**
 * Maison — Admin layout (RBAC guard — Layer 2)
 *
 * Per PROJECT-ARCHITECTURE.md §6.3: this is the actual security boundary
 * for the admin route group. proxy.ts only checks cookie existence;
 * this layout validates the session AND checks RBAC role (staff/admin).
 *
 * If no valid session: redirect to /auth/sign-in.
 * If session role is "customer": render 403 Forbidden.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, canReadAdmin } from "@maison/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in?callbackUrl=/admin");
  }

  if (!canReadAdmin(session.user.role)) {
    return (
      <main
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <p className="eyebrow">403 — Forbidden</p>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 400,
          }}
        >
          You don't have access to this <em style={{ color: "#a86b4a" }}>area</em>.
        </h1>
        <p style={{ color: "#4a433b", marginTop: "1rem" }}>
          This section requires staff or admin privileges.
        </p>
      </main>
    );
  }

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <header style={{ marginBottom: "3rem" }}>
        <p className="eyebrow">Admin</p>
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 400 }}>
          Maison <em style={{ color: "#a86b4a" }}>back-office</em>
        </h1>
      </header>

      <nav
        style={{
          display: "flex",
          gap: "2rem",
          marginBottom: "3rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #e5ddd1",
          flexWrap: "wrap",
        }}
      >
        <a href="/admin" style={{ fontSize: "0.875rem", color: "#1f1b17", borderBottom: "1px solid #1f1b17", paddingBottom: "2px" }}>Dashboard</a>
        <a href="/admin/products" style={{ fontSize: "0.875rem", color: "#4a433b" }}>Products</a>
        <a href="/admin/orders" style={{ fontSize: "0.875rem", color: "#4a433b" }}>Orders</a>
        <a href="/admin/customers" style={{ fontSize: "0.875rem", color: "#4a433b" }}>Customers</a>
        <a href="/admin/inventory" style={{ fontSize: "0.875rem", color: "#4a433b" }}>Inventory</a>
        <a href="/admin/discounts" style={{ fontSize: "0.875rem", color: "#4a433b" }}>Discounts</a>
        <a href="/admin/reviews" style={{ fontSize: "0.875rem", color: "#4a433b" }}>Reviews</a>
        <a href="/admin/trade" style={{ fontSize: "0.875rem", color: "#4a433b" }}>Trade</a>
        <a href="/admin/analytics" style={{ fontSize: "0.875rem", color: "#4a433b" }}>Analytics</a>
      </nav>

      {children}
    </div>
  );
}
