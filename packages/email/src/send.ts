/**
 * Maison — Send email helper
 *
 * Uses Resend. Returns a stub in build/test contexts.
 */

import type { ReactElement } from "react";
import { Resend } from "resend";

let cachedClient: Resend | null = null;

function getClient(): Resend {
  if (cachedClient) return cachedClient;

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey || apiKey.includes("placeholder")) {
    cachedClient = {
      emails: {
        send: async (payload: unknown) => {
          console.log("[email] (stub) Would send:", payload);
          return { id: "stub-email-id" };
        },
      },
    } as unknown as Resend;
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
  const from = process.env["EMAIL_FROM"] ?? "hello@maison-living.com";

  const { data, error } = await client.emails.send({
    from,
    to,
    subject,
    react,
  } as Parameters<typeof client.emails.send>[0]);

  if (error) {
    console.error("[email] Send failed:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}
