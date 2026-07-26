/**
 * Maison — Sanity webhook handler
 *
 * Triggers ISR revalidation when content is published in Sanity.
 * Verifies the SANITY_WEBHOOK_SECRET to prevent unauthorized revalidation.
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const webhookSecret = process.env["SANITY_WEBHOOK_SECRET"];

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error("[sanity-webhook] SANITY_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  // Verify signature
  const signature = req.headers.get("sanity-webhook-signature");
  if (!signature || signature !== webhookSecret) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = (await req.json()) as { paths?: string[] };
  const paths = body.paths ?? ["/"];

  for (const path of paths) {
    try {
      revalidatePath(path);
      console.log(`[sanity-webhook] Revalidated: ${path}`);
    } catch (err) {
      console.error(`[sanity-webhook] Failed to revalidate ${path}:`, err);
    }
  }

  return NextResponse.json({ revalidated: paths });
}
