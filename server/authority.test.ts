import { describe, expect, it } from "vitest";
import { buildCapability, buildRecordHash, buildScenarioDecision, scenarioLabels, sha256, stableStringify, verifyCapability } from "./authority";

describe("Sentra authority engine", () => {
  it("uses a stable canonical representation regardless of input key order", () => {
    expect(stableStringify({ b: 2, a: 1 })).toBe(stableStringify({ a: 1, b: 2 }));
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

  it("changes the proof hash when any linked evidence changes", () => {
    const first = buildRecordHash({ previousHash: "GENESIS", eventId: "evt-1", scenario: "Valid Action", outcome: "ALLOW", requestHash: sha256("request"), capabilityHash: sha256("capability"), gatewayResult: "VERIFIED", executionResult: "EXECUTED" });
    const tampered = buildRecordHash({ previousHash: "GENESIS", eventId: "evt-1", scenario: "Valid Action", outcome: "ALLOW", requestHash: sha256("request"), capabilityHash: sha256("capability"), gatewayResult: "VERIFIED", executionResult: "ALTERED" });
    expect(first).toHaveLength(64);
    expect(tampered).toHaveLength(64);
    expect(tampered).not.toBe(first);
  });
});
