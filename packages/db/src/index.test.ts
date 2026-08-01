/**
 * Maison — DB schema tests
 *
 * Verifies the schema is importable and key tables exist.
 * Does NOT test against a real database (those are integration tests).
 */

import { describe, it, expect } from 'vitest';

import * as schema from './index';

describe('DB schema', () => {
  it('exports all required tables', () => {
    expect(schema.users).toBeDefined();
    expect(schema.sessions).toBeDefined();
    expect(schema.accounts).toBeDefined();
    expect(schema.customers).toBeDefined();
    expect(schema.addresses).toBeDefined();
    expect(schema.collections).toBeDefined();
    expect(schema.products).toBeDefined();
    expect(schema.productVariants).toBeDefined();
    expect(schema.productImages).toBeDefined();
    expect(schema.carts).toBeDefined();
    expect(schema.cartItems).toBeDefined();
    expect(schema.orders).toBeDefined();
    expect(schema.lineItems).toBeDefined();
    expect(schema.wishlistItems).toBeDefined();
    expect(schema.discounts).toBeDefined();
    expect(schema.auditLog).toBeDefined();
    expect(schema.paymentEvents).toBeDefined(); // ADR-014
  });

  it('exports enum types', () => {
    expect(schema.userRoleEnum).toBeDefined();
    expect(schema.orderStatusEnum).toBeDefined();
    expect(schema.discountTypeEnum).toBeDefined();
    expect(schema.shippingMethodEnum).toBeDefined();
  });

  it('has correct role values (ADR-008)', () => {
    expect(schema.userRoleEnum.enumValues).toEqual(['customer', 'staff', 'manager', 'owner']);
  });

  it('has correct order status values', () => {
    expect(schema.orderStatusEnum.enumValues).toEqual([
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ]);
  });
});
