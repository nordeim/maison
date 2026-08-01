/**
 * Maison — Users table
 *
 * Managed by Better Auth (drizzle adapter). We add the `role` column for RBAC.
 * Better Auth expects this table to exist; it writes to it on registration.
 */

import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

import { userRoleEnum } from './enums';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  name: text('name'),
  image: text('image'),
  role: userRoleEnum('role').default('customer').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
