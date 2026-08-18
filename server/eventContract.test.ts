import { describe, expect, it } from "vitest";
import { buildAuthorityOutboxEvent } from "./eventContract";

describe("authority outbox contract", () => {
  it("emits a redacted, hash-addressable decision event", () => {
    const event = buildAuthorityOutboxEvent({
      eventType: "authority.decision.created",
      tenantId: "tenant_acme",
      correlationId: "req_1",
      sourceEventId: "evt_1",
      outcome: "ESCALATE",
      reasonCode: "UNTRUSTED_INSTRUCTION",
      requestHash: "request-hash",
      approvalHash: "approval-hash",
      now: new Date("2026-08-18T00:00:00.000Z"),
    });

    expect(event.schemaVersion).toBe("1.0");
    expect(event.payload).toEqual({
      sourceEventId: "evt_1",
      outcome: "ESCALATE",
      reasonCode: "UNTRUSTED_INSTRUCTION",
      requestHash: "request-hash",
      capabilityHash: null,
      approvalHash: "approval-hash",
      executionChanged: false,
    });
    expect(event.payloadHash).toHaveLength(64);
  });
});
