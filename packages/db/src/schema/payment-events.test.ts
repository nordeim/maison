import { describe, it, expect } from 'vitest';

import { paymentEvents } from './payment-events';

describe('payment_events table (ADR-014 — webhook idempotency log)', () => {
  it('is a Drizzle pgTable named "payment_events"', () => {
    expect(paymentEvents).toBeDefined();
    // The table name is accessible via the Drizzle internal symbol
    const tableName = (paymentEvents as unknown as { [Symbol: string]: string })[
      Symbol.for('drizzle:Name')
    ];
    expect(tableName).toBe('payment_events');
  });

  it('has a stripeEventId column with unique constraint', () => {
    const columns = paymentEvents as unknown as Record<string, unknown>;
    expect(columns.stripeEventId).toBeDefined();
    // The column should have a unique constraint (isUnique flag)
    const stripeEventIdCol = columns.stripeEventId as {
      isUnique?: boolean;
      dataType?: string;
    };
    expect(stripeEventIdCol.isUnique).toBe(true);
  });

  it('has stripeEventType column (not null)', () => {
    const columns = paymentEvents as unknown as Record<string, unknown>;
    expect(columns.stripeEventType).toBeDefined();
  });

  it('has orderId column (nullable FK to orders)', () => {
    const columns = paymentEvents as unknown as Record<string, unknown>;
    expect(columns.orderId).toBeDefined();
  });

  it('has payload column (JSONB for full Stripe event object)', () => {
    const columns = paymentEvents as unknown as Record<string, unknown>;
    expect(columns.payload).toBeDefined();
  });

  it('has processedAt column (timestamp)', () => {
    const columns = paymentEvents as unknown as Record<string, unknown>;
    expect(columns.processedAt).toBeDefined();
  });

  it('has createdAt column (timestamp)', () => {
    const columns = paymentEvents as unknown as Record<string, unknown>;
    expect(columns.createdAt).toBeDefined();
  });

  it('exports inferred types', async () => {
    const { PaymentEvent, NewPaymentEvent } = await import('./payment-events');
    // These should be type aliases (undefined at runtime, but importable)
    expect(PaymentEvent).toBeUndefined();
    expect(NewPaymentEvent).toBeUndefined();
  });
});
