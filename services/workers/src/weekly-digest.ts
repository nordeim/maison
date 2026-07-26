/**
 * Maison — Weekly digest job (stub — Phase 2)
 *
 * Cron: Sunday 9am CET.
 * Sends a "Letters from Maison" newsletter to all subscribers.
 */

export const weeklyDigestJobSpec = {
  name: "weekly-digest",
  trigger: { cron: "0 9 * * 0" }, // Sunday 9am
  concurrency: 1, // sequential, batches by recipient
  retry: { limit: 2 },
} as const;

export async function weeklyDigestHandler(): Promise<void> {
  console.log("[jobs] weekly-digest: stub — would send Sunday newsletter");
}
