/**
 * Maison — Discount manager (Client Component)
 *
 * Displays discount codes in a table + create form.
 * Calls tRPC admin.discountsCreate + admin.discountsDeactivate.
 */

"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { formatPrice } from "@/lib/utils";

interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderCents: number;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
}

export function DiscountManager({ initialDiscounts }: { initialDiscounts: Discount[] }) {
  const createDiscount = trpc.admin.discountsCreate.useMutation();
  const deactivateDiscount = trpc.admin.discountsDeactivate.useMutation();
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed" | "free_shipping",
    value: "",
    minOrderCents: "",
    maxUses: "",
  });
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.code || !form.value) {
      setError("Code and value are required.");
      return;
    }

    const value = parseInt(form.value, 10);
    if (isNaN(value) || value < 0) {
      setError("Value must be a positive number.");
      return;
    }

    if (form.type === "percentage" && (value < 0 || value > 100)) {
      setError("Percentage must be between 0 and 100.");
      return;
    }

    try {
      await createDiscount.mutateAsync({
        code: form.code,
        type: form.type,
        value,
        minOrderCents: form.minOrderCents ? Math.round(parseFloat(form.minOrderCents) * 100) : 0,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
      });
      utils.admin.discountsList.invalidate();
      setForm({ code: "", type: "percentage", value: "", minOrderCents: "", maxUses: "" });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create discount.");
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this discount code? It will no longer be usable.")) return;
    await deactivateDiscount.mutateAsync({ id });
    utils.admin.discountsList.invalidate();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{initialDiscounts.length} discount codes</p>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "0.5rem 1rem", background: "var(--clay)", color: "var(--bg)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
          {showForm ? "Cancel" : "+ New Code"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ padding: "1.5rem", background: "var(--bg-2)", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", fontWeight: 500 }}>Create Discount Code</h3>
          {error && <p style={{ fontSize: "0.875rem", color: "var(--clay)" }}>{error}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Code *</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER10" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14, fontFamily: "var(--font-mono)", textTransform: "uppercase" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Value * {form.type === "percentage" ? "(%)" : form.type === "fixed" ? "($)" : "(n/a)"}</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} disabled={form.type === "free_shipping"} placeholder={form.type === "percentage" ? "10" : form.type === "fixed" ? "25" : "—"} style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Min Order ($)</label>
              <input type="number" step="0.01" value={form.minOrderCents} onChange={(e) => setForm({ ...form, minOrderCents: e.target.value })} placeholder="0" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Max Uses (blank = unlimited)</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="100" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
            </div>
          </div>
          <button type="submit" style={{ padding: "0.6rem 1.5rem", background: "var(--clay)", color: "var(--bg)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer", alignSelf: "flex-start" }}>
            Create Code
          </button>
        </form>
      )}

      {initialDiscounts.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "2rem 0" }}>No discount codes yet. Click "+ New Code" to create one.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Code</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Type</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Value</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Min Order</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Usage</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialDiscounts.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 500, fontFamily: "var(--font-mono)" }}>{d.code}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--ink-2)" }}>{d.type.replace("_", " ")}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {d.type === "percentage" ? `${d.value}%` : d.type === "fixed" ? formatPrice(d.value) : "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--muted)" }}>{d.minOrderCents > 0 ? formatPrice(d.minOrderCents) : "—"}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--muted)" }}>
                    {d.usesCount}{d.maxUses ? ` / ${d.maxUses}` : ""}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: d.isActive ? "var(--sage)" : "var(--muted)" }}>
                      {d.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {d.isActive && (
                      <button onClick={() => handleDeactivate(d.id)} style={{ fontSize: 12, color: "var(--clay)", background: "none", border: "none", cursor: "pointer" }}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
