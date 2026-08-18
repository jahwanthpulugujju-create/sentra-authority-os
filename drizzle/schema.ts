import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const protectedResources = mysqlTable("protected_resources", {
  id: int("id").autoincrement().primaryKey(),
  resourceKey: varchar("resourceKey", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  toolType: varchar("toolType", { length: 80 }).notNull(),
  workspace: varchar("workspace", { length: 120 }).notNull(),
  available: int("available").notNull().default(1),
  executionState: int("executionState").notNull().default(0),
  contextScore: int("contextScore").notNull().default(72),
  lastCheckedAt: timestamp("lastCheckedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const capabilities = mysqlTable("capabilities", {
  id: int("id").autoincrement().primaryKey(),
  capabilityId: varchar("capabilityId", { length: 96 }).notNull().unique(),
  resourceId: int("resourceId").notNull(),
  requestHash: varchar("requestHash", { length: 64 }).notNull(),
  payload: text("payload").notNull(),
  signature: varchar("signature", { length: 64 }).notNull(),
  keyId: varchar("keyId", { length: 96 }).notNull().default("sentra-hmac-k2026-08"),
  keyVersion: varchar("keyVersion", { length: 32 }).notNull().default("2026.08"),
  keyStatus: varchar("keyStatus", { length: 16 }).notNull().default("ACTIVE"),
  keyRotationDueAt: timestamp("keyRotationDueAt"),
  status: mysqlEnum("status", ["ISSUED", "CONSUMED", "EXPIRED", "REJECTED"]).notNull().default("ISSUED"),
  issuedAt: timestamp("issuedAt").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const escalationReviews = mysqlTable("escalation_reviews", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: varchar("reviewId", { length: 96 }).notNull().unique(),
  eventId: varchar("eventId", { length: 64 }).notNull().unique(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull(),
  reviewerCodeHash: varchar("reviewerCodeHash", { length: 64 }).notNull().default("LEGACY_REVIEW_CODE_UNAVAILABLE"),
  status: mysqlEnum("status", ["PENDING", "APPROVED", "DENIED"]).notNull().default("PENDING"),
  expiresAt: timestamp("expiresAt").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const authorityEvents = mysqlTable("authority_events", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 64 }).notNull().unique(),
  scenario: varchar("scenario", { length: 64 }).notNull(),
  outcome: mysqlEnum("outcome", ["ALLOW", "DENY", "ESCALATE", "FREEZE"]).notNull(),
  requestId: varchar("requestId", { length: 64 }).notNull(),
  resourceId: int("resourceId").notNull(),
  canonicalRequest: text("canonicalRequest").notNull(),
  requestHash: varchar("requestHash", { length: 64 }).notNull(),
  policyVersion: varchar("policyVersion", { length: 64 }).notNull().default("sentra-policy-v1"),
  reasonCode: varchar("reasonCode", { length: 64 }).notNull().default("UNSPECIFIED"),
  capability: text("capability"),
  capabilityHash: varchar("capabilityHash", { length: 64 }),
  approval: text("approval"),
  approvalHash: varchar("approvalHash", { length: 64 }),
  gatewayResult: varchar("gatewayResult", { length: 160 }).notNull(),
  executionResult: varchar("executionResult", { length: 160 }).notNull(),
  executionChanged: int("executionChanged").notNull().default(0),
  decisionLatencyMs: int("decisionLatencyMs").notNull().default(0),
  previousHash: varchar("previousHash", { length: 64 }).notNull(),
  recordHash: varchar("recordHash", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const authorityOutbox = mysqlTable("authority_outbox", {
  id: int("id").autoincrement().primaryKey(),
  outboxId: varchar("outboxId", { length: 64 }).notNull().unique(),
  sourceEventId: varchar("sourceEventId", { length: 64 }).notNull().unique(),
  eventType: varchar("eventType", { length: 80 }).notNull(),
  schemaVersion: varchar("schemaVersion", { length: 16 }).notNull().default("1.0"),
  tenantId: varchar("tenantId", { length: 96 }).notNull(),
  correlationId: varchar("correlationId", { length: 96 }).notNull(),
  causationId: varchar("causationId", { length: 96 }),
  payload: text("payload").notNull(),
  payloadHash: varchar("payloadHash", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["PENDING", "PUBLISHED", "FAILED"]).notNull().default("PENDING"),
  attempts: int("attempts").notNull().default(0),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ProtectedResource = typeof protectedResources.$inferSelect;
export type Capability = typeof capabilities.$inferSelect;
export type EscalationReview = typeof escalationReviews.$inferSelect;
export type AuthorityEvent = typeof authorityEvents.$inferSelect;
export type AuthorityOutbox = typeof authorityOutbox.$inferSelect;
