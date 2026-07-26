/**
 * Maison — Abandoned cart job (stub — Phase 1)
 *
 * Cron: every 30 minutes, checks for carts abandoned 1h/24h/72h ago.
 * Sends a sequence of reminder emails via Resend + Klaviyo.
 *
 * Flow:
 *   Cart last interaction
 *     → after 1h:  "You left something behind" email
 *     → after 24h: "Still thinking?" email with 5% discount code
 *     → after 72h: "Last chance" email, mark cart as abandoned
 *     → after 7d:  archive cart (no more emails)
 */

export const abandonedCartJobSpec = {
  name: "abandoned-cart",
  trigger: { cron: "*/30 * * * *" }, // every 30 min
  concurrency: 5,
  retry: { limit: 3, backoff: "exponential" },
} as const;

// Phase 1: implement with @trigger.dev/sdk/v4 task runner
export async function abandonedCartHandler(): Promise<void> {
  console.log("[jobs] abandoned-cart: stub — would query carts abandoned in last 30 min");
}
