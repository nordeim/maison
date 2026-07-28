/**
 * Maison — Category grid (4-col image cards)
 */

import Image from 'next/image';

interface CategoryGridProps {
  collections: {
    slug: string;
    name: string;
    description: string | null;
    heroImageUrl: string | null;
  }[];
}

const FALLBACK_CATEGORIES = [
  {
    slug: 'furniture',
    name: 'Furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    count: '42 pieces',
  },
  {
    slug: 'lighting',
    name: 'Lighting',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80',
    count: '28 pieces',
  },
  {
    slug: 'textiles',
    name: 'Textiles',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
    count: '36 pieces',
  },
  {
    slug: 'ceramics',
    name: 'Ceramics',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
    count: '24 pieces',
  },
];

export function CategoryGrid({ collections }: CategoryGridProps) {
  const cats =
    collections.length > 0
      ? collections.slice(0, 4).map((c) => ({
          slug: c.slug,
          name: c.name,
          image:
            c.heroImageUrl ??
            FALLBACK_CATEGORIES.find((f) => f.slug === c.slug)?.image ??
            FALLBACK_CATEGORIES[0]?.image ??
            '',
          count: `${c.name} pieces`,
        }))
      : FALLBACK_CATEGORIES;

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
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '2rem',
            marginBottom: 'clamp(40px, 5vw, 64px)',
            flexWrap: 'wrap',
          }}
        >
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
              Browse by Category
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                fontWeight: 500,
              }}
            >
              For every{' '}
              <em
                style={{
                  color: 'var(--clay)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                quiet
              </em>{' '}
              corner.
            </h2>
          </div>
          <a
            href="/collections"
            style={{
              fontSize: 13,
              letterSpacing: '0.04em',
              color: 'var(--ink)',
              borderBottom: '1px solid var(--ink)',
              paddingBottom: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            View all categories →
          </a>
        </div>
        <div
          className="cat-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.25rem',
          }}
        >
          {cats.map((cat) => (
            <a
              key={cat.slug}
              href={`/products?collection=${cat.slug}`}
              style={{
                position: 'relative',
                aspectRatio: '3 / 4',
                overflow: 'hidden',
                display: 'block',
              }}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                style={{
                  objectFit: 'cover',
                  transition: 'transform 1s var(--ease-maison)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 30%, rgba(31,27,23,0.7) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.5rem',
                  color: 'var(--bg)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    marginBottom: '0.25rem',
                  }}
                >
                  {cat.name}
                </h3>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(250,248,245,0.8)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{cat.count}</span>
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .cat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .cat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
