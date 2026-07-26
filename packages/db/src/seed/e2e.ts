/**
 * Maison — E2E test seed
 *
 * Seeds a minimal dataset for Playwright E2E tests.
 * Run via: pnpm db:seed:e2e
 *
 * This seed is DESTRUCTIVE — it clears the e2e test schema first.
 * Never run against a production database.
 */

import { db } from "../index";

async function seedE2E() {
  console.log("── Maison E2E seed (stub) ───────────────────────────────");
  console.log("  → E2E seed to be implemented in Phase 1");
  console.log("  → Will create: 1 test customer, 1 admin user, 3 products, 1 placed order");
  process.exit(0);
}

seedE2E().catch((err) => {
  console.error("E2E seed failed:", err);
  process.exit(1);
});
