import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { authorityEvents, authorityOutbox, capabilities, escalationReviews, protectedResources } from "../drizzle/schema";
import { buildCapability, buildEscalationApproval, buildRecordHash, buildScenarioDecision, createReviewerCode, hashReviewerCode, scenarioLabels, sha256, stableStringify, verifyCapability, type EscalationApproval, type SignedCapability } from "./authority";
import { listKeyHistory } from "./keys";
import { ACTIVE_POLICY_VERSION, listPolicyHistory, reasonCodeDescriptions } from "./policy";
import { buildProofExportPackage } from "./proofExport";
import { getNtfyDemoStatus, publishNtfyDemoAlert, shouldNotifyPhoneForOutcome } from "./ntfy";
import { validateMobileReviewResolution } from "./mobileReview";
import { buildAuthorityOutboxEvent } from "./eventContract";
import { authorizeProtectedVendorApproval, executeProtectedVendorApproval } from "./protectedTool";
import { ensureProtectedResource, expireStaleCapabilities, getDemoMetrics, getRequiredDb, listAuthorityEvents, refreshResourceContext, verifyProofChain } from "./sentraDb";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

function serializeEvent(event: typeof authorityEvents.$inferSelect) {
  return { ...event, canonicalRequest: JSON.parse(event.canonicalRequest), capability: event.capability ? JSON.parse(event.capability) : null, approval: event.approval ? JSON.parse(event.approval) : null };
}

function getPublicOrigin(req: { protocol?: string; get(name: string): string | undefined }) {
  const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
  const host = req.get("x-forwarded-host") || req.get("host");
  if (!host) throw new Error("A public review link could not be created for this request.");
  return `${protocol}://${host}`;
}

