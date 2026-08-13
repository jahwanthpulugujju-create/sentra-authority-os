import { desc, eq, sql } from "drizzle-orm";
import { authorityEvents, protectedResources, type ProtectedResource } from "../drizzle/schema";
import { getDb } from "./db";

export async function getRequiredDb() {
  const db = await getDb();
  if (!db) throw new Error("Sentra database is unavailable. The proof chain cannot be generated without persistent storage.");
  return db;
}

export async function ensureProtectedResource(): Promise<ProtectedResource> {
  const db = await getRequiredDb();
  const existing = await db.select().from(protectedResources).where(eq(protectedResources.resourceKey, "vendor-intake-contoso")).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(protectedResources).values({
    resourceKey: "vendor-intake-contoso",
    name: "Contoso vendor approval",
    toolType: "protected workspace tool",
    workspace: "Procurement Operations",
    available: 1,
    executionState: 0,
    contextScore: 72,
    lastCheckedAt: new Date(),
  });
  const created = await db.select().from(protectedResources).where(eq(protectedResources.resourceKey, "vendor-intake-contoso")).limit(1);
  if (!created[0]) throw new Error("Unable to create the protected demo resource.");
  return created[0];
}

export async function refreshResourceContext() {
  const db = await getRequiredDb();
  const resource = await ensureProtectedResource();
  const nextScore = Math.max(64, Math.min(88, resource.contextScore + (resource.executionState ? -2 : 2)));
  await db.update(protectedResources).set({ contextScore: nextScore, lastCheckedAt: new Date() }).where(eq(protectedResources.id, resource.id));
  return (await db.select().from(protectedResources).where(eq(protectedResources.id, resource.id)).limit(1))[0];
}

export async function getLatestEvent() {
  const db = await getRequiredDb();
  const latest = await db.select().from(authorityEvents).orderBy(desc(authorityEvents.id)).limit(1);
  return latest[0];
}

export async function listAuthorityEvents(limit = 12) {
  const db = await getRequiredDb();
  return db.select().from(authorityEvents).orderBy(desc(authorityEvents.id)).limit(limit);
}

export async function getDemoMetrics() {
  const db = await getRequiredDb();
  const [eventMetric] = await db.select({ count: sql<number>`count(*)` }).from(authorityEvents);
  const [blockedMetric] = await db.select({ count: sql<number>`count(*)` }).from(authorityEvents).where(sql`${authorityEvents.outcome} <> 'ALLOW'`);
  const [resourceMetric] = await db.select({ count: sql<number>`count(*)` }).from(protectedResources).where(eq(protectedResources.available, 1));
  return { totalEvents: Number(eventMetric?.count || 0), blockedEvents: Number(blockedMetric?.count || 0), protectedResources: Number(resourceMetric?.count || 0) };
}
