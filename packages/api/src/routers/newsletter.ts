/**
 * Maison — Newsletter router
 *
 * Public procedure for email capture. Syncs to Klaviyo in Phase 2.
 */

import { z } from 'zod';
import { router, publicProcedure, middleware } from '../trpc';
import { rateLimitMiddleware } from '../middleware/rateLimit';

const rateLimited = publicProcedure.use(rateLimitMiddleware);

export const newsletterRouter = router({
  subscribe: rateLimited
    .input(
      z.object({
        email: z.email(),
        source: z.enum(['footer', 'newsletter_section', 'popup']).default('footer'),
      }),
    )
    .mutation(async ({ input }) => {
      // Phase 2: sync to Klaviyo
      // For now, just log (in production, this would write to a subscribers table or queue)
      console.log(`[newsletter] New subscriber from ${input.source}: ${input.email}`);

      return { success: true };
    }),
});
