/**
 * Maison — Send email helper
 *
 * Uses Resend. Returns a stub in build/test contexts.
 */

import type { ReactElement } from 'react';
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

function getClient(): ResendClient {
  if (cachedClient) return cachedClient;

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey || apiKey.includes('placeholder')) {
    cachedClient = {
      emails: {
        send: async (payload: unknown) => {
          // Log metadata only — never `to` or `react` (PII). The payload
          // shape is { from, to, subject, react }; we log subject only.
          const meta = payload as { subject?: string };
          console.log(`[email] (stub) Would send email: subject="${meta.subject ?? '(unknown)'}"`);
          return { data: { id: 'stub-email-id' }, error: null };
        },
      },
    } satisfies ResendStub;
    return cachedClient;
  }

  cachedClient = new Resend(apiKey);
  return cachedClient;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
}

/**
 * Send a transactional email via Resend.
 * In dev/test, logs the payload instead of sending.
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const client = getClient();
  const from = process.env['EMAIL_FROM'] ?? 'hello@maison-living.com';

  // Both Resend and ResendStub accept the same payload shape. The `as
  // Parameters<...>[0]` cast was needed when `client` was typed as `Resend`
  // only; with the union type, we pass the payload object directly.
  const payload = { from, to, subject, react };
  const { data, error } = await client.emails.send(payload);

  if (error) {
    console.error('[email] Send failed:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}
