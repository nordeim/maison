/**
 * Maison — Product Detail Page (PDP)
 *
 * Async params (Next.js 16): params is a Promise — must be awaited.
 * SSR-rendered from tRPC server caller. Includes JSON-LD structured data.
 * Uses AddToBagButton (Client Component) for add-to-cart.
 */

/** The caller type returned by `apiPublic()` (resolved Promise). Used to type
 * page-local `let` bindings that must hold procedure return values or null.
 */
type Caller = Awaited<ReturnType<typeof apiPublic>>;
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import { AddToBagButton } from '@/components/shop/AddToBagButton';
import { ClientOnly } from '@/components/shop/ClientOnly';
import { ProductCard } from '@/components/shop/ProductCard';
import { ReviewsSection } from '@/components/shop/ReviewsSection';
import { WishlistButton } from '@/components/shop/WishlistButton';
import { apiPublic } from '@/lib/trpc/server';
import { formatPrice } from '@/lib/utils';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const caller = await apiPublic();
    const product = await caller.products.getBySlug({ slug });
    if (!product) return { title: 'Product not found' };
    return {
      title: product.name,
      description: product.shortDescription ?? product.longDescription?.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.shortDescription ?? undefined,
        images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
      },
    };
  } catch {
    return { title: 'Product not found' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: Awaited<ReturnType<Caller['products']['getBySlug']>> | null = null;
  let related: Awaited<ReturnType<Caller['products']['getRelated']>> = [];

  try {
    const caller = await apiPublic();
    [product, related] = await Promise.all([
      caller.products.getBySlug({ slug }),
      caller.products
        .getRelated({
          productId: '00000000-0000-0000-0000-000000000000',
          limit: 4,
        })
        .catch(() => []),
    ]);
  } catch (err) {
    console.error('[product] Failed to fetch:', err);
  }

  if (!product) {
    notFound();
  }

  if (related.length === 0) {
    try {
      const caller = await apiPublic();
      related = await caller.products.getRelated({
        productId: product.id,
        limit: 4,
      });
    } catch {
      // Related products are nice-to-have, not critical
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.longDescription,
    image: product.images.map((i) => i.url),
    sku: product.slug,
    offers: {
      '@type': 'Offer',
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        style={{
          maxWidth: 'var(--container)',
          margin: '0 auto',
          padding: '3rem var(--gutter)',
        }}
      >
        {/* Breadcrumb */}
        <nav
          style={{
            fontSize: '0.875rem',
            color: 'var(--muted)',
            marginBottom: '2rem',
          }}
          aria-label="Breadcrumb"
        >
          <Link href="/" style={{ color: 'inherit' }}>
            Home
          </Link>
          {' / '}
          <Link href="/products" style={{ color: 'inherit' }}>
            Shop
          </Link>
          {' / '}
          <span style={{ color: 'var(--ink)' }}>{product.name}</span>
        </nav>

        <div
          className="pdp-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
          }}
        >
          {/* Image gallery */}
          <div>
            {product.images.length > 0 ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4 / 5',
                  overflow: 'hidden',
                  background: 'var(--bg-2)',
                }}
              >
                {(() => {
                  const heroImage = product.images[0];
                  if (!heroImage) return null;
                  return (
                    <Image
                      src={heroImage.url}
                      alt={heroImage.altText ?? product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  );
                })()}
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  aspectRatio: '4 / 5',
                  background: 'var(--bg-2)',
                }}
              />
            )}
            {product.images.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '0.75rem',
                }}
              >
                {product.images.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      width: 72,
                      height: 90,
                      overflow: 'hidden',
                      background: 'var(--bg-2)',
                      border: i === 0 ? '2px solid var(--clay)' : '1px solid var(--line)',
                    }}
                  >
                    <Image src={img.url} alt="" fill sizes="72px" style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            {product.materials && (
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--clay)',
                  marginBottom: '1rem',
                }}
              >
                {product.materials}
              </p>
            )}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 400,
                marginBottom: '1rem',
              }}
            >
              {product.name}
            </h1>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: 500,
                marginBottom: '2rem',
                color: 'var(--ink)',
              }}
            >
              {formatPrice(product.priceCents, product.currency)}
            </p>

            {product.shortDescription && (
              <p
                style={{
                  fontSize: '1.125rem',
                  lineHeight: 1.7,
                  color: 'var(--ink-2)',
                  marginBottom: '1.5rem',
                }}
              >
                {product.shortDescription}
              </p>
            )}

            {product.longDescription && (
              <p
                style={{
                  lineHeight: 1.7,
                  color: 'var(--ink-2)',
                  marginBottom: '2rem',
                }}
              >
                {product.longDescription}
              </p>
            )}

            {/* Add to Bag + Wishlist */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1 }}>
                <AddToBagButton productSlug={product.slug} productName={product.name} />
              </div>
              <ClientOnly fallback={null}>
                <WishlistButton
                  productSlug={product.slug}
                  productName={product.name}
                  variant="pdp"
                />
              </ClientOnly>
            </div>

            {/* Trust badges */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--line)',
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--ink-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ color: 'var(--clay)' }}>✓</span> Free shipping on orders over $150
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--ink-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ color: 'var(--clay)' }}>✓</span> 30-day returns
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--ink-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ color: 'var(--clay)' }}>✓</span> 10-year guarantee
              </p>
            </div>

            {/* Details */}
            {product.dimensions && (
              <div style={{ marginBottom: '1rem' }}>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: '0.3rem',
                  }}
                >
                  Dimensions
                </p>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)' }}>{product.dimensions}</p>
              </div>
            )}
            {product.materials && (
              <div style={{ marginBottom: '1rem' }}>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: '0.3rem',
                  }}
                >
                  Materials
                </p>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)' }}>{product.materials}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section style={{ marginTop: '5rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 500,
                marginBottom: '2rem',
              }}
            >
              You may also <em style={{ color: 'var(--clay)', fontStyle: 'italic' }}>live with</em>
            </h2>
            <div
              className="related-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.75rem 1.25rem',
              }}
            >
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <ClientOnly fallback={null}>
          <ReviewsSection productSlug={product.slug} />
        </ClientOnly>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pdp-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </main>
  );
}
