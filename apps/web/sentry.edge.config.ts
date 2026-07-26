/**
 * Maison — Sentry edge config (stub — Phase 1)
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
