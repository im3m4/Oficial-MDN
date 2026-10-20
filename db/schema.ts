import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const contentItems = sqliteTable("content_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  body: text("body").notNull().default(""),
  location: text("location").notNull().default(""),
  startsAt: text("starts_at"),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_content_items_slug").on(table.slug),
  index("idx_content_items_type_status").on(table.type, table.status),
]);

export const contentAudit = sqliteTable("content_audit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contentItemId: integer("content_item_id").notNull(),
  action: text("action").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_content_audit_item").on(table.contentItemId)]);

export const contactSubmissions = sqliteTable("contact_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference"),
  route: text("route").notNull(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  organization: text("organization").notNull().default(""),
  location: text("location").notNull().default(""),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_contact_submissions_status_created").on(table.status, table.createdAt),
  uniqueIndex("idx_contact_submissions_reference").on(table.reference),
]);

export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSuccessAt: text("last_success_at"),
  lastFailureAt: text("last_failure_at"),
}, (table) => [
  uniqueIndex("idx_push_subscriptions_endpoint").on(table.endpoint),
  index("idx_push_subscriptions_enabled").on(table.enabled),
]);

export const analyticsEvents = sqliteTable("analytics_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  path: text("path").notNull(),
  sessionId: text("session_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_analytics_events_created_path").on(table.createdAt, table.path)]);

// Anonymous daily counts of privacy choices. No browser or person identifier is stored.
export const consentChoiceCounts = sqliteTable("consent_choice_counts", {
  day: text("day").notNull(),
  choice: text("choice").notNull(),
  count: integer("count").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.day, table.choice] })]);

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  ipHash: text("ip_hash").primaryKey(),
  failedCount: integer("failed_count").notNull().default(0),
  lockedUntil: text("locked_until"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const abuseCounters = sqliteTable("abuse_counters", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: integer("window_start").notNull(),
});