function parseEscalationApproval(event: typeof authorityEvents.$inferSelect): EscalationApproval {
  if (!event.approval) throw new Error("This authority event has no review artifact.");
  return JSON.parse(event.approval) as EscalationApproval;
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
    mobileReview: publicProcedure.input(z.object({ eventId: z.string().min(1), token: z.string().min(16) })).query(async ({ input }) => {
      const db = await getRequiredDb();
      const [review] = await db.select().from(escalationReviews).where(eq(escalationReviews.eventId, input.eventId)).limit(1);
      const [event] = await db.select().from(authorityEvents).where(eq(authorityEvents.eventId, input.eventId)).limit(1);
      if (!review || !event || review.tokenHash !== sha256(input.token)) throw new Error("This mobile review link is invalid.");
      const approval = parseEscalationApproval(event);
      return {
        reviewId: review.reviewId,
        status: review.status,
        expiresAt: review.expiresAt,
        resolvedAt: review.resolvedAt,
        scenario: event.scenario,
        reasonCode: event.reasonCode,
        originalAction: "The original untrusted request remains blocked. A phone decision resolves the review only.",
        canResolve: review.status === "PENDING" && review.expiresAt.getTime() > Date.now(),
        approverRole: approval.requiredApproverRole,
      };
    }),
    resolveMobileReview: publicProcedure.input(z.object({ eventId: z.string().min(1), token: z.string().min(16), reviewerCode: z.string().min(8).max(16), decision: z.enum(["APPROVED", "DENIED"]) })).mutation(async ({ input }) => {
      const db = await getRequiredDb();
      const now = new Date();
      return db.transaction(async tx => {
        const [review] = await tx.select().from(escalationReviews).where(eq(escalationReviews.eventId, input.eventId)).limit(1);
        const [event] = await tx.select().from(authorityEvents).where(eq(authorityEvents.eventId, input.eventId)).limit(1);
        if (!review || !event) throw new Error("This mobile review link is invalid.");
        const gate = validateMobileReviewResolution(review, input.token, input.reviewerCode, now.getTime());
        if (!gate.valid && gate.reason === "INVALID_LINK") throw new Error("This mobile review link is invalid.");
        if (!gate.valid && gate.reason === "REVIEWER_CODE_REJECTED") throw new Error("The reviewer code is incorrect. Enter the code shown in the Sentra dashboard, not the ntfy notification.");
        if (!gate.valid && gate.reason === "REVIEW_ALREADY_RESOLVED") throw new Error(`This review was already resolved as ${review.status}.`);
        if (!gate.valid && gate.reason === "REVIEW_EXPIRED") throw new Error("This mobile review link has expired.");
        const approval = parseEscalationApproval(event);
        const [latestRecord] = await tx.select().from(authorityEvents).orderBy(desc(authorityEvents.id)).limit(1);
        const reviewEventId = `rev_${nanoid(12)}`;
        const resolutionRequest = stableStringify({ type: "MOBILE_ESCALATION_REVIEW", reviewId: review.reviewId, originalEventId: event.eventId, originalRequestHash: event.requestHash, decision: input.decision, resolvedAt: now.toISOString() });
        const reasonCode = input.decision === "APPROVED" ? "MOBILE_REVIEW_APPROVED" : "MOBILE_REVIEW_DENIED";
        const gatewayResult = input.decision === "APPROVED" ? "REVIEW CLOSED: phone approval recorded; the original untrusted action remains blocked" : "REVIEW CLOSED: phone denial recorded; the original untrusted action remains blocked";
        const executionResult = "NOT EXECUTED: any future action requires a fresh trusted request and new authority decision";
        const approvalHash = event.approvalHash || sha256(stableStringify(approval));
        const recordHash = buildRecordHash({ previousHash: latestRecord?.recordHash || "GENESIS", eventId: reviewEventId, scenario: "Mobile Review", outcome: "ESCALATE", requestHash: sha256(resolutionRequest), capabilityHash: null, approvalHash, gatewayResult, executionResult, reasonCode });
        await tx.update(escalationReviews).set({ status: input.decision, resolvedAt: now }).where(eq(escalationReviews.id, review.id));
        await tx.insert(authorityEvents).values({ eventId: reviewEventId, scenario: "Mobile Review", outcome: "ESCALATE", requestId: `review-${review.reviewId}`, resourceId: event.resourceId, canonicalRequest: resolutionRequest, requestHash: sha256(resolutionRequest), policyVersion: event.policyVersion, reasonCode, capability: null, capabilityHash: null, approval: event.approval, approvalHash, gatewayResult, executionResult, executionChanged: 0, decisionLatencyMs: 0, previousHash: latestRecord?.recordHash || "GENESIS", recordHash });
        const outboxEvent = buildAuthorityOutboxEvent({ eventType: "review.lifecycle.resolved", tenantId: "demo-procurement-tenant", correlationId: event.requestId, causationId: event.eventId, sourceEventId: reviewEventId, outcome: "ESCALATE", reasonCode, requestHash: sha256(resolutionRequest), approvalHash, now });
        await tx.insert(authorityOutbox).values({ outboxId: outboxEvent.outboxId, sourceEventId: reviewEventId, eventType: outboxEvent.eventType, schemaVersion: outboxEvent.schemaVersion, tenantId: outboxEvent.tenantId, correlationId: outboxEvent.correlationId, causationId: outboxEvent.causationId, payload: stableStringify(outboxEvent.payload), payloadHash: outboxEvent.payloadHash, status: "PENDING" });
        return { reviewId: review.reviewId, status: input.decision, message: input.decision === "APPROVED" ? "Review approved. The original untrusted action remains blocked and must be resubmitted as a new trusted request." : "Review denied. The original untrusted action remains blocked." };
      });
    }),
    refreshContext: publicProcedure.mutation(async () => ({ resource: await refreshResourceContext() })),
    resetDemo: publicProcedure.mutation(async () => {
      const db = await getRequiredDb();
      const resource = await ensureProtectedResource();
      await db.transaction(async tx => {
        await tx.delete(escalationReviews);
        await tx.delete(capabilities);
        await tx.delete(authorityOutbox);
        await tx.delete(authorityEvents);
        await tx.update(protectedResources).set({ executionState: 0, contextScore: 72, lastCheckedAt: new Date() }).where(eq(protectedResources.id, resource.id));
      });
      const [resetResource] = await db.select().from(protectedResources).where(eq(protectedResources.id, resource.id)).limit(1);
      return { resource: resetResource };
    }),
    runScenario: publicProcedure.input(z.object({ scenario: z.enum(scenarioLabels), idempotencyKey: z.string().min(8).max(48).optional() })).mutation(async ({ input, ctx }) => {
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
      const mobileReviewToken = input.scenario === "Prompt Injection" ? nanoid(32) : null;
      const mobileReviewId = mobileReviewToken ? `review-${nanoid(12)}` : null;
      const reviewerCode = mobileReviewToken ? createReviewerCode() : null;

      const transactionResult = await db.transaction(async tx => {
        const latestRows = await tx.select().from(authorityEvents).orderBy(desc(authorityEvents.id)).limit(1);
        const previousHash = latestRows[0]?.recordHash || "GENESIS";
        let capability: SignedCapability | null = null;
        let gatewayResult = decision.gatewayResult;
        let executionResult = decision.executionResult;
        let executionChanged = 0;
        let approvalJson: string | null = null;

        if (input.scenario === "Prompt Injection") {
          const approval = buildEscalationApproval(decision.request, requestHash, now, mobileReviewId!);
          approvalJson = stableStringify(approval);
          await tx.insert(escalationReviews).values({ reviewId: mobileReviewId!, eventId, tokenHash: sha256(mobileReviewToken!), reviewerCodeHash: hashReviewerCode(reviewerCode!), status: "PENDING", expiresAt: new Date(approval.expiresAt) });
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
        const outboxEvent = buildAuthorityOutboxEvent({ eventType: "authority.decision.created", tenantId: decision.request.tenantId, correlationId: requestId, sourceEventId: eventId, outcome: decision.outcome, reasonCode: decision.reasonCode, requestHash, capabilityHash, approvalHash, executionChanged: Boolean(executionChanged), now });
        await tx.insert(authorityOutbox).values({ outboxId: outboxEvent.outboxId, sourceEventId: eventId, eventType: outboxEvent.eventType, schemaVersion: outboxEvent.schemaVersion, tenantId: outboxEvent.tenantId, correlationId: outboxEvent.correlationId, causationId: outboxEvent.causationId, payload: stableStringify(outboxEvent.payload), payloadHash: outboxEvent.payloadHash, status: "PENDING" });
        return { eventId };
      });

      const [storedEvent] = await db.select().from(authorityEvents).where(eq(authorityEvents.eventId, transactionResult.eventId)).limit(1);
      const [updatedResource] = await db.select().from(protectedResources).where(eq(protectedResources.id, resource.id)).limit(1);
      const mobileReviewUrl = mobileReviewToken ? `${getPublicOrigin(ctx.req)}/review?eventId=${encodeURIComponent(eventId)}&token=${encodeURIComponent(mobileReviewToken)}` : undefined;
      const phoneAlert = shouldNotifyPhoneForOutcome(storedEvent.outcome)
        ? await publishNtfyDemoAlert({ outcome: storedEvent.outcome, reviewUrl: mobileReviewUrl }).catch(() => ({ delivered: false, status: 0, topic: getNtfyDemoStatus().topic, skipped: false }))
        : null;
      return { event: serializeEvent(storedEvent), resource: updatedResource, phoneAlert, mobileReviewUrl, reviewerCode };
    }),
  }),
});

export type AppRouter = typeof appRouter;
