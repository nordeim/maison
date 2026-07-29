/**
 * Maison — Webhook idempotency helpers (ADR-014)
 *
 * Dual-defense idempotency pattern for Stripe webhooks:
 *   1. Fast-path check: findFirst by stripeEventId — return early if exists
 *   2. Open transaction, acquire pg_advisory_xact_lock(hash(event.id))
 *   3. Double-check: findFirst again (in case concurrent request inserted)
 *   4. Process event + insert payment_events record
 *   5. On catch: detect PG code 23505 (isUniqueViolation) → return success
 *
 * Per Stillwater v3.0.0 §15.21.1 and ADR-014.
 */

/**
 * Check if a database error is a unique constraint violation (PG code 23505).
 * Used in the webhook idempotency catch block to detect duplicate event inserts.
 */
export function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: unknown }).code;
  return code === '23505';
}

/**
 * Hash a Stripe event ID to a BigInt for use as a Postgres advisory lock key.
 *
 * Uses a simple DJB2-style hash that produces a positive BigInt fitting
 * in the 64-bit signed integer range (Postgres advisory lock requirement).
 *
 * IMPORTANT: Use BigInt() constructor (NOT literals like 5381n) to avoid
 * ES2019 target issues (per Stillwater Lesson 67).
 */
export function hashStringToBigInt(input: string): bigint {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    // DJB2 hash: hash * 33 ^ char
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  // Convert to unsigned 32-bit, then to BigInt, masked to 63 bits (positive)
  const unsigned = hash >>> 0;
  return BigInt(unsigned);
}
