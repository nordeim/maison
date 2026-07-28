/**
 * Maison — Account wishlist (Server Component)
 *
 * Shows wishlisted products in a grid using ProductCard.
 */

import { ProductCard } from '@/components/shop/ProductCard';
import { api } from '@/lib/trpc/server';

export default async function AccountWishlistPage() {
  let wishlist: { items: Record<string, unknown>[] } = { items: [] };

  try {
    const caller = await api();
    wishlist = await caller.account.listWishlist();
  } catch (err) {
    console.error('[account wishlist] Failed to fetch:', err);
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          fontWeight: 500,
          marginBottom: '1.5rem',
        }}
      >
        Wishlist
      </h2>

      {wishlist.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Your wishlist is empty.</p>
          <p style={{ marginBottom: '1.5rem' }}>
            Save pieces you love by clicking the heart icon on any product.
          </p>
          <a
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
            Browse Products
          </a>
        </div>
      ) : (
        <div
          className="wishlist-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.75rem 1.25rem',
          }}
        >
          {wishlist.items.map((item) => (
            <ProductCard
              key={item.id as string}
              product={item as React.ComponentProps<typeof ProductCard>['product']}
            />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) { .wishlist-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .wishlist-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}
