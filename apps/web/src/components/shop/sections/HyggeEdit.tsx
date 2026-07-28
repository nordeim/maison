/**
 * Maison — Hygge Edit (full-bleed editorial)
 */

import Image from 'next/image';

export function HyggeEdit() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        color: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80"
          alt="A warm, dimly lit Scandinavian living room at dusk"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(135deg, rgba(31,27,23,0.65) 0%, rgba(31,27,23,0.35) 60%, rgba(31,27,23,0.5) 100%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 'var(--container)',
          margin: '0 auto',
          padding: '4rem var(--gutter)',
          width: '100%',
        }}
      >
        <div style={{ maxWidth: 540 }}>
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
            The Hygge Edit
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
              fontWeight: 500,
              color: 'var(--bg)',
              marginBottom: '1.5rem',
              lineHeight: 1.05,
            }}
          >
            A room is a{' '}
            <em
              style={{
                color: 'var(--gold)',
                fontStyle: 'italic',
                fontWeight: 300,
              }}
            >
              feeling
            </em>
            .
          </h2>
          <p
            style={{
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              color: 'rgba(250,248,245,0.9)',
              marginBottom: '2rem',
              fontWeight: 300,
              maxWidth: '48ch',
            }}
          >
            For autumn we&apos;ve gathered pieces that ask you to slow down — a low-slung chair, a
            heavy linen throw, a lamp that throws soft amber light across the floor. The Hygge Edit
            is a small, deliberate collection for the season of turning inward.
          </p>
          <a
            href="/products?collection=seasonal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.95rem 1.75rem',
              background: 'var(--gold)',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              transition: 'all 0.45s var(--ease-maison)',
            }}
          >
            Shop the Hygge Edit
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
