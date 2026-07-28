/**
 * Maison — Better Auth server configuration
 *
 * Features:
 * - Drizzle adapter (uses our users, session, account, verification tables)
 * - Email/password authentication (v1; OAuth in Phase 2)
 * - Custom session plugin (enriches session with role)
 * - Rate limiting (built-in, DB-backed)
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §3.4:
 * uses process.env directly (not Zod env module) for build-context compatibility.
 *
 * C4 fix (from Stillwater): NO placeholder fallback for BETTER_AUTH_SECRET in
 * production. The app MUST fail fast rather than silently using a known secret.
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { customSession } from 'better-auth/plugins/custom-session';
import { eq } from 'drizzle-orm';
import { db, users } from '@maison/db';
import { resend } from './resend-client';

const isBuildContext =
  process.env['NEXT_PHASE'] === 'phase-production-build' || process.env['NODE_ENV'] === 'test';

// ── BETTER_AUTH_SECRET — fail fast in production ────────────────────
const secret = process.env['BETTER_AUTH_SECRET'];
if (!secret && !isBuildContext) {
  throw new Error(
    'BETTER_AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` ' +
      'and add it to .env.local. Without it, session cookies cannot be signed.',
  );
}
// During build/test, use a random 32-byte base64 string so Better Auth
// doesn't throw "You are using the default secret".
const effectiveSecret = secret ?? cryptoRandomSecret();

// ── BETTER_AUTH_URL — fail fast in production ───────────────────────
const baseURL = process.env['BETTER_AUTH_URL'];
if (!baseURL && !isBuildContext) {
  throw new Error(
    '[auth] BETTER_AUTH_URL is not set. Set it to your app URL ' +
      '(http://localhost:3000 for dev, https://maison-living.com for prod) ' +
      'in .env.local or Vercel project settings.',
  );
}
const effectiveBaseURL = baseURL ?? 'http://localhost:3000';

const emailFrom = process.env['EMAIL_FROM'] ?? 'hello@maison-living.com';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    // Use our plural table names (Better Auth defaults are singular)
    schema: {
      user: { modelName: 'users' },
      session: { modelName: 'session' },
      account: { modelName: 'account' },
      verification: { modelName: 'verification' },
    },
  }),
  secret: effectiveSecret,
  baseURL: effectiveBaseURL,

  // Email/password authentication (v1)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Phase 2: enable email verification
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // NOTE: In Better Auth 1.6.25 the `sendResetPassword` callback receives the
    // full user object — not a bare `email` string. The old `({ email, url })`
    // signature was a silent runtime bug: `email` was `undefined`, so reset
    // emails were sent to nobody. Derive the recipient from `user.email`.
    sendResetPassword: async ({ user, url, token }) => {
      await resend.emails.send({
        from: emailFrom,
        to: user.email,
        subject: 'Reset your Maison password',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1f1b17;">
            <h1 style="font-family: Georgia, serif; color: #1f1b17;">Reset your password</h1>
            <p style="font-size: 16px; line-height: 1.65; color: #4a433b;">
              We received a request to reset your Maison password. Click the link below to choose a new one.
              This link expires in 10 minutes.
            </p>
            <a href="${url}" style="display: inline-block; background: #a86b4a; color: #faf8f5;
                padding: 12px 24px; text-decoration: none; font-weight: 500; margin: 16px 0;
                font-family: -apple-system, sans-serif; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase;">
              Reset password
            </a>
            <p style="color: #8a8178; font-size: 14px;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    },
  },

  // Rate limiting (built-in, DB-backed — tracks per IP + email)
  rateLimit: {
    window: 15 * 60, // 15 minutes (in seconds)
    max: 10, // 10 requests per window per IP
    customRules: {
      '/api/auth/sign-in/email': { window: 15 * 60, max: 10 },
      '/api/auth/sign-up/email': { window: 15 * 60, max: 5 },
      '/api/auth/callback/*': { window: 15 * 60, max: 15 },
    },
  },

  // OAuth providers (Phase 2 — Google, Apple)
  // Kept here for reference; uncomment when credentials are configured.
  // socialProviders: {
  //   google: {
  //     clientId: process.env["GOOGLE_CLIENT_ID"]!,
  //     clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
  //     scope: ["email", "profile"],
  //   },
  // },

  plugins: [
    // Custom session — enriches session with the user's role from the users table
    customSession(async (sessionData) => {
      const user = sessionData.user;
      // Look up the user to get their role (custom column not in Better Auth's default schema)
      const [dbUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      return {
        ...sessionData,
        user: {
          ...user,
          role: dbUser?.role ?? 'customer',
        },
      };
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

/**
 * Generates a random 32-byte base64 secret for build/test contexts.
 * Better Auth rejects undefined secrets and known-default strings;
 * a random string passes validation and is never used for actual signing.
 */
function cryptoRandomSecret(): string {
  const { randomBytes } = require('node:crypto') as {
    randomBytes: (n: number) => Buffer;
  };
  return randomBytes(32).toString('base64');
}
