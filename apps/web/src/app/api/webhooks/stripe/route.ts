/**
 * Maison — Stripe webhook handler
 *
 * CRITICAL: Signature verification + idempotency.
 * Stripe retries webhooks up to 3 times if it doesn't receive a 200.
 * The orders table has a UNIQUE constraint on stripe_idempotency_key —
 * duplicate processing raises an error which we catch and return 200.
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §5.5
 * and PROJECT-ARCHITECTURE.md §3.3 (Pattern 2).
 *
 * Body must be raw (not JSON-parsed) for signature verification.
 */

import { NextResponse } from "next/server";
import { constructWebhookEvent, handleWebhookEvent } from "@maison/payments";

const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe-webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  try {
    await handleWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe-webhook] Event handling failed:", message);

    // If the error is a unique constraint violation, the event was already
    // processed (Stripe retried). Return 200 so Stripe stops retrying.
    if (message.includes("unique") || message.includes("duplicate")) {
      console.log("[stripe-webhook] Duplicate event — returning 200 to stop retries");
      return NextResponse.json({ received: true, duplicate: true });
    }

    return NextResponse.json(
      { error: `Webhook handler failed: ${message}` },
      { status: 500 },
    );
  }
}
