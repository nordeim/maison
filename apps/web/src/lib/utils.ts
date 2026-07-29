/**
 * Maison — shared client/server utilities.
 *
 * Generic helpers consumed across shop/admin/account Server AND Client
 * Components. Import via the `@/lib/utils` barrel — never deep-link these.
 *
 * Exports:
 *   - cn        : merge Tailwind classes (clsx + tailwind-merge)
 *   - formatPrice : render an integer-cents amount as a currency string
 *   - formatDate  : render a Date | ISO string as a short editorial date
 *
 * Conventions honoured:
 *   - Money is integer cents (AGENTS.md §"Drizzle ORM pitfalls"); display
 *     divides by 100 and formats via Intl. Never float-arithmetic on cents.
 *   - Default currency/brand metadata sourced from `@maison/config` site,
 *     not hardcoded (Project_Brief §Decision 6).
 *
 * Pattern source: nextjs16-react19-tailwind4-better-auth-monorepo skill
 * (apps/web/src/lib/utils.ts, Stillwater reference).
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { site } from '@maison/config';

/**
 * Merge Tailwind CSS class names with conflict resolution.
 * Combines clsx (conditional/array/object syntax) with tailwind-merge
 * (last-wins conflict resolution).
 *
 * @example
 * cn('p-2', 'p-4') // → 'p-4'
 * cn('base', isActive && 'active') // → 'base active' or 'base'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Reuse a single Intl formatter across renders — Intl constructors are
// comparatively expensive and format helpers run on every list row.
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: site.shipping.currency,
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * Format an amount stored as integer cents (e.g. 1499 -> "$14.99").
 *
 * `currency` is optional and nullable so nullable row columns
 * (`product.currency`, `item.currency`) pipe through without a guard at
 * every call site: if absent, the brand default (`site.shipping.currency`)
 * is used.
 *
 * @example
 * formatPrice(1499) // → '$14.99'
 * formatPrice(1499, 'EUR') // → '€14.99'
 * formatPrice(order.totalCents) // → '$249.00'
 */
export function formatPrice(priceCents: number, currency?: string | null): string {
  if (currency && currency !== site.shipping.currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(priceCents / 100);
  }
  return priceFormatter.format(priceCents / 100);
}

/**
 * Format a date as a short editorial string (e.g. "12 Jan 2026").
 *
 * Accepts both `Date` (Drizzle timestamp rows) and ISO `string`
 * (RSC/JSON-serialized transport) so call sites don't coerce.
 *
 * @example
 * formatDate(order.placedAt) // → '12 Jan 2026'
 * formatDate('2026-01-12T10:00:00.000Z') // → '12 Jan 2026'
 */
export function formatDate(date: Date | string): string {
  return dateFormatter.format(date instanceof Date ? date : new Date(date));
}
