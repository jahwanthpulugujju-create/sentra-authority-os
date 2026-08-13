import { describe, expect, it } from "vitest";
import { buildCapability, buildRecordHash, buildScenarioDecision, scenarioLabels, sha256, stableStringify } from "./authority";

describe("Sentra authority engine", () => {
  it("uses a stable canonical representation regardless of input key order", () => {
    expect(stableStringify({ b: 2, a: 1 })).toBe(stableStringify({ a: 1, b: 2 }));
  });

  it("allows only the valid action to change protected execution state", () => {
    for (const scenario of scenarioLabels) {
      const decision = buildScenarioDecision(scenario, 72, `request-${scenario}`);
      expect(decision.executionMayChange).toBe(scenario === "Valid Action");
    }
  });

  it("returns the required authority outcomes for the adverse scenarios", () => {
    expect(buildScenarioDecision("Unauthorized Tool", 72, "deny").outcome).toBe("DENY");
    expect(buildScenarioDecision("Prompt Injection", 72, "escalate").outcome).toBe("ESCALATE");
    expect(buildScenarioDecision("Burst Anomaly", 72, "freeze").outcome).toBe("FREEZE");
    expect(buildScenarioDecision("Replay Attempt", 72, "replay").outcome).toBe("DENY");
  });

  it("links a record hash to the previous hash and the execution evidence", () => {
    const first = buildRecordHash({ previousHash: "GENESIS", eventId: "evt-1", scenario: "Valid Action", outcome: "ALLOW", requestHash: sha256("request"), capabilityHash: sha256("capability"), gatewayResult: "VERIFIED", executionResult: "EXECUTED" });
    const changed = buildRecordHash({ previousHash: first, eventId: "evt-2", scenario: "Replay Attempt", outcome: "DENY", requestHash: sha256("request"), capabilityHash: null, gatewayResult: "REJECTED", executionResult: "NOT EXECUTED" });
    expect(first).toHaveLength(64);
    expect(changed).toHaveLength(64);
    expect(changed).not.toBe(first);
  });

  it("binds a capability to the exact request hash", () => {
    const decision = buildScenarioDecision("Valid Action", 72, "capability-check");
    const canonicalRequest = stableStringify(decision.request);
    const capability = buildCapability(decision.request, sha256(canonicalRequest));
    expect(capability.requestHash).toBe(sha256(canonicalRequest));
    expect(capability.signature).toHaveLength(64);
  });
});
