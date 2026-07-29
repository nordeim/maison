/**
 * Maison — tRPC router factory, context type, and procedure tiers
 *
 * Five procedure tiers per ADR-008 (aligned with Stillwater v3.0.0 §15.17):
 *   publicProcedure    — no auth required (browse, search, cart)
 *   protectedProcedure — any authenticated user (account, wishlist, checkout)
 *   staffProcedure     — staff, manager, or owner role (admin read access)
 *   managerProcedure   — manager or owner role (admin mutations — products, orders)
 *   ownerProcedure     — owner role only (role management, store settings)
 *
 * RBAC roles (packages/db/src/schema/enums.ts):
 *   customer (default), staff, manager, owner
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §5.8
 * and Stillwater v3.0.0 §15.17.
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

// ── Procedure tiers (ADR-008) ──────────────────────────────────────

/** Tier 1: Public — no auth required. */
export const publicProcedure = t.procedure;

/** Tier 2: Protected — any authenticated user. */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, session: ctx.session } });
});

/** Tier 3: Staff — staff, manager, or owner role (admin read access). */
export const staffProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.session.user.role;
  if (role !== 'staff' && role !== 'manager' && role !== 'owner') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});

/** Tier 4: Manager — manager or owner role (admin mutations). */
export const managerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.session.user.role;
  if (role !== 'manager' && role !== 'owner') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});

/** Tier 5: Owner — owner role only (role management, store settings). */
export const ownerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.session.user.role;
  if (role !== 'owner') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});

// NOTE: ADR-008 — deprecated aliases `adminProcedure` and `adminWriteProcedure`
// were removed in REMEDIATION_PLAN_v4 Task 1.1. Routers MUST import canonical
// tier names (`staffProcedure` for admin reads, `ownerProcedure` for admin writes).
// `managerProcedure` is defined for future use (manager-or-owner admin mutations
// such as product/order CRUD) but not yet wired into routers — see
// REMEDIATION_PLAN_v4 §"Deferred Items" for the design decision.
