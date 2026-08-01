/**
 * Maison — Contact router
 *
 * Public procedure for contact form submissions. Sends a notification email
 * to hello@maison-living.com via Resend (wired through @maison/email).
 *
 * Per PRD §10.1 (CK-013: Contact form submission) and REMEDIATION_PLAN_v6 Task 1.1 (G1).
 */

import { z } from 'zod';

import { sendEmail, ContactNotificationEmail } from '@maison/email';

import { rateLimitMiddleware } from '../middleware/rateLimit';
import { router, publicProcedure } from '../trpc';

const rateLimited = publicProcedure.use(rateLimitMiddleware);

const CONTACT_NOTIFICATION_TO = 'hello@maison-living.com';

export const contactRouter = router({
  submit: rateLimited
    .input(
      z.object({
        name: z.string().min(1).max(100),
        email: z.email(),
        message: z.string().min(10).max(5000),
      }),
    )
    .mutation(async ({ input }) => {
      // Send a notification email to the Maison team via Resend.
      // In dev/test (no RESEND_API_KEY), sendEmail logs the payload as a stub.
      try {
        await sendEmail({
          to: CONTACT_NOTIFICATION_TO,
          subject: `New contact form submission from ${input.name}`,
          react: ContactNotificationEmail({
            name: input.name,
            email: input.email,
            message: input.message,
          }),
        });
      } catch (err) {
        // Log the failure but don't expose it to the client — the form
        // submission itself is valid, the email send is best-effort.
        console.error('[contact] Failed to send notification email:', err);
      }

      console.log('[contact] Submission received (PII redacted)');

      return { success: true };
    }),
});
