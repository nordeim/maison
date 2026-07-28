/**
 * Maison — Contact router
 *
 * Public procedure for contact form submissions. Sends email via Resend.
 */

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { rateLimitMiddleware } from '../middleware/rateLimit';

const rateLimited = publicProcedure.use(rateLimitMiddleware);

export const contactRouter = router({
  submit: rateLimited
    .input(
      z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        message: z.string().min(10).max(5000),
      }),
    )
    .mutation(async ({ input }) => {
      // Phase 1: send via Resend (wired in packages/email)
      // For now, log — the email package will be wired in apps/web
      console.log(`[contact] From ${input.name} <${input.email}>: ${input.message.slice(0, 100)}…`);

      return { success: true };
    }),
});
