/**
 * Maison — Stripe server client
 *
 * Lazy-initialised. Returns a stub when STRIPE_SECRET_KEY is unset
 * (build/test contexts) so module import doesn't throw.
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §3.4:
 * uses process.env directly (not Zod env module).
 */

import Stripe from 'stripe';

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
      typescript: true,
    });
    return cachedClient;
  }

  cachedClient = new Stripe(apiKey, {
    typescript: true,
  });
  return cachedClient;
}

export const stripe = getStripeClient();
