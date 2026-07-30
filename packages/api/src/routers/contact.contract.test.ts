/**
 * Maison — Contact router contract test (G1)
 *
 * Locks the invariant that the `contact.submit` tRPC mutation actually sends
 * an email via `@maison/email`'s `sendEmail` function (not just `console.log`).
 *
 * Background:
 *   The bug was identified via agent-browser E2E testing of the live site
 *   https://maison.jesspete.shop/ — see docs/REMEDIATION_PLAN_v6.md Task 1.1.
 *   The contact form was non-functional AND the backend mutation only logged.
 *
 * Root cause:
 *   `packages/api/src/routers/contact.ts` `submit` mutation only `console.log`s
 *   the message — doesn't send email via Resend (per PRD §10.1 L1160 which
 *   says "send email via Resend").
 *
 * Fix:
 *   The mutation must call `sendEmail` from `@maison/email` to send a
 *   notification email to `hello@maison-living.com` with the submitter's
 *   name, email, and message.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTACT_ROUTER = join(HERE, 'contact.ts');

const source = readFileSync(CONTACT_ROUTER, 'utf8');

describe('G1 — contact.submit mutation is wired to sendEmail', () => {
  it('imports sendEmail from @maison/email', () => {
    expect(source).toMatch(/from\s+['"]@maison\/email['"]/);
    expect(source).toMatch(/\bsendEmail\b/);
  });

  it('does NOT only console.log the message (must call sendEmail)', () => {
    // The bug: the mutation body was just `console.log(...)` + `return { success: true }`.
    // The fix: the mutation calls `sendEmail(...)` to actually send the email.
    // Assert that `sendEmail` is CALLED (with parentheses or as a tagged template),
    // not just imported or referenced in a comment.
    expect(source).toMatch(/sendEmail\s*\(/);
  });

  it('sends to hello@maison-living.com (the contact address shown on the page)', () => {
    // The contact page footer shows "hello@maison-living.com" — the mutation
    // should send the notification there.
    expect(source).toMatch(/hello@maison-living\.com/);
  });
});
