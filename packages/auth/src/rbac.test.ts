import { describe, it, expect } from 'vitest';

import {
  ROLES,
  ADMIN_ROLES,
  ADMIN_WRITE_ROLES,
  canReadAdmin,
  canWriteAdmin,
  isValidRole,
} from './rbac';
import type { UserRole } from '@maison/db';

describe('RBAC role tables', () => {
  it('declares the three Maison roles in escalating-access order', () => {
    expect(ROLES).toEqual(['customer', 'staff', 'admin']);
  });

  it('grants admin read access to staff + admin (not customers)', () => {
    expect([...ADMIN_ROLES]).toEqual(['staff', 'admin']);
  });

  it('grants admin write access to admin only', () => {
    expect([...ADMIN_WRITE_ROLES]).toEqual(['admin']);
  });
});

describe('canReadAdmin', () => {
  it.each([
    ['staff', true],
    ['admin', true],
  ] as const)('grants read access to %s', (role, expected) => {
    expect(canReadAdmin(role)).toBe(expected);
  });

  it('denies read access to customers', () => {
    expect(canReadAdmin('customer')).toBe(false);
  });

  it.each([null, undefined])(`denies read access when role is %s`, (role) => {
    expect(canReadAdmin(role)).toBe(false);
  });
});

describe('canWriteAdmin', () => {
  it('grants write access to admin', () => {
    expect(canWriteAdmin('admin')).toBe(true);
  });

  it.each([
    ['customer', false],
    ['staff', false],
  ] as const)('denies write access to %s', (role, expected) => {
    expect(canWriteAdmin(role)).toBe(expected);
  });

  it.each([null, undefined])(`denies write access when role is %s`, (role) => {
    expect(canWriteAdmin(role)).toBe(false);
  });
});

describe('isValidRole', () => {
  it.each(['customer', 'staff', 'admin'])('accepts %s as a valid role', (role) => {
    expect(isValidRole(role)).toBe(true);
    // Type guard must narrow so the assignment below type-checks.
    const narrowed: UserRole = role;
    expect(narrowed).toBe(role);
  });

  it.each(['superuser', '', 'ADMIN', 'customer ', 0, false, {}, null, undefined])(
    'rejects %p as a role',
    (value) => {
      expect(isValidRole(value)).toBe(false);
    },
  );
});
