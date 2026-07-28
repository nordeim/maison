/**
 * Maison — DB reset script (DEV ONLY)
 *
 * Drops all tables in the public schema and re-creates them via Drizzle push.
 * NEVER run against production.
 *
 * Usage: pnpm db:reset
 */

import { db } from '../index';
import { sql } from 'drizzle-orm';

async function reset() {
  const isProduction = process.env['NODE_ENV'] === 'production';
  if (isProduction) {
    console.error('✗ Refusing to reset database in production.');
    process.exit(1);
  }

  console.log('⚠️  Resetting database — ALL DATA WILL BE LOST ⚠️');
  console.log('  Dropping all tables in public schema…');

  await db.execute(sql`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO postgres;
    GRANT ALL ON SCHEMA public TO public;
  `);

  console.log('✓ Schema dropped. Run `pnpm db:push` then `pnpm db:seed` to rebuild.');
  process.exit(0);
}

reset().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
