/**
 * Maison — tRPC router factory, context type, and procedure tiers
 *
 * Three procedure tiers (per PRD §6):
 *   publicProcedure    — no auth required (browse, search, cart)
 *   protectedProcedure — any authenticated user (account, wishlist, checkout)
 *   adminProcedure     — staff or admin role (admin.* procedures)
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §5.8.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import type { DrizzleDB } from '@maison/db';
import type { Session } from '@maison/auth';

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

// ── Procedure tiers ────────────────────────────────────────────────

/** Tier 1: Public — no auth required. */
export const publicProcedure = t.procedure;

/** Tier 2: Protected — any authenticated user. */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, session: ctx.session } });
});

/** Tier 3: Admin — staff or admin role. */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.session.user.role;
  if (role !== 'staff' && role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});

/** Tier 4: Admin write — admin role only (mutations). */
export const adminWriteProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.session.user.role;
  if (role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});
