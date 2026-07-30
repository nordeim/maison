/**
 * Maison — RBAC (Role-Based Access Control)
 *
 * Four roles per ADR-008 (aligned with Stillwater v3.0.0 §15.17):
 * - customer: own account, orders, wishlist, addresses
 * - staff: customer permissions + admin READ access (staffProcedure)
 * - manager: staff permissions (no dedicated procedure tier — admin
 *   mutations use ownerProcedure per REMEDIATION_PLAN_v8 Task 1.5)
 * - owner: full access including role management (ownerProcedure)
 *
 * tRPC procedure tiers (ADR-008 — 4 tiers per REMEDIATION_PLAN_v8):
 *   publicProcedure    → no auth
 *   protectedProcedure → any authenticated user
 *   staffProcedure     → roles: staff, manager, owner
 *   ownerProcedure     → role: owner only (admin mutations, role management)
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

// NOTE: ADR-008 — deprecated aliases `canReadAdmin`, `canWriteAdmin`,
// `ADMIN_ROLES`, and `ADMIN_WRITE_ROLES` were removed in REMEDIATION_PLAN_v7
// Task 1.6. Use the canonical helpers: `canAccessStaff`, `canAccessOwner`,
// `STAFF_ROLES`, `OWNER_ROLES`.
