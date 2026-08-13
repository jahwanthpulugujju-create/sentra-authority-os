import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { authorityEvents, protectedResources } from "../drizzle/schema";
import { buildCapability, buildRecordHash, buildScenarioDecision, scenarioLabels, sha256, stableStringify } from "./authority";
import { ensureProtectedResource, getDemoMetrics, getLatestEvent, getRequiredDb, listAuthorityEvents, refreshResourceContext } from "./sentraDb";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

function serializeEvent(event: typeof authorityEvents.$inferSelect) {
  return { ...event, canonicalRequest: JSON.parse(event.canonicalRequest), capability: event.capability ? JSON.parse(event.capability) : null };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  authority: router({
    dashboard: publicProcedure.query(async () => {
      const resource = await ensureProtectedResource();
      const [events, metrics] = await Promise.all([listAuthorityEvents(), getDemoMetrics()]);
      return { resource, metrics, events: events.map(serializeEvent) };
    }),
    refreshContext: publicProcedure.mutation(async () => ({ resource: await refreshResourceContext() })),
    runScenario: publicProcedure.input(z.object({ scenario: z.enum(scenarioLabels) })).mutation(async ({ input }) => {
      const db = await getRequiredDb();
      const resource = await ensureProtectedResource();
      const previous = await getLatestEvent();
      const eventId = `evt_${nanoid(12)}`;
      const requestId = `req_${nanoid(12)}`;
      const replayNonce = previous?.outcome === "ALLOW" ? JSON.parse(previous.canonicalRequest).nonce : undefined;
      const decision = buildScenarioDecision(input.scenario, resource.contextScore, requestId, replayNonce);
      const canonicalRequest = stableStringify(decision.request);
      const requestHash = sha256(canonicalRequest);
      const capability = decision.outcome === "ALLOW" ? buildCapability(decision.request, requestHash) : decision.capabilityPayload ? { ...decision.capabilityPayload, signature: "ORIGINAL_CAPABILITY_REFERENCE" } : null;
      const capabilityJson = capability ? stableStringify(capability) : null;
      const capabilityHash = capabilityJson ? sha256(capabilityJson) : null;
      const previousHash = previous?.recordHash || "GENESIS";
      const recordHash = buildRecordHash({ previousHash, eventId, scenario: input.scenario, outcome: decision.outcome, requestHash, capabilityHash, gatewayResult: decision.gatewayResult, executionResult: decision.executionResult });

      await db.insert(authorityEvents).values({
        eventId, scenario: input.scenario, outcome: decision.outcome, requestId, resourceId: resource.id, canonicalRequest, requestHash, capability: capabilityJson, capabilityHash, gatewayResult: decision.gatewayResult, executionResult: decision.executionResult, executionChanged: decision.executionMayChange ? 1 : 0, previousHash, recordHash,
      });
      if (decision.outcome === "ALLOW" && decision.executionMayChange) {
        await db.update(protectedResources).set({ executionState: decision.request.desiredState === "APPROVED" ? 1 : 0, lastCheckedAt: new Date() }).where(eq(protectedResources.id, resource.id));
      }
      const [storedEvent] = await db.select().from(authorityEvents).where(eq(authorityEvents.eventId, eventId)).limit(1);
      const [updatedResource] = await db.select().from(protectedResources).where(eq(protectedResources.id, resource.id)).limit(1);
      return { event: serializeEvent(storedEvent), resource: updatedResource };
    }),
  }),
});

export type AppRouter = typeof appRouter;
