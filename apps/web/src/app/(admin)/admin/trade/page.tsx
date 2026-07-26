/**
 * Maison — Admin trade applications (Server Component + Client actions)
 */

import { api } from "@/lib/trpc/server";
import { formatDate } from "@/lib/utils";
import { TradeActions } from "@/components/admin/TradeActions";

export default async function AdminTradePage() {
  let applications: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    role: string;
    website: string | null;
    instagram: string | null;
    projectTypes: string | null;
    discountPercent: number;
    status: string;
    createdAt: Date;
  }> = [];

  try {
    applications = await api().trade.list({ status: "all" });
  } catch (err) {
    console.error("[admin trade] Failed to fetch:", err);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Trade Applications ({applications.length})</h2>

      {applications.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "2rem 0" }}>No trade applications yet.</p>
      ) : (
        <div>
          {applications.map((app) => (
            <div key={app.id} style={{ padding: "1.5rem", border: "1px solid var(--line)", background: "var(--bg-card)", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: "0.9375rem" }}>{app.firstName} {app.lastName}</p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>{app.email} · {formatDate(app.createdAt)}</p>
                </div>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.2rem 0.6rem", background: app.status === "approved" ? "rgba(139,154,130,0.15)" : app.status === "rejected" ? "rgba(168,107,74,0.15)" : "rgba(196,162,101,0.15)", color: app.status === "approved" ? "var(--sage)" : app.status === "rejected" ? "var(--clay)" : "var(--warning)" }}>
                  {app.status}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.875rem", color: "var(--ink-2)", marginBottom: "1rem" }}>
                <p><strong>Company:</strong> {app.company}</p>
                <p><strong>Role:</strong> {app.role}</p>
                {app.website && <p><strong>Website:</strong> <a href={app.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--clay)" }}>{app.website}</a></p>}
                {app.instagram && <p><strong>Instagram:</strong> {app.instagram}</p>}
                {app.projectTypes && <p><strong>Project Types:</strong> {app.projectTypes}</p>}
              </div>
              {app.status === "pending" && <TradeActions applicationId={app.id} defaultDiscount={app.discountPercent} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
