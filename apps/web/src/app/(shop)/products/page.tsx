/**
 * Maison — Product Listing Page (PLP)
 *
 * URL-driven state via searchParams (sort, collection filter).
 * SSR-rendered from tRPC server caller.
 * Uses ProductCard for consistent product display.
 */

import { Suspense } from 'react';

import Link from 'next/link';

import type { Metadata } from 'next';

import { ProductCard } from '@/components/shop/ProductCard';
import { SortSelect } from '@/components/shop/SortSelect';
import { apiPublic } from '@/lib/trpc/server';

export const metadata: Metadata = {
  title: 'Shop All',
  description: 'Browse our full collection of handcrafted Scandinavian home goods.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    collection?: string;
    sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc';
  }>;
}

const COLLECTION_PILLS = [
  { slug: '', name: 'All Objects' },
  { slug: 'lighting', name: 'Lighting' },
  { slug: 'furniture', name: 'Furniture' },
  { slug: 'textiles', name: 'Textiles' },
  { slug: 'ceramics', name: 'Ceramics' },
  { slug: 'objects', name: 'Objects & Vases' },
  { slug: 'seasonal', name: 'Seasonal' },
  { slug: 'gifts', name: 'Curated Gifts' },
];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const sort = params.sort ?? 'featured';

  let products: {
    slug: string;
    name: string;
    priceCents: number;
    shortDescription: string | null;
    materials: string | null;
    primaryImage: string | null;
    collectionName: string | null;
    featured: boolean;
    isNew: boolean;
    isBestseller: boolean;
  }[] = [];

  try {
    const caller = await apiPublic();
    const result = await caller.products.list({
      collection: params.collection,
      sort,
      limit: 48,
    });
    products = result.items;
  } catch (err) {
    console.error('[products] Failed to fetch:', err);
  }

  const activeCollection = COLLECTION_PILLS.find((c) => c.slug === (params.collection ?? ''));

  return (
    <main
      style={{
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: '5rem var(--gutter)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
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
          Shop All
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            fontWeight: 500,
          }}
        >
          {activeCollection?.slug ? activeCollection.name : 'All Pieces'}
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      {/* Filter pills + sort */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div className="filter-pills" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {COLLECTION_PILLS.map((pill) => {
            const isActive = (pill.slug || '') === (params.collection ?? '');
            const href = pill.slug ? `/products?collection=${pill.slug}` : '/products';
            return (
              <Link
                key={pill.slug || 'all'}
                href={href}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  background: isActive ? 'var(--ink)' : 'transparent',
                  color: isActive ? 'var(--bg)' : 'var(--ink-2)',
                  border: isActive ? '1px solid var(--ink)' : '1px solid var(--line)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                {pill.name}
              </Link>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label
            style={{
              fontSize: 12,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
            htmlFor="sort"
          >
            Sort
          </label>
          <Suspense fallback={null}>
            <SortSelect currentSort={sort} />
          </Suspense>
        </div>
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 0',
            color: 'var(--muted)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              color: 'var(--ink)',
              marginBottom: '1rem',
            }}
          >
            No pieces match this filter
          </p>
          <p>Try clearing filters or browsing all pieces.</p>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              color: 'var(--clay)',
              borderBottom: '1px solid var(--clay)',
              paddingBottom: '2px',
            }}
          >
            View all pieces →
          </Link>
        </div>
      ) : (
        <div
          className="plp-grid"
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
      )}

      <style>{`
        @media (max-width: 1024px) { .plp-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .plp-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.25rem 0.75rem !important; } }
        @media (max-width: 480px) { .plp-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}
