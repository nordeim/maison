/**
 * Maison — Account settings (Client Component)
 *
 * Profile editing (name, phone), newsletter toggle, account deletion (GDPR).
 * Uses tRPC account.updateProfile + account.updateNewsletter.
 *
 * Account deletion is a stub (Phase 2.1 — requires server-side cascade).
 */

"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { authClient } from "@maison/auth/client";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: profile, isLoading } = trpc.account.getProfile.useQuery();
  const updateProfile = trpc.account.updateProfile.useMutation();
  const updateNewsletter = trpc.account.updateNewsletter.useMutation();
  const utils = trpc.useUtils();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
      setPhone(profile.phone ?? "");
      setNewsletterSubscribed(profile.newsletterSubscribed ?? false);
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setProfileSaved(false);

    try {
      await updateProfile.mutateAsync({ firstName, lastName, phone });
      utils.account.getProfile.invalidate();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    }
  };

  const handleNewsletterToggle = async (checked: boolean) => {
    setNewsletterSubscribed(checked);
    try {
      await updateNewsletter.mutateAsync({ subscribed: checked });
      utils.account.getProfile.invalidate();
    } catch (err) {
      setNewsletterSubscribed(!checked); // Revert on error
      console.error("Failed to update newsletter:", err);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This will:\n\n" +
      "• Remove your profile and saved addresses\n" +
      "• Clear your wishlist\n" +
      "• Sign you out immediately\n\n" +
      "Your order history will be retained for 7 years (tax law) with PII stripped.\n\n" +
      "This action CANNOT be undone."
    );
    if (!confirmed) return;

    // Phase 2.1: implement account.deleteAccount tRPC mutation
    // For now, sign out the user
    alert("Account deletion is not yet implemented in this phase. Please contact hello@maison-living.com to request deletion.");
  };

  if (isLoading) {
    return (
      <div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Settings</h2>
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, marginBottom: "1.5rem" }}>Settings</h2>

      {/* Profile */}
      <section style={{ marginBottom: "3rem" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>Profile</h3>
        <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 480 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label>
              <span style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>First Name</span>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
            </label>
            <label>
              <span style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Last Name</span>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
            </label>
          </div>
          <label>
            <span style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Phone</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ display: "block", width: "100%", padding: "0.6rem 0.75rem", border: "1px solid var(--line)", background: "var(--bg-card)", fontSize: 14 }} />
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button type="submit" style={{ padding: "0.6rem 1.5rem", background: "var(--clay)", color: "var(--bg)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
              Save Changes
            </button>
            {profileSaved && <span style={{ fontSize: "0.875rem", color: "var(--sage)" }}>✓ Saved</span>}
            {error && <span style={{ fontSize: "0.875rem", color: "var(--clay)" }}>{error}</span>}
          </div>
        </form>
      </section>

      {/* Email (read-only) */}
      <section style={{ marginBottom: "3rem" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>Email Address</h3>
        <p style={{ fontSize: "0.9375rem", color: "var(--ink-2)" }}>{profile?.email}</p>
        <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "0.5rem" }}>Email cannot be changed. Contact us if you need to update it.</p>
      </section>

      {/* Newsletter */}
      <section style={{ marginBottom: "3rem" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>Newsletter</h3>
        <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
          <input type="checkbox" checked={newsletterSubscribed} onChange={(e) => handleNewsletterToggle(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--clay)" }} />
          <span style={{ fontSize: "0.9375rem", color: "var(--ink-2)" }}>
            Subscribe to <strong>Letters from Maison</strong> — one quiet email a month with new pieces, workshop notes, and early access to small-batch releases.
          </span>
        </label>
      </section>

      {/* Danger zone */}
      <section style={{ padding: "1.5rem", border: "1px solid var(--clay)", background: "rgba(168,107,74,0.05)" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 500, marginBottom: "0.5rem", color: "var(--clay-dark)" }}>Delete Account</h3>
        <p style={{ fontSize: "0.875rem", color: "var(--ink-2)", marginBottom: "1rem", lineHeight: 1.65 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
          Order history is retained for 7 years (tax law) with PII stripped.
        </p>
        <button
          onClick={handleDeleteAccount}
          style={{ padding: "0.6rem 1.5rem", border: "1px solid var(--clay)", background: "transparent", color: "var(--clay)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Delete My Account
        </button>
      </section>
    </div>
  );
}
