/**
 * Maison — Rate limiting middleware (Upstash Redis, fail-open)
 *
 * FAIL OPEN: if Redis is down, allow the request. Log for review.
 * Rationale: blocking legitimate users during a Redis outage is worse
 * than allowing a brief window of unthrottled traffic.
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §5.8
 * and PROJECT-ARCHITECTURE.md §6.2.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";

let cachedRatelimiter: Ratelimit | null = null;

function getRatelimiter(): Ratelimit | null {
  if (cachedRatelimiter) return cachedRatelimiter;

  const url = process.env["UPSTASH_REDIS_REST_URL"];
  const token = process.env["UPSTASH_REDIS_REST_TOKEN"];

  if (!url || !token || url.includes("placeholder")) {
    return null; // Fail open — no Redis configured
  }

  const redis = new Redis({ url, token });
  cachedRatelimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 req/min per identifier
  });
  return cachedRatelimiter;
}

export const rateLimitMiddleware = middleware(async ({ ctx, next }) => {
  const identifier =
    ctx.session?.user.id ??
    ctx.req.headers.get("x-forwarded-for") ??
    ctx.req.headers.get("x-real-ip") ??
    "anonymous";

  const ratelimiter = getRatelimiter();

  // Fail open: if Redis is not configured, allow the request
  if (!ratelimiter) {
    return next({ ctx });
  }

  try {
    const { success } = await ratelimiter.limit(`tRPC:${identifier}`);
    if (!success) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }
  } catch (e) {
    // Fail open: if Redis is down, allow the request
    if (e instanceof TRPCError) throw e;
    console.error("[rateLimit] Redis check failed, failing open:", e);
  }

  return next({ ctx });
});
