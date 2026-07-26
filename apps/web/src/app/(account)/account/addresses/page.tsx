/**
 * Maison — Account addresses (Client Component)
 *
 * Full address book with create/edit/delete forms.
 * Uses tRPC account.listAddresses + account.upsertAddress + account.deleteAddress.
 */

"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { formatPrice } from "@/lib/utils";

interface AddressForm {
  addressId?: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

const EMPTY_FORM: AddressForm = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "US",
  isDefaultShipping: false,
  isDefaultBilling: false,
};

export default function AccountAddressesPage() {
  const { data: addressesData, isLoading } = trpc.account.listAddresses.useQuery();
  const upsertAddress = trpc.account.upsertAddress.useMutation();
  const deleteAddress = trpc.account.deleteAddress.useMutation();
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [error, setError] = useState("");

  const addresses = addressesData?.items ?? [];

  const handleEdit = (addr: typeof addresses[0]) => {
    setForm({
      addressId: addr.id,
      label: addr.label ?? "",
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      region: addr.region ?? "",
      postalCode: addr.postalCode,
      country: addr.country,
      isDefaultShipping: addr.isDefaultShipping,
      isDefaultBilling: addr.isDefaultBilling,
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Delete this address?")) return;
    await deleteAddress.mutateAsync({ addressId });
    utils.account.listAddresses.invalidate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.line1 || !form.city || !form.postalCode) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await upsertAddress.mutateAsync({
        addressId: form.addressId,
        label: form.label || undefined,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        region: form.region,
        postalCode: form.postalCode,
        country: form.country,
        isDefaultShipping: form.isDefaultShipping,
        isDefaultBilling: form.isDefaultBilling,
      });
      utils.account.listAddresses.invalidate();
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500 }}>Saved Addresses</h2>
        {!showForm && (
          <button
            onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }}
            style={{ padding: "0.5rem 1rem", background: "var(--clay)", color: "var(--bg)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
          >
            + Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ padding: "2rem", background: "var(--bg-2)", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500 }}>
            {form.addressId ? "Edit Address" : "New Address"}
          </h3>
          {error && <p style={{ fontSize: "0.875rem", color: "var(--clay)" }}>{error}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Input label="Label (e.g. Home)" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
            <div />
          </div>
          <Input label="Address Line 1 *" required value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
          <Input label="Address Line 2" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <Input label="City *" required value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Input label="State / Region *" required value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
            <Input label="Postal Code *" required value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} />
          </div>
          <Input label="Country (2-letter code) *" required value={form.country} onChange={(v) => setForm({ ...form, country: v.toUpperCase().slice(0, 2) })} />
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
              <input type="checkbox" checked={form.isDefaultShipping} onChange={(e) => setForm({ ...form, isDefaultShipping: e.target.checked })} style={{ accentColor: "var(--clay)" }} />
              Default Shipping
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
              <input type="checkbox" checked={form.isDefaultBilling} onChange={(e) => setForm({ ...form, isDefaultBilling: e.target.checked })} style={{ accentColor: "var(--clay)" }} />
              Default Billing
            </label>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "var(--clay)", color: "var(--bg)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
              {form.addressId ? "Update" : "Save"} Address
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} style={{ padding: "0.75rem 1.5rem", border: "1px solid var(--line)", background: "transparent", color: "var(--ink-2)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : addresses.length === 0 && !showForm ? (
        <p style={{ color: "var(--muted)", padding: "2rem 0" }}>No saved addresses yet. Click "Add Address" to create one.</p>
      ) : (
        <div className="addr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
          {addresses.map((addr) => (
            <div key={addr.id} style={{ padding: "1.5rem", border: "1px solid var(--line)", background: "var(--bg-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                {addr.label && <strong style={{ fontSize: "0.875rem" }}>{addr.label}</strong>}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {addr.isDefaultShipping && <span style={{ fontSize: 10, padding: "0.15rem 0.5rem", background: "var(--bg-2)" }}>Default Shipping</span>}
                  {addr.isDefaultBilling && <span style={{ fontSize: 10, padding: "0.15rem 0.5rem", background: "var(--bg-2)" }}>Default Billing</span>}
                </div>
              </div>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "var(--ink-2)" }}>
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                {addr.city}, {addr.region} {addr.postalCode}<br />
                {addr.country}
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button onClick={() => handleEdit(addr)} style={{ fontSize: 12, color: "var(--clay)", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                <button onClick={() => handleDelete(addr.id)} style={{ fontSize: 12, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@media (max-width: 768px) { .addr-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Input({ label, type = "text", required, value, onChange }: { label: string; type?: string; required?: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14, color: "var(--ink)" }} />
    </label>
  );
}
