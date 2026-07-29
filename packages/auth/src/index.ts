export { auth } from './config';
export type { Session } from './config';
export {
  authClient,
  signIn,
  signOut,
  signUp,
  useSession,
  resetPassword,
  requestPasswordReset,
} from './client';
export {
  ROLES,
  STAFF_ROLES,
  OWNER_ROLES,
  canAccessStaff,
  canAccessOwner,
  isValidRole,
  // Deprecated aliases (backward compat — ADR-008)
  ADMIN_ROLES,
  ADMIN_WRITE_ROLES,
  canReadAdmin,
  canWriteAdmin,
} from './rbac';
export type { UserRole, SessionUser } from './types';
export { isAdmin, isStaffOrAdmin } from './types';
