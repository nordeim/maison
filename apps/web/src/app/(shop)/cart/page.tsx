/**
 * Maison — Shopping bag page (Server Component)
 *
 * Server Component wrapper that exports metadata and renders the
 * CartView Client Component. Next.js 16 forbids `metadata` export
 * from Client Components, so the page is split.
 *
 * Per REMEDIATION_PLAN_v5 Task 1.5 (F4).
 */

import type { Metadata } from 'next';

import { CartView } from '@/components/shop/CartView';

export const metadata: Metadata = {
  title: 'Shopping Bag',
  description: 'Review the handcrafted pieces in your shopping bag.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartView />;
}
