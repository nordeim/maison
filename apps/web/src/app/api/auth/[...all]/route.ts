/**
 * Maison — Better Auth catch-all route handler
 *
 * Better Auth handles all /api/auth/* routes (sign-in, sign-up, callback, etc.)
 * from this single catch-all handler.
 */

import { auth } from "@maison/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
