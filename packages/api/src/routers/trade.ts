/**
 * Maison — Trade program router
 *
 * Protected: submit application, check application status.
 * Admin: list applications, approve/reject.
 *
 * Approved applicants get a trade discount (10–20%) applied automatically
 * at checkout via the customers.trade_discount_percent column.
 */

import { TRPCError } from '@trpc/server';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

import { tradeApplications } from '@maison/db';

import {
  router,
  protectedProcedure,
  staffProcedure,
  ownerProcedure,
  protectedRateLimitedProcedure,
} from '../trpc';

export const tradeRouter = router({
  /**
   * Submit a trade application.
   */
  submitApplication: protectedRateLimitedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(50),
        lastName: z.string().min(1).max(50),
        company: z.string().min(1).max(100),
        role: z.string().min(1).max(50),
        website: z.url().optional().or(z.literal('')),
        instagram: z.string().max(50).optional(),
        projectTypes: z.string().max(200).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user already applied
      const [existing] = await ctx.db
        .select()
        .from(tradeApplications)
        .where(eq(tradeApplications.userId, ctx.session.user.id))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message:
            existing.status === 'pending'
              ? 'You already have a pending application.'
              : existing.status === 'approved'
                ? 'Your trade application has already been approved.'
                : 'Your previous application was rejected. Please contact us.',
        });
      }

      const [application] = await ctx.db
        .insert(tradeApplications)
        .values({
          userId: ctx.session.user.id,
          email: ctx.session.user.email,
          firstName: input.firstName,
          lastName: input.lastName,
          company: input.company,
          role: input.role,
          website: input.website || null,
          instagram: input.instagram || null,
          projectTypes: input.projectTypes || null,
          discountPercent: 10, // default; admin can adjust on approval
          status: 'pending',
        })
        .returning({ id: tradeApplications.id });

      if (!application) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'application not found' });
      }
      return { id: application.id };
    }),

  /**
   * Check current user's application status.
   */
  myStatus: protectedProcedure.query(async ({ ctx }) => {
    const [application] = await ctx.db
      .select()
      .from(tradeApplications)
      .where(eq(tradeApplications.userId, ctx.session.user.id))
      .limit(1);

    return application ?? null;
  }),

  /**
   * Admin: list all applications.
   *
   * Shaped at the router boundary: `discountPercent` is nullable in the schema
   * (`.default(10)` only applies on insert), so coerce to the documented default
   * to give admin pages a non-null contract.
   */
  list: staffProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'all']).default('all'),
      }),
    )
    .query(async ({ input, ctx }) => {
      const whereClause =
        input.status === 'all' ? undefined : eq(tradeApplications.status, input.status);

      const rows = whereClause
        ? await ctx.db
            .select()
            .from(tradeApplications)
            .where(whereClause)
            .orderBy(desc(tradeApplications.createdAt))
        : await ctx.db.select().from(tradeApplications).orderBy(desc(tradeApplications.createdAt));

      return rows.map((row) => ({
        ...row,
        discountPercent: row.discountPercent ?? 10,
      }));
    }),

  /**
   * Admin: approve an application.
   * Sets the customer's trade_discount_percent.
   */
  approve: ownerProcedure
    .input(
      z.object({
        applicationId: z.uuid(),
        discountPercent: z.number().int().min(5).max(30).default(10),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [application] = await ctx.db
        .update(tradeApplications)
        .set({
          status: 'approved',
          discountPercent: input.discountPercent,
          reviewedBy: ctx.session.user.id,
          reviewedAt: new Date(),
        })
        .where(eq(tradeApplications.id, input.applicationId))
        .returning({ userId: tradeApplications.userId });

      if (!application?.userId) return { success: true };

      // Set trade discount on customer record
      await ctx.db.execute(sql`
        UPDATE customers
        SET trade_discount_percent = ${input.discountPercent}
        WHERE user_id = ${application.userId}
      `);

      return { success: true };
    }),

  /**
   * Admin: reject an application.
   */
  reject: ownerProcedure
    .input(
      z.object({
        applicationId: z.uuid(),
        notes: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(tradeApplications)
        .set({
          status: 'rejected',
          reviewedBy: ctx.session.user.id,
          reviewedAt: new Date(),
          notes: input.notes,
        })
        .where(eq(tradeApplications.id, input.applicationId));

      return { success: true };
    }),
});
