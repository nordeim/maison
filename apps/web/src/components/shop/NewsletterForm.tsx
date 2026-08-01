/**
 * Maison — Newsletter signup form (Client Component)
 *
 * Dark section ("Letters from Maison"). Email capture with validation.
 * Calls tRPC newsletter.subscribe mutation. Shows toast on success.
 */

'use client';

import { useState } from 'react';

import { trpc } from '@/lib/trpc/client';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const subscribe = trpc.newsletter.subscribe.useMutation();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      await subscribe.mutateAsync({ email, source: 'newsletter_section' });
      setStatus('success');
      setMessage('Thank you for subscribing to Letters from Maison.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section
      style={{
        background: 'var(--bg-dark)',
        color: 'var(--bg)',
        padding: 'clamp(64px, 9vw, 110px) 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-narrow)',
          margin: '0 auto',
          padding: '0 var(--gutter)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '1rem',
          }}
        >
          Join the List
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 400,
            color: 'var(--bg)',
            marginBottom: '1.25rem',
            lineHeight: 1.05,
          }}
        >
          Letters from{' '}
          <em
            style={{
              color: 'var(--gold)',
              fontStyle: 'italic',
              fontWeight: 300,
            }}
          >
            Maison
          </em>
          .
        </h2>
        <p
          style={{
            fontSize: '1.0625rem',
            lineHeight: 1.7,
            color: 'rgba(250,248,245,0.75)',
            marginBottom: '2.5rem',
            maxWidth: '50ch',
            marginLeft: 'auto',
            marginRight: 'auto',
            fontWeight: 300,
          }}
        >
          One quiet email a month — new pieces, workshop notes, artisan interviews, and early access
          to small-batch releases. No noise, no clutter, ever.
        </p>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          style={{
            display: 'flex',
            maxWidth: 480,
            margin: '0 auto 1.25rem',
            borderBottom: '1px solid rgba(250,248,245,0.3)',
            transition: 'border-color 0.45s var(--ease-maison)',
          }}
        >
          <input
            type="email"
            placeholder="Your email address"
            required
            aria-label="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            disabled={status === 'loading'}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '1rem 0',
              color: 'var(--bg)',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              background: 'transparent',
              color: 'var(--gold)',
              padding: '0 1.25rem',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 500,
              cursor: status === 'loading' ? 'wait' : 'pointer',
              border: 'none',
            }}
          >
            {status === 'loading' ? '…' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p
            style={{
              fontSize: 13,
              color: status === 'success' ? 'var(--gold)' : 'rgba(250,248,245,0.6)',
              maxWidth: '100%',
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            fontSize: 11,
            color: 'rgba(250,248,245,0.5)',
            marginTop: '0.5rem',
          }}
        >
          By subscribing you agree to our privacy policy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
