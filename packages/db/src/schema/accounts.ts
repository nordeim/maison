/**
 * Maison — Accounts table (Better Auth managed)
 *
 * Links OAuth providers (Google, Apple) to a user. One user can have multiple accounts.
 */

import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from './users';

export const accounts = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  providerId: text('provider_id').notNull(), // e.g. "google", "apple"
  accountId: text('account_id').notNull(), // provider's user ID
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
