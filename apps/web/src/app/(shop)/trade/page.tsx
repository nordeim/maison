/**
 * Maison — Trade program application page (Server Component)
 *
 * Server Component wrapper that exports metadata and renders the
 * TradeForm Client Component. Next.js 16 forbids `metadata` export
 * from Client Components, so the page is split.
 *
 * Per REMEDIATION_PLAN_v5 Task 1.5 (F4).
 */

import type { Metadata } from 'next';

import { TradeForm } from '@/components/shop/TradeForm';

export const metadata: Metadata = {
  title: 'Trade Program',
  description:
    'Maison Trade Program — 10–20% off for interior designers, architects, and stylists. Priority lead times and dedicated trade concierge. Apply in minutes.',
};

export default function TradePage() {
  return <TradeForm />;
}
