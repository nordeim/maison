import { describe, it, expect } from 'vitest';

import {
  ROLES,
  STAFF_ROLES,
  OWNER_ROLES,
  canAccessStaff,
  canAccessOwner,
  isValidRole,
} from './rbac';

import type { UserRole } from '@maison/db';

describe('RBAC role tables (ADR-008 — aligned with Stillwater v3.0.0 §15.17)', () => {
  it('declares the four Maison roles in escalating-access order', () => {
    expect(ROLES).toEqual(['customer', 'staff', 'manager', 'owner']);
  });

  it('grants staff-tier access to staff + manager + owner (not customers)', () => {
    expect([...STAFF_ROLES]).toEqual(['staff', 'manager', 'owner']);
  });

  it('grants owner-tier access to owner only', () => {
    expect([...OWNER_ROLES]).toEqual(['owner']);
  });
});

describe('canAccessStaff (staffProcedure tier — ADR-008)', () => {
  it.each([
    ['staff', true],
    ['manager', true],
    ['owner', true],
  ] as const)('grants staff-tier access to %s', (role, expected) => {
    expect(canAccessStaff(role)).toBe(expected);
  });

  it('denies staff-tier access to customers', () => {
    expect(canAccessStaff('customer')).toBe(false);
  });

  it.each([null, undefined])(`denies staff-tier access when role is %s`, (role) => {
    expect(canAccessStaff(role)).toBe(false);
  });
});

describe('canAccessOwner (ownerProcedure tier — ADR-008)', () => {
  it('grants owner-tier access to owner', () => {
    expect(canAccessOwner('owner')).toBe(true);
  });

  it.each([
    ['customer', false],
    ['staff', false],
    ['manager', false],
  ] as const)('denies owner-tier access to %s', (role, expected) => {
    expect(canAccessOwner(role)).toBe(expected);
  });

  it.each([null, undefined])(`denies owner-tier access when role is %s`, (role) => {
    expect(canAccessOwner(role)).toBe(false);
  });
});

// Deprecated aliases (canReadAdmin, canWriteAdmin) were removed in
// REMEDIATION_PLAN_v7 Task 1.6. See rbac-aliases.contract.test.ts for the
// invariant that they are NOT exported.

describe('isValidRole', () => {
  it.each(['customer', 'staff', 'manager', 'owner'])('accepts %s as a valid role', (role) => {
    expect(isValidRole(role)).toBe(true);
    // Type guard must narrow so the assignment below type-checks.
    const narrowed: UserRole = role;
    expect(narrowed).toBe(role);
  });

  it.each(['superuser', 'admin', '', 'ADMIN', 'customer ', 0, false, {}, null, undefined])(
    'rejects %p as a role',
    (value) => {
      expect(isValidRole(value)).toBe(false);
    },
  );
});
