/**
 * Maison — Stripe server client
 *
 * Lazy-initialised. Returns a stub when STRIPE_SECRET_KEY is unset
 * (build/test contexts) so module import doesn't throw.
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §3.4:
 * uses process.env directly (not Zod env module).
 *
 * Per Skill 2 §9.9 Gotcha 10: `apiVersion` is explicitly pinned to match
 * the Stripe SDK 22.3.x default (`2026-06-24.dahlia`). This prevents
 * silent API version drift when the SDK is upgraded.
 */

import Stripe from 'stripe';

/** Stripe API version pinned to match SDK 22.3.x (ADR-009). */
const STRIPE_API_VERSION = '2026-06-24.dahlia' as Stripe.LatestApiVersion;

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedClient) return cachedClient;

  const apiKey = process.env['STRIPE_SECRET_KEY'];
  if (!apiKey || apiKey.includes('placeholder')) {
    // Return a stub — module import succeeds; actual API calls fail gracefully
    console.warn(
      '[stripe] STRIPE_SECRET_KEY not set — Stripe calls will fail. ' +
        'This is expected in test/build/preview environments.',
    );
    cachedClient = new Stripe('sk_test_placeholder', {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    });
    return cachedClient;
  }

  cachedClient = new Stripe(apiKey, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });
  return cachedClient;
}

export const stripe = getStripeClient();
