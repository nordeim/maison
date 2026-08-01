/**
 * Maison — Gift cards form (Client Component)
 *
 * Extracted from `apps/web/src/app/(shop)/gift-cards/page.tsx` so the page
 * can be a Server Component that exports `metadata` (Next.js 16 forbids
 * `metadata` export from Client Components).
 *
 * Customers can purchase digital gift cards ($25–$1000) for recipients.
 * Uses tRPC giftCards.purchase mutation.
 *
 * Per REMEDIATION_PLAN_v5 Task 1.5 (F4).
 */

'use client';

import { useState } from 'react';

import { trpc } from '@/lib/trpc/client';
import { formatPrice } from '@/lib/utils';

const PRESET_AMOUNTS = [50, 100, 150, 250, 500];

export function GiftCardsForm() {
  const purchase = trpc.giftCards.purchase.useMutation();
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ code: string } | null>(null);

  const finalAmount = customAmount ? Math.round(parseFloat(customAmount) * 100) : amount * 100;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError('Please enter a valid recipient email.');
      return;
    }

    if (finalAmount < 2500 || finalAmount > 100000) {
      setError('Gift card amount must be between $25 and $1,000.');
      return;
    }

    try {
      const result = await purchase.mutateAsync({
        amountCents: finalAmount,
        recipientEmail,
        recipientName: recipientName || undefined,
        message: message || undefined,
      });
      setSuccess({ code: result.code });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase gift card.');
    }
  };

  if (success) {
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
          Gift card <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>created</em>
        </h1>
        <p style={{ color: 'var(--ink-2)', marginBottom: '2rem' }}>
          Your gift card code is{' '}
          <strong
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              color: 'var(--clay)',
            }}
          >
            {success.code}
          </strong>
          <br />
          It will be activated and emailed to {recipientEmail} once payment is confirmed.
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
          Continue Shopping
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
        Gift Cards
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          marginBottom: '0.5rem',
        }}
      >
        Give the gift of <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>quiet beauty</em>
      </h1>
      <p style={{ color: 'var(--ink-2)', marginBottom: '2rem' }}>
        Digital gift cards delivered by email. No expiry. Redeemable on any piece in our collection.
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
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        {/* Amount selection */}
        <div>
          <label
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.75rem',
              display: 'block',
            }}
          >
            Amount
          </label>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '0.75rem',
            }}
          >
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setAmount(amt);
                  setCustomAmount('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border:
                    !customAmount && amount === amt
                      ? '2px solid var(--clay)'
                      : '1px solid var(--line)',
                  background:
                    !customAmount && amount === amt ? 'rgba(168,107,74,0.05)' : 'var(--bg-card)',
                  color: 'var(--ink)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                ${amt}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>$</span>
            <input
              type="number"
              min="25"
              max="1000"
              step="5"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
              }}
              placeholder="Custom amount ($25–$1000)"
              style={{
                flex: 1,
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--line)',
                background: 'var(--bg-card)',
                fontSize: 14,
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: '0.5rem' }}>
            Selected: {formatPrice(finalAmount)}
          </p>
        </div>

        {/* Recipient */}
        <div>
          <label
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.3rem',
              display: 'block',
            }}
          >
            Recipient Email *
          </label>
          <input
            type="email"
            required
            value={recipientEmail}
            onChange={(e) => {
              setRecipientEmail(e.target.value);
            }}
            placeholder="recipient@email.com"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--line)',
              background: 'var(--bg-card)',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.3rem',
              display: 'block',
            }}
          >
            Recipient Name (optional)
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => {
              setRecipientName(e.target.value);
            }}
            placeholder="Jane Doe"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--line)',
              background: 'var(--bg-card)',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '0.3rem',
              display: 'block',
            }}
          >
            Gift Message (optional)
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            maxLength={500}
            placeholder="A personal note for the recipient…"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--line)',
              background: 'var(--bg-card)',
              fontSize: 14,
              resize: 'vertical',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={purchase.isPending}
          style={{
            padding: '0.95rem 1.75rem',
            background: 'var(--clay)',
            color: 'var(--bg)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: purchase.isPending ? 'wait' : 'pointer',
          }}
        >
          {purchase.isPending ? 'Processing…' : `Purchase — ${formatPrice(finalAmount)}`}
        </button>
      </form>
    </main>
  );
}
