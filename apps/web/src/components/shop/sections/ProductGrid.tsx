/**
 * Maison — Product grid (4-col with ProductCards)
 *
 * Uses the ProductCard Client Component for hover-swap, wishlist, quick-add.
 */

import { ProductCard } from '../ProductCard';

interface ProductGridProps {
  products: {
    slug: string;
    name: string;
    priceCents: number;
    compareAtPriceCents?: number | null;
    currency?: string;
    shortDescription?: string | null;
    materials?: string | null;
    primaryImage?: string | null;
    collectionName?: string | null;
    featured?: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
  }[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <section style={{ padding: 'clamp(64px, 9vw, 120px) 0' }}>
        <div
          style={{
            maxWidth: 'var(--container)',
            margin: '0 auto',
            padding: '0 var(--gutter)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--muted)' }}>
            No products available yet. Run{' '}
            <code style={{ color: 'var(--clay)' }}>pnpm db:seed</code> to load the catalog.
          </p>
        </div>
      </section>
    );
  }

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
              Just Arrived
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                fontWeight: 500,
              }}
            >
              Pieces we&apos;d
              <em
                style={{
                  color: 'var(--clay)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                {' live with '}
              </em>
              .
            </h2>
          </div>
          <a
            href="/products"
            style={{
              fontSize: 13,
              color: 'var(--ink)',
              borderBottom: '1px solid var(--ink)',
              paddingBottom: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            Shop all new →
          </a>
        </div>
        <div
          className="prod-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.75rem 1.25rem',
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a
            href="/products"
            style={{
              display: 'inline-flex',
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
            View All Products
          </a>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .prod-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .prod-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.25rem 0.75rem !important; } }
        @media (max-width: 480px) { .prod-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
