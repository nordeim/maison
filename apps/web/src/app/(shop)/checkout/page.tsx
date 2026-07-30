/**
 * Maison — Checkout page (Server Component)
 *
 * Server Component wrapper that exports metadata and renders the
 * CheckoutFlow Client Component. Next.js 16 forbids `metadata` export
 * from Client Components, so the page is split.
 *
 * Per REMEDIATION_PLAN_v5 Task 1.5 (F4).
 */

import type { Metadata } from 'next';

import { CheckoutFlow } from '@/components/shop/CheckoutFlow';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Maison order.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
