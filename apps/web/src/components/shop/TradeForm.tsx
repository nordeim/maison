/**
 * Maison — Trade program application form (Client Component)
 *
 * Extracted from `apps/web/src/app/(shop)/trade/page.tsx` so the page
 * can be a Server Component that exports `metadata`.
 *
 * Form for interior designers/trade professionals to apply for the trade program.
 * Calls tRPC trade.submitApplication mutation. Shows status if already applied.
 *
 * Per REMEDIATION_PLAN_v5 Task 1.5 (F4).
 */

'use client';

import { useState } from 'react';

import { useSession } from '@maison/auth/client';

import { trpc } from '@/lib/trpc/client';

export function TradeForm() {
  const { data: session } = useSession();
  // Skip the protected `trade.myStatus` query when unauthenticated.
  // Without `enabled: !!session`, the query retries 3x with exponential
  // backoff (~7 seconds) before erroring, leaving unauthenticated visitors
  // stuck on "Loading…". Mirrors the WishlistButton.tsx:52 pattern.
  const { data: existingApp, isLoading } = trpc.trade.myStatus.useQuery(undefined, {
    enabled: !!session,
  });
  const applyMutation = trpc.trade.submitApplication.useMutation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    role: 'Interior Designer',
    website: '',
    instagram: '',
    projectTypes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    if (!form.firstName || !form.lastName || !form.company) {
      setError('First name, last name, and company are required.');
      return;
    }

    try {
      await applyMutation.mutateAsync(form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application.');
    }
  };

  if (isLoading) {
    return (
      <main
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '5rem var(--gutter)',
        }}
      >
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      </main>
    );
  }

  if (success || existingApp?.status === 'pending') {
    return (
      <main
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '5rem var(--gutter)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            margin: '0 auto 2rem',
            color: 'var(--sage)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ width: '100%', height: '100%' }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 400,
            marginBottom: '1rem',
          }}
        >
          Application <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>submitted</em>
        </h1>
        <p style={{ color: 'var(--ink-2)', marginBottom: '2rem' }}>
          Thank you for your interest in the Maison Trade Program. We review applications within 2–3
          business days. You&apos;ll receive an email notification once your application has been
          reviewed.
        </p>
        <a
          href="/account"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'var(--clay)',
            color: 'var(--bg)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Back to Account
        </a>
      </main>
    );
  }

  if (existingApp?.status === 'approved') {
    return (
      <main
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '5rem var(--gutter)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 400,
            marginBottom: '1rem',
          }}
        >
          Trade <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>member</em>
        </h1>
        <p style={{ color: 'var(--ink-2)', marginBottom: '2rem' }}>
          Your trade application has been approved! You receive{' '}
          <strong>{existingApp.discountPercent}% off</strong> all orders. Your discount is
          automatically applied at checkout.
        </p>
        <a
          href="/products"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'var(--clay)',
            color: 'var(--bg)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Shop with Trade Discount
        </a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '5rem var(--gutter)' }}>
      <span
        style={{
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--clay)',
          marginBottom: '1rem',
        }}
      >
        Trade Program
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          marginBottom: '1.5rem',
        }}
      >
        For <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>designers</em> &amp; trade
        professionals
      </h1>
      <p
        style={{
          fontSize: '1.0625rem',
          lineHeight: 1.7,
          color: 'var(--ink-2)',
          marginBottom: '2rem',
        }}
      >
        Interior designers, architects, and stylists receive 10–20% off all orders, priority lead
        times, and a dedicated trade concierge. Apply below — we review within 2–3 business days.
      </p>

      {error && (
        <p
          style={{
            color: 'var(--clay)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}
        >
          <label>
            <span
              style={{
                display: 'block',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '0.3rem',
              }}
            >
              First Name *
            </span>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(e) => {
                setForm({ ...form, firstName: e.target.value });
              }}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--line)',
                background: 'var(--bg-card)',
                fontSize: 14,
              }}
            />
          </label>
          <label>
            <span
              style={{
                display: 'block',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '0.3rem',
              }}
            >
              Last Name *
            </span>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={(e) => {
                setForm({ ...form, lastName: e.target.value });
              }}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--line)',
                background: 'var(--bg-card)',
                fontSize: 14,
              }}
            />
          </label>
        </div>
        <label>
          <span
            style={{
              display: 'block',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.3rem',
            }}
          >
            Company / Studio *
          </span>
          <input
            type="text"
            required
            value={form.company}
            onChange={(e) => {
              setForm({ ...form, company: e.target.value });
            }}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--line)',
              background: 'var(--bg-card)',
              fontSize: 14,
            }}
          />
        </label>
        <label>
          <span
            style={{
              display: 'block',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.3rem',
            }}
          >
            Role
          </span>
          <select
            value={form.role}
            onChange={(e) => {
              setForm({ ...form, role: e.target.value });
            }}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--line)',
              background: 'var(--bg-card)',
              fontSize: 14,
            }}
          >
            <option>Interior Designer</option>
            <option>Architect</option>
            <option>Stylist</option>
            <option>Set Designer</option>
            <option>Buyer</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          <span
            style={{
              display: 'block',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.3rem',
            }}
          >
            Website
          </span>
          <input
            type="url"
            value={form.website}
            onChange={(e) => {
              setForm({ ...form, website: e.target.value });
            }}
            placeholder="https://your-studio.com"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--line)',
              background: 'var(--bg-card)',
              fontSize: 14,
            }}
          />
        </label>
        <label>
          <span
            style={{
              display: 'block',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.3rem',
            }}
          >
            Instagram
          </span>
          <input
            type="text"
            value={form.instagram}
            onChange={(e) => {
              setForm({ ...form, instagram: e.target.value });
            }}
            placeholder="@yourstudio"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--line)',
              background: 'var(--bg-card)',
              fontSize: 14,
            }}
          />
        </label>
        <label>
          <span
            style={{
              display: 'block',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.3rem',
            }}
          >
            Project Types
          </span>
          <input
            type="text"
            value={form.projectTypes}
            onChange={(e) => {
              setForm({ ...form, projectTypes: e.target.value });
            }}
            placeholder="Residential, Commercial, Hospitality"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--line)',
              background: 'var(--bg-card)',
              fontSize: 14,
            }}
          />
        </label>
        <button
          type="submit"
          disabled={applyMutation.isPending}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--clay)',
            color: 'var(--bg)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: applyMutation.isPending ? 'wait' : 'pointer',
            marginTop: '1rem',
          }}
        >
          {applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
        </button>
      </form>
    </main>
  );
}
