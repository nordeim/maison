/**
 * Maison — Environment loader for seed scripts
 *
 * Loads .env.local (monorepo root) before running seed scripts.
 * The drizzle.config.ts already does this, but seed scripts run via tsx
 * which doesn't load dotenv automatically.
 */

import { config } from 'dotenv';

config({ path: '../../.env.local' });
config({ path: '../../.env' });
