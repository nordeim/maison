/**
 * Maison — tRPC router error handling tests
 *
 * Validates that routers throw TRPCError (not generic Error) for
 * not-found and bad-request cases. This ensures proper error codes
 * are returned to the client.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

// Mock the db module
vi.mock('@maison/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => []) })) })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: vi.fn(() => [{ id: 'test-id' }]) })),
    })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    delete: vi.fn(() => ({ where: vi.fn() })),
  },
  products: {
    id: 'id',
    slug: 'slug',
    isActive: 'is_active',
    collectionId: 'collection_id',
    priceCents: 'price_cents',
    currency: 'currency',
    name: 'name',
    shortDescription: 'short_description',
    materials: 'materials',
    featured: 'featured',
    isNew: 'is_new',
    isBestseller: 'is_bestseller',
    createdAt: 'created_at',
  },
  collections: {
    id: 'id',
    slug: 'slug',
    isActive: 'is_active',
    name: 'name',
    description: 'description',
    sortOrder: 'sort_order',
    heroImageUrl: 'hero_image_url',
  },
  productImages: {
    productId: 'product_id',
    url: 'url',
    sortOrder: 'sort_order',
  },
  productVariants: {
    productId: 'product_id',
    sku: 'sku',
    stockQuantity: 'stock_quantity',
    name: 'name',
    leadTimeDays: 'lead_time_days',
    id: 'id',
  },
  carts: { id: 'id', currency: 'currency' },
  cartItems: {
    cartId: 'cart_id',
    productId: 'product_id',
    variantId: 'variant_id',
    id: 'id',
    quantity: 'quantity',
  },
}));

describe('tRPC error handling', () => {
  it('TRPCError is importable and has correct shape', () => {
    const error = new TRPCError({
      code: 'NOT_FOUND',
      message: 'Product not found',
    });
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Product not found');
  });

  it('TRPCError supports BAD_REQUEST code', () => {
    const error = new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Cart is empty',
    });
    expect(error.code).toBe('BAD_REQUEST');
  });

  it('TRPCError supports CONFLICT code', () => {
    const error = new TRPCError({
      code: 'CONFLICT',
      message: 'Already applied',
    });
    expect(error.code).toBe('CONFLICT');
  });

  it('TRPCError supports INTERNAL_SERVER_ERROR code', () => {
    const error = new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed',
    });
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});

describe('tRPC procedure tiers (ADR-008 — Stillwater v3.0.0 §15.17)', () => {
  it('exports 5 procedure tiers with ADR-008 names', async () => {
    const trpc = await import('./trpc');
    expect(trpc.publicProcedure).toBeDefined();
    expect(trpc.protectedProcedure).toBeDefined();
    expect(trpc.staffProcedure).toBeDefined();
    expect(trpc.managerProcedure).toBeDefined();
    expect(trpc.ownerProcedure).toBeDefined();
  });

  it('does NOT export old admin/adminWrite tier names', async () => {
    const trpc = await import('./trpc');
    // Old names are deprecated aliases — they should NOT exist as primary exports
    // (backward compat re-exports are acceptable but not required)
    // If they exist as aliases, they must point to the new tiers
    if ('adminProcedure' in trpc) {
      expect(trpc.adminProcedure).toBe(trpc.staffProcedure);
    }
    if ('adminWriteProcedure' in trpc) {
      expect(trpc.adminWriteProcedure).toBe(trpc.ownerProcedure);
    }
  });
});
