/**
 * Maison — Database client
 *
 * Dynamically selects the driver based on DATABASE_URL:
 *  - Neon (production): neon-http serverless driver
 *  - Local Docker: node-postgres (pg Pool)
 *
 * Uses process.env directly (not the Zod env module) to avoid throwing
 * in test/build contexts where DATABASE_URL is a placeholder.
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §3.4:
 * infrastructure clients use process.env directly.
 */

import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon, neonConfig } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

const rawConnectionString = process.env["DATABASE_URL"];

const isBuildContext =
  process.env["NEXT_PHASE"] === "phase-production-build" ||
  process.env["NODE_ENV"] === "test";

const PLACEHOLDER_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder";

const connectionString = rawConnectionString ?? PLACEHOLDER_URL;

if (
  !isBuildContext &&
  (!rawConnectionString || rawConnectionString === PLACEHOLDER_URL)
) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local " +
      "and fill in real values. Run `bash scripts/db-setup.sh` for one-shot setup.",
  );
}

const isNeonUrl = connectionString.includes("neon.tech");

let sql: ReturnType<typeof neon> | Pool;

try {
  if (isNeonUrl) {
    // 10s per-query timeout — prevents cold-start hangs from blocking pages forever
    const QUERY_TIMEOUT_MS = 10_000;
    neonConfig.fetchFunction = (url: string | URL | Request, init?: RequestInit) =>
      fetch(url, {
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(QUERY_TIMEOUT_MS),
      });
    sql = neon(connectionString);
  } else {
    sql = new Pool({
      connectionString,
      query_timeout: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }
} catch {
  sql = (() => {
    throw new Error("Database not configured. Set DATABASE_URL in your environment.");
  }) as unknown as ReturnType<typeof neon>;
}

/**
 * The Drizzle ORM client. Use for all database queries:
 *   import { db, products } from "@maison/db";
 *   const allProducts = await db.select().from(products);
 */
export const db = isNeonUrl
  ? drizzleNeon(sql as ReturnType<typeof neon>, { schema })
  : drizzlePg(sql as Pool, { schema });

export type DrizzleDB = typeof db;
export type Schema = typeof schema;

export { schema };
export * from "./schema";
