import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { authorityEvents, capabilities, protectedResources } from "../drizzle/schema";
import { buildCapability, buildEscalationApproval, buildRecordHash, buildScenarioDecision, scenarioLabels, sha256, stableStringify, verifyCapability, type SignedCapability } from "./authority";
import { listKeyHistory } from "./keys";
import { ACTIVE_POLICY_VERSION, listPolicyHistory, reasonCodeDescriptions } from "./policy";
import { buildProofExportPackage } from "./proofExport";
import { getNtfyDemoStatus, publishNtfyDemoAlert } from "./ntfy";
import { authorizeProtectedVendorApproval, executeProtectedVendorApproval } from "./protectedTool";
import { ensureProtectedResource, expireStaleCapabilities, getDemoMetrics, getRequiredDb, listAuthorityEvents, refreshResourceContext, verifyProofChain } from "./sentraDb";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

function serializeEvent(event: typeof authorityEvents.$inferSelect) {
  return { ...event, canonicalRequest: JSON.parse(event.canonicalRequest), capability: event.capability ? JSON.parse(event.capability) : null, approval: event.approval ? JSON.parse(event.approval) : null };
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
      await expireStaleCapabilities();
      const [events, metrics, proofIntegrity] = await Promise.all([listAuthorityEvents(), getDemoMetrics(), verifyProofChain()]);
      return { resource, metrics, proofIntegrity, policyHistory: listPolicyHistory(), activePolicyVersion: ACTIVE_POLICY_VERSION, keyHistory: listKeyHistory(), keyVerificationModel: "HMAC-SHA256 shared-secret MAC verification (controlled demo)", reasonCodeDescriptions, events: events.map(serializeEvent) };
    }),
    proofExport: publicProcedure.query(async () => {
      await expireStaleCapabilities();
      const [events, metrics, proofIntegrity] = await Promise.all([listAuthorityEvents(500), getDemoMetrics(), verifyProofChain()]);
      return buildProofExportPackage({ proofIntegrity, metrics, policies: listPolicyHistory(), keys: listKeyHistory(), events: events.reverse().map(serializeEvent) });
    }),
    ntfyStatus: publicProcedure.query(() => getNtfyDemoStatus()),
    notifyNtfy: publicProcedure.mutation(async () => {
      const [latestEvent] = await listAuthorityEvents(1);
      if (!latestEvent) throw new Error("Run a Sentra scenario before sending a demo notification.");
      const delivery = await publishNtfyDemoAlert({ outcome: latestEvent.outcome, reasonCode: latestEvent.reasonCode, eventId: latestEvent.eventId });
      if (!delivery.delivered) throw new Error(`ntfy did not accept the demo notification (HTTP ${delivery.status}).`);
      return delivery;
    }),
    refreshContext: publicProcedure.mutation(async () => ({ resource: await refreshResourceContext() })),
    resetDemo: publicProcedure.mutation(async () => {
      const db = await getRequiredDb();
      const resource = await ensureProtectedResource();
      await db.transaction(async tx => {
        await tx.delete(capabilities);
        await tx.delete(authorityEvents);
        await tx.update(protectedResources).set({ executionState: 0, contextScore: 72, lastCheckedAt: new Date() }).where(eq(protectedResources.id, resource.id));
      });
      const [resetResource] = await db.select().from(protectedResources).where(eq(protectedResources.id, resource.id)).limit(1);
      return { resource: resetResource };
    }),
    runScenario: publicProcedure.input(z.object({ scenario: z.enum(scenarioLabels), idempotencyKey: z.string().min(8).max(48).optional() })).mutation(async ({ input }) => {
      const startedAt = Date.now();
      const db = await getRequiredDb();
      const resource = await ensureProtectedResource();
      const now = new Date();
      const eventId = `evt_${nanoid(12)}`;
      const requestId = input.idempotencyKey ? `req_${input.idempotencyKey}` : `req_${nanoid(12)}`;
      const [existingEvent] = await db.select().from(authorityEvents).where(eq(authorityEvents.requestId, requestId)).limit(1);
      if (existingEvent) {
        return { event: serializeEvent(existingEvent), resource };
      }
      const decision = buildScenarioDecision(input.scenario, resource.contextScore, requestId, input.idempotencyKey || requestId);
      const canonicalRequest = stableStringify(decision.request);
      const requestHash = sha256(canonicalRequest);

      const transactionResult = await db.transaction(async tx => {
        const latestRows = await tx.select().from(authorityEvents).orderBy(desc(authorityEvents.id)).limit(1);
        const previousHash = latestRows[0]?.recordHash || "GENESIS";
        let capability: SignedCapability | null = null;
        let gatewayResult = decision.gatewayResult;
        let executionResult = decision.executionResult;
        let executionChanged = 0;
        let approvalJson: string | null = null;

        if (input.scenario === "Prompt Injection") {
          approvalJson = stableStringify(buildEscalationApproval(decision.request, requestHash, now));
        } else if (input.scenario === "Changed Request" && decision.approvalRequest) {
          const approvedHash = sha256(stableStringify(decision.approvalRequest));
          capability = buildCapability(decision.approvalRequest, approvedHash, now);
          await tx.insert(capabilities).values({ capabilityId: capability.capabilityId, resourceId: resource.id, requestHash: approvedHash, payload: stableStringify(capability), signature: capability.signature, keyId: capability.keyId, keyVersion: capability.keyVersion, keyStatus: "ACTIVE", keyRotationDueAt: new Date(capability.keyRotationDueAt), status: "ISSUED", issuedAt: now, expiresAt: new Date(capability.expiry) });
          const verification = verifyCapability(capability, decision.request, requestHash, now.getTime());
          gatewayResult = `REJECTED: ${verification.reason}`;
          await tx.update(capabilities).set({ status: "REJECTED" }).where(eq(capabilities.capabilityId, capability.capabilityId));
        } else if (input.scenario === "Replay Attempt") {
          capability = buildCapability(decision.request, requestHash, now);
          await tx.insert(capabilities).values({ capabilityId: capability.capabilityId, resourceId: resource.id, requestHash, payload: stableStringify(capability), signature: capability.signature, keyId: capability.keyId, keyVersion: capability.keyVersion, keyStatus: "ACTIVE", keyRotationDueAt: new Date(capability.keyRotationDueAt), status: "CONSUMED", issuedAt: now, expiresAt: new Date(capability.expiry), consumedAt: now });
          gatewayResult = "REJECTED: CAPABILITY_ALREADY_CONSUMED";
        } else if (decision.outcome === "ALLOW") {
          capability = buildCapability(decision.request, requestHash, now);
          await tx.insert(capabilities).values({ capabilityId: capability.capabilityId, resourceId: resource.id, requestHash, payload: stableStringify(capability), signature: capability.signature, keyId: capability.keyId, keyVersion: capability.keyVersion, keyStatus: "ACTIVE", keyRotationDueAt: new Date(capability.keyRotationDueAt), status: "ISSUED", issuedAt: now, expiresAt: new Date(capability.expiry) });
          const gatewayAuthorization = authorizeProtectedVendorApproval({ capability, request: decision.request, requestHash, now: now.getTime() });
          if (!gatewayAuthorization.allowed) {
            gatewayResult = `REJECTED: ${gatewayAuthorization.reason}`;
            executionResult = "NOT EXECUTED: gateway verification failed";
            await tx.update(capabilities).set({ status: "REJECTED" }).where(eq(capabilities.capabilityId, capability.capabilityId));
          } else {
            const protectedExecution = executeProtectedVendorApproval(gatewayAuthorization.permit);
            await tx.update(capabilities).set({ status: "CONSUMED", consumedAt: now }).where(eq(capabilities.capabilityId, capability.capabilityId));
            await tx.update(protectedResources).set({ executionState: protectedExecution.executionState, lastCheckedAt: now }).where(eq(protectedResources.id, resource.id));
            gatewayResult = "VERIFIED: signature, exact request hash, workflow scope, policy version, expiry, nonce, and idempotency key are valid";
            executionResult = protectedExecution.result;
            executionChanged = protectedExecution.executionChanged;
          }
        }

        const capabilityJson = capability ? stableStringify(capability) : null;
        const capabilityHash = capabilityJson ? sha256(capabilityJson) : null;
        const approvalHash = approvalJson ? sha256(approvalJson) : null;
        const decisionLatencyMs = Math.max(0, Date.now() - startedAt);
        const recordHash = buildRecordHash({ previousHash, eventId, scenario: input.scenario, outcome: decision.outcome, requestHash, capabilityHash, approvalHash, gatewayResult, executionResult, reasonCode: decision.reasonCode });
        await tx.insert(authorityEvents).values({ eventId, scenario: input.scenario, outcome: decision.outcome, requestId, resourceId: resource.id, canonicalRequest, requestHash, policyVersion: decision.request.policyVersion, reasonCode: decision.reasonCode, capability: capabilityJson, capabilityHash, approval: approvalJson, approvalHash, gatewayResult, executionResult, executionChanged, decisionLatencyMs, previousHash, recordHash });
        return { eventId };
      });

      const [storedEvent] = await db.select().from(authorityEvents).where(eq(authorityEvents.eventId, transactionResult.eventId)).limit(1);
      const [updatedResource] = await db.select().from(protectedResources).where(eq(protectedResources.id, resource.id)).limit(1);
      return { event: serializeEvent(storedEvent), resource: updatedResource };
    }),
  }),
});

export type AppRouter = typeof appRouter;
