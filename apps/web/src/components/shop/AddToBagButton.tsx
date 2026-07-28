/**
 * Maison — Add to Bag button (Client Component)
 *
 * Used on the PDP. Calls CartProvider.addItem with the product slug.
 * Shows loading state and opens the cart drawer on success.
 */

'use client';

import { useState } from 'react';

import { useCart } from './CartProvider';

export interface AddToBagButtonProps {
  productSlug: string;
  productName?: string;
}

export function AddToBagButton({ productSlug }: AddToBagButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await addItem(productSlug, 1);
    } catch (err) {
      console.error('Failed to add to bag:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={() => void handleAdd()}
      disabled={isAdding}
      style={{
        padding: '0.95rem 1.75rem',
        background: 'var(--clay)',
        color: 'var(--bg)',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        border: 'none',
        cursor: isAdding ? 'wait' : 'pointer',
        width: '100%',
        transition: 'background 0.45s var(--ease-maison)',
      }}
    >
      {isAdding ? 'Adding…' : 'Add to Bag'}
    </button>
  );
}
