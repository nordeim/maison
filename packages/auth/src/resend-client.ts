/**
 * Maison — Resend email client
 *
 * Lazy-initialised Resend client. Returns a stub when RESEND_API_KEY is unset
 * (build/test contexts) so module import doesn't throw.
 */

import { Resend } from 'resend';

let cachedClient: Resend | null = null;

export function getResendClient(): Resend {
  if (cachedClient) return cachedClient;

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey || apiKey.includes('placeholder')) {
    // Return a stub that logs instead of sending. Module import succeeds;
    // actual sends fail gracefully (logged, not thrown).
    console.warn(
      '[email] RESEND_API_KEY not set — emails will be logged, not sent. ' +
        'This is expected in test/build/preview environments.',
    );
    cachedClient = {
      emails: {
        send: async (payload: unknown) => {
          console.log('[email] (stub) Would send:', payload);
          return { id: 'stub-email-id' };
        },
      },
    } as unknown as Resend;
    return cachedClient;
  }

  cachedClient = new Resend(apiKey);
  return cachedClient;
}

export const resend = getResendClient();
