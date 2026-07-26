/**
 * Maison — Verifications table (Better Auth managed)
 *
 * Stores email verification tokens and magic link tokens.
 */

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(), // email address
  value: text("value").notNull(), // hashed token
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Verification = typeof verifications.$inferSelect;
