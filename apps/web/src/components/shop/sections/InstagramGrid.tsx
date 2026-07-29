/**
 * Maison — Instagram grid (6-col)
 */

import Image from 'next/image';

const IMAGES = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80',
  'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&q=80',
];

export function InstagramGrid() {
  return (
    <section style={{ padding: 'clamp(64px, 9vw, 120px) 0' }}>
      <div
        style={{
          maxWidth: 'var(--container)',
          margin: '0 auto',
          padding: '0 var(--gutter)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(40px, 5vw, 64px)',
          }}
        >
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
            Follow Us
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
              fontWeight: 500,
            }}
          >
            @maison
            <em
              style={{
                color: 'var(--clay)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {' living'}
            </em>
          </h2>
          <p
            style={{
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              color: 'var(--ink-2)',
              maxWidth: '60ch',
              margin: '1rem auto 0',
            }}
          >
            Join our community and get inspired by curated spaces and behind-the-scenes moments from
            our makers.
          </p>
        </div>
        <div
          className="ig-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0.5rem',
          }}
        >
          {IMAGES.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/maisonliving"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View Instagram post ${String(i + 1)}`}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
                display: 'block',
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                loading="lazy"
                style={{
                  objectFit: 'cover',
                  transition: 'transform 0.8s var(--ease-maison)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(168, 107, 74, 0)',
                  transition: 'background 0.45s var(--ease-maison)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="ig-overlay"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  style={{
                    opacity: 0,
                    transition: 'opacity 0.45s var(--ease-maison)',
                  }}
                  className="ig-icon"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r=".8" fill="white" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) { .ig-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        .ig-overlay:hover { background: rgba(168, 107, 74, 0.4) !important; }
        .ig-overlay:hover .ig-icon { opacity: 1 !important; }
        .ig-overlay:hover img { transform: scale(1.1); }
      `}</style>
    </section>
  );
}
