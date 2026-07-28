/**
 * Maison — RBAC (Role-Based Access Control)
 *
 * Three roles: customer, staff, admin.
 * - customer: own account, orders, wishlist, addresses
 * - staff: customer permissions + admin READ access
 * - admin: full access (all admin.* procedures)
 *
 * Checked in tRPC middleware (packages/api/src/middleware/auth.ts),
 * NOT in proxy.ts (proxy only checks "is authenticated").
 */

import type { UserRole } from '@maison/db';

export type { UserRole } from '@maison/db';

/** All valid roles (mirrors userRoleEnum.enumValues). */
export const ROLES = ['customer', 'staff', 'admin'] as const satisfies readonly UserRole[];

/** Roles that grant admin access (read or write). */
export const ADMIN_ROLES = ['staff', 'admin'] as const satisfies readonly UserRole[];

/** Roles that grant admin WRITE access (mutations). */
export const ADMIN_WRITE_ROLES = ['admin'] as const satisfies readonly UserRole[];

/**
 * Check if a role grants admin READ access.
 */
export function canReadAdmin(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role grants admin WRITE access (mutations).
 */
export function canWriteAdmin(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return (ADMIN_WRITE_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role is a valid UserRole.
 */
export function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (ROLES as readonly string[]).includes(role);
}
