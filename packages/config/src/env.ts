/**
 * Maison — Environment Variable Schema (t3-env + Zod)
 *
 * Single source of truth for all environment variables. Every package
 * that needs env access imports from @maison/config/env.
 *
 * Direct process.env.* reads bypass validation — typos silently return
 * undefined. Always import env from this module.
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §3.4:
 * uses build-context fallback so `next build` and `vitest` don't throw
 * on missing env vars (they don't execute real queries).
 */

import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

/**
 * Build-context fallback: next build and vitest don't have real env vars.
 * Return placeholders instead of throwing.
 */
function isBuildContext(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test';
}

const PLACEHOLDERS = {
  DATABASE_URL: 'postgresql://placeholder@localhost:5432/placeholder',
  DATABASE_URL_UNPOOLED: 'postgresql://placeholder@localhost:5432/placeholder',
  BETTER_AUTH_SECRET: 'placeholder-secret-at-least-32-characters-long',
  BETTER_AUTH_URL: 'https://maison.jesspete.shop',
  GOOGLE_CLIENT_ID: 'placeholder.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'placeholder',
  STRIPE_SECRET_KEY: 'sk_test_placeholder',
  STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
  RESEND_API_KEY: 're_placeholder',
  EMAIL_FROM: 'hello@maison-living.com',
  TRIGGER_SECRET_KEY: 'tr_dev_placeholder',
  UPSTASH_REDIS_REST_URL: 'https://placeholder.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'placeholder',
  SANITY_API_TOKEN: 'placeholder',
  SANITY_WEBHOOK_SECRET: 'placeholder',
  CLOUDFLARE_ACCOUNT_ID: 'placeholder',
  CLOUDFLARE_IMAGES_TOKEN: 'placeholder',
  CLOUDFLARE_R2_ACCESS_KEY_ID: 'placeholder',
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: 'placeholder',
  CLOUDFLARE_R2_BUCKET: 'maison-media',
  CLOUDFLARE_R2_ENDPOINT: 'https://placeholder.r2.cloudflarestorage.com',
} as const;

const serverSchema = {
  // Database
  DATABASE_URL: z.string().refine((s) => s.startsWith('postgres'), 'Must be a postgresql:// URL'),
  DATABASE_URL_UNPOOLED: z
    .string()
    .refine((s) => s.startsWith('postgres'), 'Must be a postgresql:// URL'),

  // Auth (Better Auth)
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters')
    .superRefine((val, ctx) => {
      const weak = ['dev-secret', 'test-secret', 'ci-dummy', 'change-me', 'placeholder-secret'];
      if (weak.some((w) => val.toLowerCase().includes(w))) {
        ctx.addIssue({
          code: 'custom',
          message: 'Weak secret rejected — use: openssl rand -base64 32',
        });
      }
    }),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Sanity
  SANITY_API_TOKEN: z.string(),
  SANITY_WEBHOOK_SECRET: z.string(),

  // Email
  RESEND_API_KEY: z.string().startsWith('re_'),
  EMAIL_FROM: z.email(),

  // Background jobs
  TRIGGER_SECRET_KEY: z.string().startsWith('tr_'),

  // Redis
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),

  // Observability (optional)
  SENTRY_DSN: z.url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),

  // Cloudflare
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_IMAGES_TOKEN: z.string(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_R2_BUCKET: z.string(),
  CLOUDFLARE_R2_ENDPOINT: z.url(),

  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
};

const clientSchema = {
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string(),
  NEXT_PUBLIC_SANITY_DATASET: z.string(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  NEXT_PUBLIC_POSTHOG_HOST: z.url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  NEXT_PUBLIC_CLOUDFLARE_IMAGES_URL: z.url(),
};

/**
 * Load env with build-context fallback.
 * During `next build` or `vitest`, return placeholders instead of throwing.
 */
function loadEnv() {
  if (isBuildContext()) {
    const serverEntries = Object.entries(serverSchema).map(([key]) => [
      key,
      process.env[key] ?? PLACEHOLDERS[key as keyof typeof PLACEHOLDERS] ?? 'placeholder',
    ]);
    const clientEntries = Object.entries(clientSchema).map(([key]) => [
      key,
      process.env[key] ?? 'placeholder',
    ]);
    return Object.fromEntries([...serverEntries, ...clientEntries]) as Record<string, string>;
  }

  return createEnv({
    clientPrefix: 'NEXT_PUBLIC_',
    server: serverSchema,
    client: clientSchema,
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
      SANITY_WEBHOOK_SECRET: process.env.SANITY_WEBHOOK_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
      TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      AXIOM_TOKEN: process.env.AXIOM_TOKEN,
      AXIOM_DATASET: process.env.AXIOM_DATASET,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_IMAGES_TOKEN: process.env.CLOUDFLARE_IMAGES_TOKEN,
      CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      CLOUDFLARE_R2_BUCKET: process.env.CLOUDFLARE_R2_BUCKET,
      CLOUDFLARE_R2_ENDPOINT: process.env.CLOUDFLARE_R2_ENDPOINT,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_CLOUDFLARE_IMAGES_URL: process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_URL,
    },
  });
}

/**
 * Warn if BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL hosts differ in production.
 * A mismatch causes session cookies to be set for the wrong domain → P0 auth outage.
 * Per REMEDIATION_PLAN_v12 Task 4 + skill §5.6.0 lines 925-937.
 *
 * CRITICAL: This must only run on the server side. The `env` object from
 * createEnv() uses a proxy that THROWS when server-side env vars are accessed
 * on the client (isServer=false). Calling this at module load time without
 * the typeof window guard breaks client-side hydration → "This page couldn't
 * load" error on the live site (v13 hotfix).
 */
function warnOnAuthUrlMismatch(authUrl: string | undefined, appUrl: string | undefined): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (!authUrl || !appUrl) return;
  try {
    const authHost = new URL(authUrl).host;
    const appHost = new URL(appUrl).host;
    if (authHost !== appHost) {
      console.warn(
        `[env] BETTER_AUTH_URL host (${authHost}) does not match NEXT_PUBLIC_APP_URL host (${appHost}). ` +
          'This will cause session cookies to be set for the wrong domain → P0 auth outage.',
      );
    }
  } catch {
    // URLs already validated by zod; defensive only
  }
}

export const env = loadEnv();

// Only run the auth URL mismatch warning on the server side.
// On the client, `env.BETTER_AUTH_URL` access throws via the createEnv proxy.
if (
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as Record<string, unknown>).window === 'undefined'
) {
  warnOnAuthUrlMismatch(env.BETTER_AUTH_URL, env.NEXT_PUBLIC_APP_URL);
}
