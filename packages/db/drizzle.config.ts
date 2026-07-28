/**
 * Maison — Drizzle Kit Configuration
 *
 * Used by:
 *  - drizzle-kit generate  → create migration SQL from schema changes
 *  - drizzle-kit migrate   → apply pending migrations
 *  - drizzle-kit studio    → open Drizzle Studio GUI
 *  - drizzle-kit push      → push schema directly (dev only)
 *
 * IMPORTANT: Always use DATABASE_URL_UNPOOLED for migrations.
 * The pooled URL (PgBouncer) breaks prepared statements in migration scripts.
 * See PROJECT-ARCHITECTURE.md §4.3 (Persistence Strategy).
 */

import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load from .env.local (monorepo root) or .env
config({ path: '../../.env.local' });
config({ path: '../../.env' });

const connectionString = process.env['DATABASE_URL_UNPOOLED'];

if (!connectionString) {
  throw new Error(
    'DATABASE_URL_UNPOOLED is not defined.\n' +
      'For migrations, use the direct (non-pooled) connection string.\n\n' +
      'To fix:\n' +
      '  1. Run: bash scripts/db-setup.sh   (copies .env.example → .env.local if missing)\n' +
      '  2. Or manually copy .env.example to .env.local and fill in DATABASE_URL_UNPOOLED\n' +
      '  3. For local dev: start the database with: docker compose up -d postgres redis\n\n' +
      'See .env.example for reference.',
  );
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
  schemaFilter: ['public'],
});
