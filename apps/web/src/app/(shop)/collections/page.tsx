/**
 * Maison — Collections overview page
 */

import type { Metadata } from 'next';

import { apiPublic } from '@/lib/trpc/server';

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Browse our curated collections — Lighting, Furniture, Textiles, Ceramics, and more.',
};

export default async function CollectionsPage() {
  let collections: {
    slug: string;
    name: string;
    description: string | null;
  }[] = [];

  try {
    const caller = await apiPublic();
    collections = await caller.collections.list();
  } catch (err) {
    console.error('[collections] Failed to fetch:', err);
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '5rem 1.25rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <p className="eyebrow">Browse by Category</p>
        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 400 }}>
          For every <em style={{ color: '#a86b4a' }}>quiet</em> corner.
        </h1>
      </div>

      {collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#8a8178' }}>
          <p>No collections available yet. Run `pnpm db:seed` to load the initial catalog.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {collections.map((c) => (
            <a
              key={c.slug}
              href={`/products?collection=${c.slug}`}
              style={{
                color: 'inherit',
                display: 'block',
                padding: '2rem',
                border: '1px solid #e5ddd1',
                background: '#ffffff',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                }}
              >
                {c.name}
              </h3>
              {c.description && (
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#4a433b',
                    lineHeight: 1.65,
                  }}
                >
                  {c.description}
                </p>
              )}
              <p
                style={{
                  marginTop: '1rem',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#a86b4a',
                }}
              >
                View pieces →
              </p>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
