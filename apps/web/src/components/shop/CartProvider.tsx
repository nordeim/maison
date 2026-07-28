/**
 * Maison — Cart context provider
 *
 * Manages cart state client-side:
 *  - Reads cart ID from cookie on mount
 *  - Provides cart items, count, subtotal via context
 *  - Exposes addItem, updateItem, removeItem functions (tRPC mutations)
 *  - On first add, creates a cart and sets the cookie
 *
 * Usage: Wrap the app in <CartProvider>. Read cart via useCart() hook.
 */

'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

import { trpc } from '@/lib/trpc/client';

const CART_COOKIE_NAME = 'maison_cart_id';
const CART_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  productName: string;
  productSlug: string;
  priceCents: number;
  currency: string;
}

interface CartContextValue {
  cartId: string | null;
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productSlug: string, quantity?: number, variantId?: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${String(maxAge)}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = new RegExp(`(?:^|; )${name}=([^;]*)`).exec(document.cookie);
  return match ? decodeURIComponent(match[1] ?? '') : null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const id = getCookie(CART_COOKIE_NAME);
    if (id) setCartId(id);
    setIsHydrated(true);
  }, []);

  const { data: cartData, isLoading } = trpc.cart.get.useQuery(
    { cartId: cartId ?? undefined },
    { enabled: isHydrated && !!cartId },
  );

  const addItemMutation = trpc.cart.addItem.useMutation({
    onSuccess: (data) => {
      if (!cartId && data.cartId) {
        setCartId(data.cartId);
        setCookie(CART_COOKIE_NAME, data.cartId, CART_COOKIE_MAX_AGE);
      }
    },
  });

  const updateItemMutation = trpc.cart.updateItem.useMutation();
  const removeItemMutation = trpc.cart.removeItem.useMutation();

  const utils = trpc.useUtils();

  const invalidateCart = useCallback(() => {
    if (cartId) {
      void utils.cart.get.invalidate({ cartId });
    }
  }, [cartId, utils]);

  const addItem = useCallback(
    async (productSlug: string, quantity = 1, variantId?: string) => {
      await addItemMutation.mutateAsync({
        cartId: cartId ?? undefined,
        productSlug,
        quantity,
        variantId,
      });
      invalidateCart();
      setIsDrawerOpen(true);
    },
    [cartId, addItemMutation, invalidateCart],
  );

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!cartId) return;
      await updateItemMutation.mutateAsync({ cartId, itemId, quantity });
      invalidateCart();
    },
    [cartId, updateItemMutation, invalidateCart],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!cartId) return;
      await removeItemMutation.mutateAsync({ cartId, itemId });
      invalidateCart();
    },
    [cartId, removeItemMutation, invalidateCart],
  );

  const items = (cartData?.items ?? []) as CartItem[];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  const value: CartContextValue = {
    cartId,
    items,
    itemCount,
    subtotalCents,
    isLoading: isLoading || !isHydrated,
    isDrawerOpen,
    openDrawer: () => {
      setIsDrawerOpen(true);
    },
    closeDrawer: () => {
      setIsDrawerOpen(false);
    },
    addItem,
    updateItemQuantity,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
