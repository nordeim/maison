/**
 * Maison — Better Auth client (browser-side)
 *
 * Used by Client Components to sign in, sign out, and read the current session.
 * Import from "@maison/auth/client" in "use client" components only.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  resetPassword,
  forgetPassword,
} = authClient;
