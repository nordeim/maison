/**
 * Maison — Trigger.dev configuration
 *
 * Run dev: pnpm jobs:dev (from repo root)
 * Deploy:  pnpm jobs:deploy
 *
 * Per ADR-016: import from @trigger.dev/sdk ROOT (not /v4 — subpath doesn't exist).
 * v3 is deprecated April 1, 2026; v4 GA August 2025.
 *
 * ADR-016 also mandates:
 *   - `machine: "micro"` (string literal, not object form) — cheapest preset
 *   - `maxDuration: 120` (CPU-seconds, not wall-clock) — bounds each run
 */

import type { TriggerConfig } from '@trigger.dev/sdk';

export const config: TriggerConfig = {
  project: 'maison',
  // The trigger.config.ts is read by `trigger dev` and `trigger deploy`.
  // The TRIGGER_SECRET_KEY env var is used for authentication.
  dirs: ['src'],
  // Fail gracefully if TRIGGER_SECRET_KEY is unset (dev/preview environments)
  logLevel: 'log',
  // ADR-016: machine preset (string literal form, not object).
  // "micro" is the smallest/cheapest preset — sufficient for email + cart jobs.
  machine: 'micro',
  // ADR-016: maximum CPU-seconds per task run (not wall-clock).
  // 120s is generous for email sends + DB queries;Trigger.dev hard minimum is 5s.
  maxDuration: 120,
};
