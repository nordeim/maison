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
} from './rbac';
export type { UserRole, SessionUser } from './types';
