/**
 * Maison — tRPC HTTP endpoint
 *
 * Handles client-side tRPC requests (mutations, queries that need fresh data).
 * Server Components use the server caller directly (src/lib/trpc/server.ts).
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@maison/api";
import { env } from "@maison/config";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
