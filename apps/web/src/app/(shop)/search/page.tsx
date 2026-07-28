/**
 * Maison — Search results page (Server Component)
 *
 * URL-driven: /search?q=linen
 * Uses tRPC server caller for full-text search.
 */

import Link from 'next/link';

import type { Metadata } from 'next';

import { ProductCard } from '@/components/shop/ProductCard';
import { api } from '@/lib/trpc/server';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : 'Search',
    description: `Search results for "${q ?? ''}" in the Maison collection.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  let results: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    shortDescription: string | null;
    primaryImage: string | null;
  }[] = [];

  if (query.length >= 2) {
    try {
      const caller = await api();
      results = await caller.products.search({ q: query, limit: 24 });
    } catch (err) {
      console.error('[search] Failed to fetch:', err);
    }
  }

  return (
    <main
      style={{
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: '5rem var(--gutter)',
      }}
    >
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
          Search
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            fontWeight: 500,
          }}
        >
          {query ? (
            <>
              Results for <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>{query}</em>
            </>
          ) : (
            <>
              Search the <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>collection</em>
            </>
          )}
        </h1>
        {query && (
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
            {results.length} {results.length === 1 ? 'piece' : 'pieces'} found
          </p>
        )}
      </div>

      {!query ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 0',
            color: 'var(--muted)',
          }}
        >
          <p style={{ marginBottom: '1.5rem' }}>
            Use the search bar at the top of the page to find pieces by name, material, or
            description.
          </p>
          <Link
            href="/products"
            style={{
              color: 'var(--clay)',
              borderBottom: '1px solid var(--clay)',
            }}
          >
            Or browse all pieces →
          </Link>
        </div>
      ) : results.length === 0 ? (
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
            No pieces match &quot;{query}&quot;
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Try a different search term, or browse our full collection.
          </p>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              padding: '0.95rem 1.75rem',
              background: 'var(--clay)',
              color: 'var(--bg)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Browse All Pieces
          </Link>
        </div>
      ) : (
        <div
          className="search-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.75rem 1.25rem',
          }}
        >
          {results.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                slug: p.slug,
                name: p.name,
                priceCents: p.priceCents,
                shortDescription: p.shortDescription,
                primaryImage: p.primaryImage,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) { .search-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .search-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.25rem 0.75rem !important; } }
      `}</style>
    </main>
  );
}
