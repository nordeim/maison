/**
 * Maison — Contact form (Client Component)
 *
 * Extracted from `apps/web/src/app/(shop)/contact/page.tsx` so the page
 * can be a Server Component that exports `metadata` (Next.js 16 forbids
 * `metadata` export from Client Components) AND the form can be wired to
 * the tRPC `contact.submit` mutation.
 *
 * Calls tRPC contact.submit mutation. Shows success/error state inline.
 *
 * Per REMEDIATION_PLAN_v6 Task 1.1 (G1).
 */

'use client';

import { useState } from 'react';

import { trpc } from '@/lib/trpc/client';

export function ContactForm() {
  const submit = trpc.contact.submit.useMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !message) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (message.length < 10) {
      setError('Message must be at least 10 characters.');
      return;
    }

    try {
      await submit.mutateAsync({ name, email, message });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    }
  };

  if (success) {
    return (
      <div
        style={{
          padding: '2.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--line)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            margin: '0 auto 1.5rem',
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
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            fontWeight: 400,
            marginBottom: '1rem',
          }}
        >
          Thank you for <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>writing</em>
        </h2>
        <p style={{ color: 'var(--ink-2)', marginBottom: '2rem' }}>
          We read every email and will reply within 2–3 business days. For urgent trade inquiries,
          please mention &ldquo;trade&rdquo; in your subject line.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
          }}
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'var(--clay)',
            color: 'var(--bg)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {error && (
        <p
          style={{
            color: 'var(--clay)',
            fontSize: '0.875rem',
            padding: '0.75rem 1rem',
            background: 'rgba(168, 107, 74, 0.05)',
            border: '1px solid rgba(168, 107, 74, 0.2)',
          }}
        >
          {error}
        </p>
      )}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '0.3rem',
          }}
          htmlFor="contact-name"
        >
          Your Name *
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder="Jane Doe"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--line)',
            background: 'var(--bg-card)',
            fontSize: 16,
            color: 'var(--ink)',
          }}
        />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '0.3rem',
          }}
          htmlFor="contact-email"
        >
          Your Email *
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="jane@example.com"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--line)',
            background: 'var(--bg-card)',
            fontSize: 16,
            color: 'var(--ink)',
          }}
        />
      </div>
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '0.3rem',
          }}
          htmlFor="contact-message"
        >
          Your Message *
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          placeholder="Questions about a piece, a commission, or a trade inquiry?"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--line)',
            background: 'var(--bg-card)',
            fontSize: 16,
            color: 'var(--ink)',
            resize: 'vertical',
          }}
        />
      </div>
      <button
        type="submit"
        disabled={submit.isPending}
        style={{
          padding: '0.95rem 1.75rem',
          background: 'var(--clay)',
          color: 'var(--bg)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: submit.isPending ? 'wait' : 'pointer',
        }}
      >
        {submit.isPending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
