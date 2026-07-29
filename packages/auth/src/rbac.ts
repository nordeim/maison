/**
 * Maison — RBAC (Role-Based Access Control)
 *
 * Four roles per ADR-008 (aligned with Stillwater v3.0.0 §15.17):
 * - customer: own account, orders, wishlist, addresses
 * - staff: customer permissions + admin READ access (staffProcedure)
 * - manager: staff + admin mutations — products, orders (managerProcedure)
 * - owner: full access including role management (ownerProcedure)
 *
 * tRPC procedure tiers (ADR-008):
 *   publicProcedure    → no auth
 *   protectedProcedure → any authenticated user
 *   staffProcedure     → roles: staff, manager, owner
 *   managerProcedure   → roles: manager, owner
 *   ownerProcedure     → role: owner only
 *
 * Checked in tRPC middleware (packages/api/src/trpc.ts),
 * NOT in proxy.ts (proxy only checks "is authenticated" via cookie-existence).
 */

import type { UserRole } from '@maison/db';

export type { UserRole } from '@maison/db';

/** All valid roles (mirrors userRoleEnum.enumValues). */
export const ROLES = [
  'customer',
  'staff',
  'manager',
  'owner',
] as const satisfies readonly UserRole[];

/** Roles that grant staff-tier access (staffProcedure). */
export const STAFF_ROLES = ['staff', 'manager', 'owner'] as const satisfies readonly UserRole[];

/** Roles that grant owner-tier access (ownerProcedure). */
export const OWNER_ROLES = ['owner'] as const satisfies readonly UserRole[];

/**
 * Check if a role grants staff-tier access (staffProcedure).
 * Staff, manager, and owner can all access staff-tier procedures.
 */
export function canAccessStaff(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return (STAFF_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role grants owner-tier access (ownerProcedure).
 * Only owner can access owner-tier procedures (role management, store settings).
 */
export function canAccessOwner(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return (OWNER_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role is a valid UserRole.
 */
export function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (ROLES as readonly string[]).includes(role);
}

// ── Deprecated aliases (backward compat — will be removed in v2.0) ─────────
// canReadAdmin == canAccessStaff (staff-tier grants admin read)
// canWriteAdmin == canAccessOwner (owner-tier grants admin write/mutations)
// Kept to avoid breaking existing router imports during the ADR-008 migration.

/** @deprecated Use canAccessStaff instead (ADR-008). */
export const canReadAdmin = canAccessStaff;

/** @deprecated Use canAccessOwner instead (ADR-008). */
export const canWriteAdmin = canAccessOwner;

/** @deprecated Use STAFF_ROLES instead (ADR-008). */
export const ADMIN_ROLES = STAFF_ROLES;

/** @deprecated Use OWNER_ROLES instead (ADR-008). */
export const ADMIN_WRITE_ROLES = OWNER_ROLES;
