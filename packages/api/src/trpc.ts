import 'server-only';
/**
 * Maison — tRPC router factory, context type, and procedure tiers
 *
 * Four procedure tiers per ADR-008 (aligned with Stillwater v3.0.0 §15.17):
 *   publicProcedure    — no auth required (browse, search, cart)
 *   protectedProcedure — any authenticated user (account, wishlist, checkout)
 *   staffProcedure     — staff, manager, or owner role (admin read access)
 *   ownerProcedure     — owner role only (admin mutations, role management, store settings)
 *
 * RBAC roles (packages/db/src/schema/enums.ts):
 *   customer (default), staff, manager, owner
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §5.8
 * and Stillwater v3.0.0 §15.17.
 */

import { initTRPC, TRPCError } from '@trpc/server';

import type { Session } from '@maison/auth';
import type { DrizzleDB } from '@maison/db';

// ── Context shape ──────────────────────────────────────────────────
export interface TRPCContext {
  db: DrizzleDB;
  session: Session | null;
  req: Request;
}

// ── tRPC instance ──────────────────────────────────────────────────
const t = initTRPC.context<TRPCContext>().create();

// ── Router factory ─────────────────────────────────────────────────
export const router = t.router;
export const middleware = t.middleware;

// ── Procedure tiers (ADR-008) ──────────────────────────────────────

/** Tier 1: Public — no auth required. */
export const publicProcedure = t.procedure;

/** Tier 2: Protected — any authenticated user. */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, session: ctx.session } });
});

/**
 * Tier 2 + Rate Limit — protected procedure with rate limiting applied.
 *
 * This builder preserves the session type narrowing from protectedProcedure
 * because the inline .use() infers from the narrowed output context.
 * The standalone rateLimitMiddleware (in middleware/rateLimit.ts) loses
 * the narrowing because it's a t.middleware() with the original TRPCContext.
 *
 * Per REMEDIATION_PLAN_v12 Task 3.
 */
export const protectedRateLimitedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const identifier =
    ctx.session.user.id ??
    ctx.req.headers.get('x-forwarded-for') ??
    ctx.req.headers.get('x-real-ip') ??
    'anonymous';

  // Fail open: if Redis is not configured, allow the request
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && !url.includes('placeholder')) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url, token });
      const ratelimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
      });
      const { success } = await ratelimiter.limit(`tRPC:${identifier}`);
      if (!success) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
      }
    } catch (e) {
      if (e instanceof TRPCError) throw e;
      console.error('[rateLimit] Redis check failed, failing open:', e);
    }
  }

  return next({ ctx });
});

/** Tier 3: Staff — staff, manager, or owner role (admin read access). */
export const staffProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.session.user.role;
  if (role !== 'staff' && role !== 'manager' && role !== 'owner') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});

/** Tier 4: Owner — owner role only (role management, store settings, admin writes). */
export const ownerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.session.user.role;
  if (role !== 'owner') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});

// NOTE: ADR-008 — deprecated aliases `adminProcedure` and `adminWriteProcedure`
// were removed in REMEDIATION_PLAN_v4 Task 1.1. `managerProcedure` was removed
// in REMEDIATION_PLAN_v8 Task 1.5 (dead code — admin mutations use `ownerProcedure`).
// The 4 canonical tiers are: publicProcedure, protectedProcedure, staffProcedure,
// ownerProcedure. If ADR-008 is later amended to require a manager-tier, it can
// be re-added.
