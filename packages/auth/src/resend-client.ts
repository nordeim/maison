/**
 * Maison — Resend email client
 *
 * Lazy-initialised Resend client. Returns a stub when RESEND_API_KEY is unset
 * (build/test contexts) so module import doesn't throw.
 */

import { Resend } from 'resend';

/**
 * Minimal Resend stub shape — mirrors the real `emails.send` return type
 * ({ data, error } union) so the union `Resend | ResendStub` is callable
 * without narrowing. Avoids `as unknown as Resend` cast (Skill 2 §9.2).
 */
interface ResendStub {
  emails: {
    send: (
      payload: unknown,
    ) => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
  };
}

type ResendClient = Resend | ResendStub;

let cachedClient: ResendClient | null = null;

export function getResendClient(): ResendClient {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.RESEND_API_KEY;
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
          // Log metadata only — never `to` or `html` (PII). The payload
          // shape is { from, to, subject, html }; we log subject only.
          const meta = payload as { subject?: string };
          console.warn(`[email] (stub) Would send email: subject="${meta.subject ?? '(unknown)'}"`);
          return { data: { id: 'stub-email-id' }, error: null };
        },
      },
    } satisfies ResendStub;
    return cachedClient;
  }

  cachedClient = new Resend(apiKey);
  return cachedClient;
}

export const resend = getResendClient();
