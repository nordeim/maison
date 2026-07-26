/**
 * Maison — tRPC context builder
 *
 * Runs on every request. Assembles db + session.
 * Session lookup has a 5s timeout to prevent DB hangs from blocking the page
 * (per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §15.20).
 */

import { db } from "@maison/db";
import { auth } from "@maison/auth";
import type { TRPCContext } from "./trpc";

const SESSION_LOOKUP_TIMEOUT_MS = 5_000;

async function getSessionWithTimeout(headers: Headers) {
  const sessionPromise = auth.api.getSession({ headers });
  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), SESSION_LOOKUP_TIMEOUT_MS);
  });
  return Promise.race([sessionPromise, timeout]);
}

export async function createContext({ req }: { req: Request }): Promise<TRPCContext> {
  const session = await getSessionWithTimeout(req.headers);
  return { db, session: session as TRPCContext["session"], req };
}

export type { TRPCContext } from "./trpc";
