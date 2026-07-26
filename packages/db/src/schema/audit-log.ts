/**
 * Maison — Audit log table
 *
 * Records admin actions for PCI DSS compliance and security forensics.
 * Every admin mutation (product.update, order.refund, etc.) writes a row here.
 */

import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: text("actor_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(), // e.g. "product.update", "order.refund"
  entityType: text("entity_type").notNull(), // "product", "order", "customer"
  entityId: text("entity_id"),
  diff: jsonb("diff"), // before/after
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AuditLogEntry = typeof auditLog.$inferSelect;
