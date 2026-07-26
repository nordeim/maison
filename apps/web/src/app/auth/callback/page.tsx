/**
 * Maison — OAuth callback page
 *
 * Better Auth handles the callback automatically via the catch-all route at
 * /api/auth/[...all]. This page is a fallback for any client-side redirect
 * needed after authentication.
 */

import { redirect } from "next/navigation";

export default function CallbackPage() {
  redirect("/account");
}
