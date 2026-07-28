/**
 * Maison — Trigger.dev job registry
 *
 * Exports all job definitions. Trigger.dev scans this file to register jobs.
 * Each job is defined in its own file under src/.
 *
 * Jobs (per PRD §7.7 and PROJECT-ARCHITECTURE.md §7):
 * - abandoned-cart: 1h / 24h / 72h after cart abandonment
 * - order-confirmation: retry order email on Resend failure
 * - shipping-update: send shipping email when tracking added
 * - weekly-digest: Sunday newsletter send
 * - inventory-alert: notify admin when stock < threshold
 *
 * All jobs are stubs in Phase 0 — full implementation in Phase 1.
 */

// Job stubs — uncomment when Trigger.dev is configured
// export { abandonedCart } from "./abandoned-cart";
// export { orderConfirmation } from "./order-confirmation";
// export { shippingUpdate } from "./shipping-update";
// export { weeklyDigest } from "./weekly-digest";
// export { inventoryAlert } from "./inventory-alert";

console.log('[workers] Maison job registry loaded (Phase 0 stubs — no jobs registered yet)');
