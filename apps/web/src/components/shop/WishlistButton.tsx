/**
 * Maison — Wishlist button (Client Component)
 *
 * Toggles a product in the user's wishlist. Persists to the DB via
 * the account.toggleWishlist tRPC mutation (for authenticated users).
 * For anonymous users, uses localStorage and merges on login (Phase 2.1).
 *
 * Used on: ProductCard, PDP.
 */

'use client';

import { useState, useEffect } from 'react';

import { useSession } from '@maison/auth/client';

import { trpc } from '@/lib/trpc/client';

interface WishlistButtonProps {
  productSlug: string;
  productName: string;
  variant?: 'card' | 'pdp';
}

const ANON_WISHLIST_KEY = 'maison_anon_wishlist';

function getAnonWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ANON_WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function setAnonWishlist(slugs: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ANON_WISHLIST_KEY, JSON.stringify(slugs));
}

export function WishlistButton({
  productSlug,
  productName,
  variant = 'card',
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // For authenticated users: check if product is in wishlist via tRPC query
  const { data: wishlistData } = trpc.account.listWishlist.useQuery(undefined, {
    enabled: !!session,
  });

  const toggleMutation = trpc.account.toggleWishlist.useMutation({
    onSuccess: (data) => {
      setIsWishlisted(data.isWishlisted);
    },
  });

  // Sync state: authenticated → from DB query; anonymous → from localStorage
  useEffect(() => {
    if (session && wishlistData) {
      setIsWishlisted(wishlistData.items.some((item) => item.slug === productSlug));
    } else if (!session) {
      setIsWishlisted(getAnonWishlist().includes(productSlug));
    }
  }, [session, wishlistData, productSlug]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;
    setIsToggling(true);

    try {
      if (session) {
        // Authenticated: persist to DB
        await toggleMutation.mutateAsync({ productSlug });
      } else {
        // Anonymous: toggle in localStorage
        const current = getAnonWishlist();
        if (current.includes(productSlug)) {
          setAnonWishlist(current.filter((s) => s !== productSlug));
          setIsWishlisted(false);
        } else {
          setAnonWishlist([...current, productSlug]);
          setIsWishlisted(true);
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const isPdp = variant === 'pdp';

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      aria-label={
        isWishlisted ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`
      }
      style={
        isPdp
          ? {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--line)',
              background: 'transparent',
              color: isWishlisted ? 'var(--clay)' : 'var(--ink-2)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: isToggling ? 'wait' : 'pointer',
              transition: 'all 0.25s ease',
            }
          : {
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              width: 36,
              height: 36,
              background: 'rgba(250,248,245,0.9)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: isToggling ? 'wait' : 'pointer',
              zIndex: 2,
              transition: 'background 0.25s ease',
            }
      }
    >
      <svg
        width={isPdp ? 18 : 16}
        height={isPdp ? 18 : 16}
        viewBox="0 0 24 24"
        fill={isWishlisted ? 'var(--clay)' : 'none'}
        stroke={isWishlisted ? 'var(--clay)' : isPdp ? 'currentColor' : 'var(--ink)'}
        strokeWidth="1.5"
      >
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {isPdp && (isWishlisted ? 'Saved' : 'Save to Wishlist')}
    </button>
  );
}
