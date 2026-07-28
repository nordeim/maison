import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Stripe singleton so tests never touch the network or env vars.
// vi.hoisted is required because vi.mock factories are hoisted above
// top-level const declarations.
const { createRefundMock } = vi.hoisted(() => ({
  createRefundMock: vi.fn(),
}));

vi.mock('./client', () => ({
  stripe: {
    refunds: { create: createRefundMock },
  },
}));

import { createRefund } from './refunds';

// Re-export so the rest of the file can reference the hoisted spy.
const createRefundSpy = createRefundMock;

describe('createRefund', () => {
  beforeEach(() => {
    createRefundSpy.mockReset();
  });

  it('omits `amount` when amountCents is undefined (full refund)', async () => {
    createRefundSpy.mockResolvedValue({
      id: 're_123',
      amount: 5000,
      status: 'succeeded',
    });

    await createRefund('pi_test_1');

    expect(createRefundSpy).toHaveBeenCalledTimes(1);
    const payload = createRefundSpy.mock.calls[0]![0];
    expect(payload).toEqual({
      payment_intent: 'pi_test_1',
      reason: 'requested_by_customer',
    });
    // Critical: the conditional-spread idiom must NOT leak an `amount` key.
    expect(payload).not.toHaveProperty('amount');
  });

  it('includes `amount` only when amountCents is provided (partial refund)', async () => {
    createRefundSpy.mockResolvedValue({
      id: 're_456',
      amount: 2500,
      status: 'pending',
    });

    await createRefund('pi_test_2', 2500);

    const payload = createRefundSpy.mock.calls[0]![0];
    expect(payload).toEqual({
      payment_intent: 'pi_test_2',
      amount: 2500,
      reason: 'requested_by_customer',
    });
  });

  it('forwards an explicit reason and normalises the status into the union', async () => {
    createRefundSpy.mockResolvedValue({
      id: 're_789',
      amount: 1000,
      status: 'requires_action',
    });

    const result = await createRefund('pi_test_3', 1000, 'duplicate');

    expect(createRefundSpy.mock.calls[0]![0]).toMatchObject({ reason: 'duplicate' });
    expect(result).toEqual({
      refundId: 're_789',
      amountCents: 1000,
      status: 'requires_action',
    });
  });
});
