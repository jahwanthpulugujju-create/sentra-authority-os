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

export const authorityEvents = mysqlTable("authority_events", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 64 }).notNull().unique(),
  scenario: varchar("scenario", { length: 64 }).notNull(),
  outcome: mysqlEnum("outcome", ["ALLOW", "DENY", "ESCALATE", "FREEZE"]).notNull(),
  requestId: varchar("requestId", { length: 64 }).notNull(),
  resourceId: int("resourceId").notNull(),
  canonicalRequest: text("canonicalRequest").notNull(),
  requestHash: varchar("requestHash", { length: 64 }).notNull(),
  capability: text("capability"),
  capabilityHash: varchar("capabilityHash", { length: 64 }),
  gatewayResult: varchar("gatewayResult", { length: 160 }).notNull(),
  executionResult: varchar("executionResult", { length: 160 }).notNull(),
  executionChanged: int("executionChanged").notNull().default(0),
  previousHash: varchar("previousHash", { length: 64 }).notNull(),
  recordHash: varchar("recordHash", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ProtectedResource = typeof protectedResources.$inferSelect;
export type AuthorityEvent = typeof authorityEvents.$inferSelect;
