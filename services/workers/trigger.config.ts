/**
 * Maison — Trigger.dev configuration
 *
 * Run dev: pnpm jobs:dev (from repo root)
 * Deploy:  pnpm jobs:deploy
 *
 * Per ADR-016: import from @trigger.dev/sdk ROOT (not /v4 — subpath doesn't exist).
 * v3 is deprecated April 1, 2026; v4 GA August 2025.
 */

import type { TriggerConfig } from '@trigger.dev/sdk';

export const config: TriggerConfig = {
  project: 'maison',
  // The trigger.config.ts is read by `trigger dev` and `trigger deploy`.
  // The TRIGGER_SECRET_KEY env var is used for authentication.
  dirs: ['src'],
  // Fail gracefully if TRIGGER_SECRET_KEY is unset (dev/preview environments)
  logLevel: 'log',
};
