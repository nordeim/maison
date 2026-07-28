/**
 * Maison — tRPC HTTP endpoint
 *
 * Handles client-side tRPC requests (mutations, queries that need fresh data).
 * Server Components use the server caller directly (src/lib/trpc/server.ts).
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter, createContext } from '@maison/api';
import { env } from '@maison/config';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    // Attach `onError` only in dev so production satisfies
    // exactOptionalPropertyTypes (no explicit `undefined`).
    ...(env.NODE_ENV === 'development'
      ? {
          onError: ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          },
        }
      : {}),
  });

export { handler as GET, handler as POST };
