/**
 * Maison — Trade program applications
 *
 * Interior designers and trade professionals apply for the trade program
 * (10–20% discount). Admin reviews and approves/rejects.
 * Approved applicants get a trade discount applied automatically at checkout.
 */

import { pgTable, uuid, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const tradeApplications = pgTable('trade_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  company: text('company').notNull(),
  role: text('role').notNull(), // "Interior Designer", "Architect", "Stylist", etc.
  website: text('website'),
  instagram: text('instagram'),
  projectTypes: text('project_types'), // "Residential", "Commercial", "Hospitality"
  discountPercent: integer('discount_percent').default(10), // 10, 15, or 20
  status: text('status').default('pending').notNull(), // pending, approved, rejected
  reviewedBy: text('reviewed_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  notes: text('notes'), // admin notes
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type TradeApplication = typeof tradeApplications.$inferSelect;
export type NewTradeApplication = typeof tradeApplications.$inferInsert;
