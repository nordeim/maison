/**
 * Maison — Philosophy section (asymmetric editorial)
 */

import Image from 'next/image';

export function Philosophy() {
  return (
    <section
      style={{
        background: 'var(--bg-2)',
        padding: 'clamp(80px, 11vw, 140px) 0',
      }}
    >
      <div
        className="phil-grid"
        style={{
          maxWidth: 'var(--container)',
          margin: '0 auto',
          padding: '0 var(--gutter)',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          gap: 'clamp(3rem, 7vw, 6rem)',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '1rem',
            aspectRatio: '1 / 1',
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80"
            alt="Artisan workshop with hand tools"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{ objectFit: 'cover', gridColumn: 1, gridRow: '1 / 3' }}
          />
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80"
            alt="Quiet living space"
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            style={{ objectFit: 'cover', gridColumn: 2, gridRow: 1 }}
          />
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"
            alt="Detail of crafted object"
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            style={{ objectFit: 'cover', gridColumn: 2, gridRow: 2 }}
          />
        </div>
        <div>
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
            Our Philosophy
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.875rem, 3.6vw, 2.875rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              marginBottom: '1.75rem',
              maxWidth: '22ch',
            }}
          >
            Objects made with
            <em
              style={{
                color: 'var(--clay)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {' care '}
            </em>
            , materials that age
            <em
              style={{
                color: 'var(--clay)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {' gracefully '}
            </em>
            , spaces that invite pause.
          </h2>
          <p
            style={{
              fontSize: '1.0625rem',
              lineHeight: 1.75,
              color: 'var(--ink-2)',
              marginBottom: '1.25rem',
              maxWidth: '52ch',
            }}
          >
            We believe that the objects we surround ourselves with should tell stories, age
            beautifully, and bring quiet joy to daily rituals. Every piece in our collection passes
            through our hands before it reaches yours — we visit workshops, meet makers, and learn
            the story behind each object.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '1.75rem 0',
              color: 'var(--gold)',
              fontSize: '1.25rem',
            }}
          >
            <span
              style={{
                flex: 1,
                height: 1,
                background: 'var(--line)',
                maxWidth: 60,
              }}
            />
            <span style={{ fontSize: '0.875rem' }}>✦</span>
            <span
              style={{
                flex: 1,
                height: 1,
                background: 'var(--line)',
                maxWidth: 60,
              }}
            />
          </div>
          <p
            style={{
              fontSize: '1.0625rem',
              lineHeight: 1.75,
              color: 'var(--ink-2)',
              marginBottom: '2rem',
              maxWidth: '52ch',
            }}
          >
            This personal connection ensures that what we offer carries meaning beyond its function.
            Born out of Nordic design traditions, Maison partners with independent European artisans
            who honor slow craftsmanship, natural materials, and timeless function.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              margin: '2rem 0',
              padding: '1.75rem 0',
              borderTop: '1px solid var(--line)',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 500,
                  color: 'var(--clay)',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                }}
              >
                27
              </span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                Years in craft
              </span>
            </div>
            <div>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 500,
                  color: 'var(--clay)',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                }}
              >
                14
              </span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                Nordic makers
              </span>
            </div>
            <div>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 500,
                  color: 'var(--clay)',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                }}
              >
                100%
              </span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                FSC oak
              </span>
            </div>
          </div>
          <a
            href="/about"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.95rem 1.75rem',
              border: '1px solid var(--ink)',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              transition: 'all 0.45s var(--ease-maison)',
            }}
          >
            Read Our Manifesto
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
      <style>{`@media (max-width: 1024px) { .phil-grid { grid-template-columns: 1fr !important; gap: 3rem !important; } }`}</style>
    </section>
  );
}
