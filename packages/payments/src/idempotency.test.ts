/**
 * Maison — Webhook idempotency tests (ADR-014)
 *
 * Tests the dual-defense idempotency pattern:
 *   1. UNIQUE INDEX on payment_events.stripe_event_id (first defense)
 *   2. pg_advisory_xact_lock (second defense — transaction-scoped)
 *
 * Per Stillwater v3.0.0 §15.21.1 and ADR-014.
 */

import { describe, it, expect } from 'vitest';

import { isUniqueViolation, hashStringToBigInt } from './idempotency';

describe('isUniqueViolation (ADR-014)', () => {
  it('returns true for PG code 23505 (unique_violation)', () => {
    const error = Object.assign(new Error('duplicate key'), { code: '23505' });
    expect(isUniqueViolation(error)).toBe(true);
  });

  it('returns false for other PG error codes', () => {
    const error = Object.assign(new Error('other error'), { code: '23503' });
    expect(isUniqueViolation(error)).toBe(false);
  });

  it('returns false for non-PG errors (no code property)', () => {
    const error = new Error('generic error');
    expect(isUniqueViolation(error)).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
  });
});

describe('hashStringToBigInt (ADR-014)', () => {
  it('converts a string to a BigInt for advisory lock key', () => {
    const result = hashStringToBigInt('evt_123456');
    expect(typeof result).toBe('bigint');
    expect(result).toBeGreaterThan(0n);
  });

  it('is deterministic — same input produces same output', () => {
    const a = hashStringToBigInt('evt_test');
    const b = hashStringToBigInt('evt_test');
    expect(a).toBe(b);
  });

  it('produces different outputs for different inputs', () => {
    const a = hashStringToBigInt('evt_one');
    const b = hashStringToBigInt('evt_two');
    expect(a).not.toBe(b);
  });

  it('fits in a 64-bit integer (Postgres advisory lock range)', () => {
    const result = hashStringToBigInt('evt_very_long_event_id_string_for_testing');
    // Postgres advisory lock keys are bigint (64-bit signed)
    expect(result < 2n ** 63n).toBe(true);
    expect(result > -(2n ** 63n)).toBe(true);
  });
});
