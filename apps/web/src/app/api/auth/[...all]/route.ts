/**
 * Maison — Better Auth catch-all route handler
 *
 * Better Auth handles all /api/auth/* routes (sign-in, sign-up, callback, etc.)
 * from this single catch-all handler.
 */

import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@maison/auth';

export const { GET, POST } = toNextJsHandler(auth);
