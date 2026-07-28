/**
 * Maison — Product card (Client Component)
 *
 * Features:
 *  - Image hover-swap (primary → alternate)
 *  - Badge (New / Bestseller / Featured)
 *  - Wishlist heart toggle
 *  - Quick Add button
 *  - Price display with compare-at price
 *
 * Used in: homepage product grid, PLP, collection pages, related products.
 */

'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useCart } from './CartProvider';
import { WishlistButton } from './WishlistButton';

import { formatPrice } from '@/lib/utils';

export interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    priceCents: number;
    compareAtPriceCents?: number | null;
    currency?: string;
    shortDescription?: string | null;
    materials?: string | null;
    primaryImage?: string | null;
    collectionName?: string | null;
    collectionSlug?: string | null;
    featured?: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
  };
  alternateImage?: string | null;
}

export function ProductCard({ product, alternateImage }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const badge = product.isNew
    ? { text: 'New', className: 'new' }
    : product.isBestseller
      ? { text: 'Bestseller', className: 'bestseller' }
      : product.featured
        ? { text: 'Featured', className: '' }
        : null;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem(product.slug, 1);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="product-card reveal" style={{ position: 'relative', cursor: 'pointer' }}>
      <Link href={`/products/${product.slug}`} style={{ color: 'inherit', display: 'block' }}>
        <div
          style={{
            position: 'relative',
            aspectRatio: '4 / 5',
            overflow: 'hidden',
            background: 'var(--bg-2)',
            marginBottom: '1rem',
          }}
        >
          {product.primaryImage && (
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{
                objectFit: 'cover',
                transition: 'transform 1s var(--ease-maison)',
              }}
            />
          )}
          {alternateImage && (
            <Image
              src={alternateImage}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{
                objectFit: 'cover',
                opacity: 0,
                transition: 'opacity 0.6s var(--ease-maison)',
              }}
              className="alt-image"
            />
          )}

          {/* Badge */}
          {badge && (
            <span
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background:
                  badge.className === 'bestseller'
                    ? 'var(--clay)'
                    : badge.className === 'new'
                      ? 'var(--ink)'
                      : 'var(--bg)',
                color:
                  badge.className === 'bestseller' || badge.className === 'new'
                    ? 'var(--bg)'
                    : 'var(--ink)',
                padding: '0.35rem 0.75rem',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 500,
                zIndex: 2,
              }}
            >
              {badge.text}
            </span>
          )}

          {/* Wishlist */}
          <WishlistButton productSlug={product.slug} productName={product.name} variant="card" />

          {/* Quick Add */}
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              background: 'var(--bg)',
              color: 'var(--ink)',
              padding: '0.75rem',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 500,
              border: 'none',
              cursor: isAdding ? 'wait' : 'pointer',
              opacity: 0,
              transform: 'translateY(8px)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              zIndex: 2,
            }}
            className="quick-add-btn"
          >
            {isAdding ? 'Adding…' : 'Quick Add'}
          </button>
        </div>

        {/* Info */}
        <div className="product-card__info">
          {product.collectionName && (
            <p
              style={{
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              {product.collectionName}
            </p>
          )}
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'var(--ink)',
              transition: 'color 0.25s ease',
            }}
            className="product-card__name"
          >
            {product.name}
          </h3>
          {product.materials && (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--muted)',
                fontStyle: 'italic',
              }}
            >
              {product.materials}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.25rem',
            }}
          >
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--ink)',
                fontWeight: 500,
              }}
            >
              {formatPrice(product.priceCents, product.currency)}
            </p>
            {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--muted)',
                  textDecoration: 'line-through',
                }}
              >
                {formatPrice(product.compareAtPriceCents, product.currency)}
              </p>
            )}
          </div>
        </div>
      </Link>

      <style>{`
        .product-card:hover .alt-image { opacity: 1 !important; }
        .product-card:hover .quick-add-btn { opacity: 1 !important; transform: translateY(0) !important; }
        .product-card:hover .product-card__name { color: var(--clay) !important; }
        .product-card:hover img { transform: scale(1.04); }
      `}</style>
    </article>
  );
}
