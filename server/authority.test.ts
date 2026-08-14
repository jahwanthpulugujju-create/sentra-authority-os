import { describe, expect, it } from "vitest";
import { buildCapability, buildEscalationApproval, buildRecordHash, buildScenarioDecision, createReviewerCode, hashReviewerCode, scenarioLabels, sha256, stableStringify, verifyCapability, verifyEscalationApproval } from "./authority";
import { authorizeProtectedVendorApproval, executeProtectedVendorApproval } from "./protectedTool";

describe("Sentra authority engine", () => {
  it("uses a stable canonical representation regardless of input key order", () => {
    expect(stableStringify({ b: 2, a: 1 })).toBe(stableStringify({ a: 1, b: 2 }));
  });

  it("hashes a reviewer-held code separately from the public phone-review token", () => {
    const code = createReviewerCode();
    expect(code).toMatch(/^[A-F0-9]{8}$/);
    expect(hashReviewerCode(code)).toHaveLength(64);
    expect(hashReviewerCode(code)).not.toBe(hashReviewerCode("00000000"));
  });

  it("changes protected execution state only for the valid action", () => {
    for (const scenario of scenarioLabels) expect(buildScenarioDecision(scenario, 72, `request-${scenario}`).executionMayChange).toBe(scenario === "Valid Action");
  });

  it("returns the required authority outcomes for every adverse scenario", () => {
    expect(buildScenarioDecision("Unauthorized Tool", 72, "deny").outcome).toBe("DENY");
    expect(buildScenarioDecision("Prompt Injection", 72, "escalate").outcome).toBe("ESCALATE");
    expect(buildScenarioDecision("Burst Anomaly", 72, "freeze").outcome).toBe("FREEZE");
    expect(buildScenarioDecision("Replay Attempt", 72, "replay").outcome).toBe("DENY");
    expect(buildScenarioDecision("Changed Request", 72, "changed").outcome).toBe("DENY");
  });

  it("binds a capability to the exact canonical request and verifies it", () => {
    const decision = buildScenarioDecision("Valid Action", 72, "capability-check");
    const requestHash = sha256(stableStringify(decision.request));
    const capability = buildCapability(decision.request, requestHash, new Date("2026-08-13T00:00:00.000Z"));
    expect(verifyCapability(capability, decision.request, requestHash, Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: true, reason: "VERIFIED" });
  });

  it("binds the envelope to the demo tenant, workflow step, step budget, and idempotency key", () => {
    const decision = buildScenarioDecision("Valid Action", 72, "envelope", "stable-operation-key");
    const requestHash = sha256(stableStringify(decision.request));
    const capability = buildCapability(decision.request, requestHash, new Date("2026-08-13T00:00:00.000Z"));
    expect(decision.request).toMatchObject({ tenantId: "demo-procurement-tenant", workflowId: "vendor-onboarding-contoso", workflowStep: "vendor_approval", stepBudget: 1, idempotencyKey: "stable-operation-key", amountOrLimit: 12_000, currency: "USD" });
    expect(verifyCapability(capability, { ...decision.request, workflowId: "another-workflow" }, requestHash, Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: false, reason: "WORKFLOW_SCOPE_MISMATCH" });
    expect(verifyCapability(capability, { ...decision.request, idempotencyKey: "different-key" }, requestHash, Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: false, reason: "IDEMPOTENCY_KEY_MISMATCH" });
  });

  it("allows the protected adapter only through its gateway-issued permit", () => {
    const decision = buildScenarioDecision("Valid Action", 72, "protected-tool");
    const requestHash = sha256(stableStringify(decision.request));
    const capability = buildCapability(decision.request, requestHash, new Date("2026-08-13T00:00:00.000Z"));
    expect(() => executeProtectedVendorApproval(undefined)).toThrow("DIRECT_TOOL_BYPASS_REJECTED");
    const authorization = authorizeProtectedVendorApproval({ capability, request: decision.request, requestHash, now: Date.parse("2026-08-13T00:01:00.000Z") });
    expect(authorization.allowed).toBe(true);
    if (authorization.allowed) expect(executeProtectedVendorApproval(authorization.permit)).toMatchObject({ executionChanged: 1, executionState: 1 });
  });

  it("rejects a changed request even when it carries a valid capability", () => {
    const decision = buildScenarioDecision("Changed Request", 72, "changed-request");
    const approved = decision.approvalRequest!;
    const capability = buildCapability(approved, sha256(stableStringify(approved)), new Date("2026-08-13T00:00:00.000Z"));
    expect(verifyCapability(capability, decision.request, sha256(stableStringify(decision.request)), Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: false, reason: "REQUEST_HASH_MISMATCH" });
  });

  it("rejects an altered signature and an expired capability", () => {
    const decision = buildScenarioDecision("Valid Action", 72, "invalid-capability");
    const requestHash = sha256(stableStringify(decision.request));
    const capability = buildCapability(decision.request, requestHash, new Date("2026-08-13T00:00:00.000Z"));
    expect(verifyCapability({ ...capability, signature: `${capability.signature.slice(0, -1)}0` }, decision.request, requestHash, Date.parse("2026-08-13T00:01:00.000Z")).valid).toBe(false);
    expect(verifyCapability(capability, decision.request, requestHash, Date.parse("2026-08-13T00:10:00.000Z"))).toEqual({ valid: false, reason: "EXPIRED_CAPABILITY" });
  });

  it("fails closed when a policy is unknown, unavailable, or retired", () => {
    const decision = buildScenarioDecision("Valid Action", 72, "policy-fault");
    const requestHash = sha256(stableStringify(decision.request));
    const capability = buildCapability(decision.request, requestHash, new Date("2026-08-13T00:00:00.000Z"));
    expect(verifyCapability(capability, { ...decision.request, policyVersion: "unknown-policy" }, requestHash, Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: false, reason: "UNKNOWN_POLICY" });
    expect(verifyCapability({ ...capability, policyVersion: "sentra-policy-maintenance" }, { ...decision.request, policyVersion: "sentra-policy-maintenance" }, requestHash, Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: false, reason: "POLICY_UNAVAILABLE" });
    expect(verifyCapability({ ...capability, policyVersion: "sentra-policy-v0" }, { ...decision.request, policyVersion: "sentra-policy-v0" }, requestHash, Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: false, reason: "POLICY_RETIRED" });
  });

  it("rejects a capability identified by a revoked or unknown signing key before a tool can run", () => {
    const decision = buildScenarioDecision("Valid Action", 72, "key-fault");
    const requestHash = sha256(stableStringify(decision.request));
    const capability = buildCapability(decision.request, requestHash, new Date("2026-08-13T00:00:00.000Z"));
    expect(capability).toMatchObject({ keyId: "sentra-hmac-k2026-08", keyVersion: "2026.08" });
    expect(verifyCapability({ ...capability, keyId: "sentra-hmac-revoked-demo" }, decision.request, requestHash, Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: false, reason: "KEY_REVOKED" });
    expect(verifyCapability({ ...capability, keyId: "unknown-key" }, decision.request, requestHash, Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: false, reason: "UNKNOWN_KEY" });
  });

  it("binds a high-risk escalation request to the original request hash and a limited review window", () => {
    const decision = buildScenarioDecision("Prompt Injection", 72, "human-review");
    const requestHash = sha256(stableStringify(decision.request));
    const approval = buildEscalationApproval(decision.request, requestHash, new Date("2026-08-13T00:00:00.000Z"), "review-demo-token-bound");
    expect(approval).toMatchObject({ reviewId: "review-demo-token-bound", state: "PENDING_REVIEW", requiredApproverRole: "procurement-controller", originalRequestHash: requestHash });
    expect(verifyEscalationApproval(approval, requestHash, Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: true, reason: "PENDING_HUMAN_REVIEW" });
    expect(verifyEscalationApproval(approval, sha256(stableStringify({ ...decision.request, action: "export_employee_data" })), Date.parse("2026-08-13T00:01:00.000Z"))).toEqual({ valid: false, reason: "REQUEST_HASH_MISMATCH" });
  });

  it("changes the proof hash when any linked evidence changes", () => {
    const first = buildRecordHash({ previousHash: "GENESIS", eventId: "evt-1", scenario: "Valid Action", outcome: "ALLOW", requestHash: sha256("request"), capabilityHash: sha256("capability"), gatewayResult: "VERIFIED", executionResult: "EXECUTED" });
    const tampered = buildRecordHash({ previousHash: "GENESIS", eventId: "evt-1", scenario: "Valid Action", outcome: "ALLOW", requestHash: sha256("request"), capabilityHash: sha256("capability"), gatewayResult: "VERIFIED", executionResult: "ALTERED" });
    expect(first).toHaveLength(64);
    expect(tampered).toHaveLength(64);
    expect(tampered).not.toBe(first);
  });
});
