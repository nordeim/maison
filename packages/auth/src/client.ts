/**
 * Maison — Better Auth client (browser-side)
 *
 * Used by Client Components to sign in, sign out, and read the current session.
 * Import from "@maison/auth/client" in "use client" components only.
 */

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'https://maison.jesspete.shop',
});

// NOTE: Better Auth 1.6.25 renamed the client method `forgetPassword` to
// `requestPasswordReset` (the underlying route moved from /forget-password to
// /request-password-reset). `resetPassword` remains the POST /reset-password
// handler that actually changes the password.
export const { signIn, signOut, signUp, useSession, resetPassword, requestPasswordReset } =
  authClient;
