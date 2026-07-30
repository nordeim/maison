/**
 * Maison — Shared auth types
 */

import type { UserRole } from '@maison/db';

/** Session user (enriched with role from users table). */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
}

export type { UserRole } from '@maison/db';

/** Full session shape returned by auth.api.getSession(). */
export interface Session {
  user: SessionUser;
  session: {
    id: string;
    expiresAt: Date;
  };
}

// NOTE: The deprecated `isAdmin` and `isStaffOrAdmin` helpers were removed
// in REMEDIATION_PLAN_v8 Task 1.2. They used "admin" terminology banned per
// ADR-008. Use `canAccessOwner(session?.user.role)` and
// `canAccessStaff(session?.user.role)` from `./rbac` instead.
