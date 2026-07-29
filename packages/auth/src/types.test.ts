import { describe, it, expect } from 'vitest';

import type { Session } from './types';
import { isAdmin, isStaffOrAdmin } from './types';

function sessionFor(role: 'customer' | 'staff' | 'manager' | 'owner'): Session {
  return {
    user: {
      id: 'u_1',
      email: 'guest@maison.test',
      name: 'Guest',
      image: null,
      role,
    },
    session: {
      id: 's_1',
      expiresAt: new Date('2030-01-01'),
    },
  };
}

describe('isAdmin (owner-tier — ADR-008)', () => {
  it('returns true for an owner session', () => {
    expect(isAdmin(sessionFor('owner'))).toBe(true);
  });

  it.each(['staff', 'manager', 'customer'] as const)('returns false for a %s session', (role) => {
    expect(isAdmin(sessionFor(role))).toBe(false);
  });

  it('returns false for a null session', () => {
    expect(isAdmin(null)).toBe(false);
  });
});

describe('isStaffOrAdmin (staff-tier — ADR-008)', () => {
  it.each(['staff', 'manager', 'owner'] as const)('returns true for a %s session', (role) => {
    expect(isStaffOrAdmin(sessionFor(role))).toBe(true);
  });

  it('returns false for a customer session', () => {
    expect(isStaffOrAdmin(sessionFor('customer'))).toBe(false);
  });

  it('returns false for a null session', () => {
    expect(isStaffOrAdmin(null)).toBe(false);
  });
});
