/**
 * Maison — Sentry server config (stub — Phase 1)
 *
 * Sentry is optional — if SENTRY_DSN is unset, the app runs without error tracking.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env["SENTRY_DSN"];

if (dsn && !dsn.includes("placeholder")) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env["NODE_ENV"],
    silent: true,
  });
}
