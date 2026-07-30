/**
 * Maison — Gift card purchase page (Server Component)
 *
 * Server Component wrapper that exports metadata and renders the
 * GiftCardsForm Client Component. Next.js 16 forbids `metadata` export
 * from Client Components, so the page is split.
 *
 * Per REMEDIATION_PLAN_v5 Task 1.5 (F4).
 */

import type { Metadata } from 'next';

import { GiftCardsForm } from '@/components/shop/GiftCardsForm';

export const metadata: Metadata = {
  title: 'Gift Cards',
  description:
    'Digital Maison gift cards — delivered by email, no expiry. Redeemable on any handcrafted piece in our collection.',
};

export default function GiftCardsPage() {
  return <GiftCardsForm />;
}
