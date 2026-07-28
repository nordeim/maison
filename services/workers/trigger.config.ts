/**
 * Maison — Trigger.dev configuration
 *
 * Run dev: pnpm jobs:dev (from repo root)
 * Deploy:  pnpm jobs:deploy
 */

import type { TriggerConfig } from '@trigger.dev/sdk/v4';

export const config: TriggerConfig = {
  project: 'maison',
  // The trigger.config.ts is read by `trigger dev` and `trigger deploy`.
  // The TRIGGER_SECRET_KEY env var is used for authentication.
  dirs: ['src'],
  // Fail gracefully if TRIGGER_SECRET_KEY is unset (dev/preview environments)
  logLevel: 'log',
};
