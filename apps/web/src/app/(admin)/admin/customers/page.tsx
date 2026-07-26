/**
 * Maison — Admin customers page (Server Component)
 */

import { api } from "@/lib/trpc/server";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  let customers: { items: Array<{ id: string; userId: string; email: string; firstName: string | null; lastName: string | null; newsletterSubscribed: boolean; createdAt: Date }>, total: number } = { items: [], total: 0 };

  try {
    customers = await api().admin.customersList({ limit: 50 });
  } catch (err) {
    console.error("[admin customers] Failed to fetch:", err);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Customers ({customers.total})</h2>

      {customers.items.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "2rem 0" }}>No customers yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Name</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Email</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Newsletter</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.items.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>
                    {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--ink-2)" }}>{customer.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ fontSize: 11, color: customer.newsletterSubscribed ? "var(--sage)" : "var(--muted)" }}>
                      {customer.newsletterSubscribed ? "Subscribed" : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--muted)" }}>{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
