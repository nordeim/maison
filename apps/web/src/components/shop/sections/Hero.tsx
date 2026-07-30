/**
 * Maison — Hero section (full-bleed editorial)
 *
 * Full-viewport hero with Ken Burns background image, eyebrow, serif headline,
 * description, dual CTA, and scroll indicator.
 */

import Image from 'next/image';

export function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        height: '92vh',
        minHeight: 620,
        maxHeight: 920,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        color: 'var(--bg)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image
          src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=2000"
          alt="A sunlit Scandinavian living room with linen armchair and oak side table"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
            animation: 'ken-burns 24s ease-in-out infinite alternate',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(31,27,23,0.35) 0%, rgba(31,27,23,0.15) 35%, rgba(31,27,23,0.55) 100%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 'var(--container)',
          margin: '0 auto',
          padding: '0 var(--gutter)',
          width: '100%',
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(250,248,245,0.85)',
            marginBottom: '1.5rem',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 32,
              height: 1,
              background: 'var(--gold)',
            }}
          />
          Curated for Considered Living
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3rem, 8.5vw, 7.5rem)',
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: '-0.02em',
            color: 'var(--bg)',
            marginBottom: '1.75rem',
            maxWidth: '14ch',
          }}
        >
          Objects of <br />
          <em
            style={{
              fontStyle: 'italic',
              fontWeight: 300,
              color: 'var(--gold)',
            }}
          >
            Quiet Beauty
          </em>
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 1.2vw, 1.125rem)',
            lineHeight: 1.7,
            color: 'rgba(250,248,245,0.92)',
            maxWidth: '52ch',
            marginBottom: '2.5rem',
            fontWeight: 300,
          }}
        >
          Handcrafted home goods, sculptural lighting, and tactile lifestyle pieces — made by Nordic
          artisans from solid oak, linen, and clay, designed to bring warmth and intention to
          everyday moments.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.95rem 1.75rem',
              background: 'var(--bg)',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              transition: 'all 0.45s var(--ease-maison)',
            }}
          >
            Shop the Collection
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
          <a
            href="/about"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.95rem 1.75rem',
              border: '1px solid rgba(250,248,245,0.5)',
              color: 'var(--bg)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              transition: 'all 0.45s var(--ease-maison)',
            }}
          >
            Our Craft
          </a>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'rgba(250,248,245,0.7)',
          fontSize: 10,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
        }}
        aria-hidden="true"
      >
        <span>Scroll</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: 'scroll-hint 2.4s ease-in-out infinite' }}
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
