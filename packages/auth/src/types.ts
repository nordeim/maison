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

/** Helper to check if a session belongs to an owner (highest privilege — ADR-008). */
export function isAdmin(session: Session | null): boolean {
  return session?.user.role === 'owner';
}

/** Helper to check if a session belongs to staff, manager, or owner (staff-tier — ADR-008). */
export function isStaffOrAdmin(session: Session | null): boolean {
  return (
    session?.user.role === 'staff' ||
    session?.user.role === 'manager' ||
    session?.user.role === 'owner'
  );
}
