import { describe, expect, it } from "vitest";
import { buildProofExportPackage } from "./proofExport";

describe("Sentra proof export", () => {
  it("preserves local scope, verifier status, and chronological evidence in a portable package", () => {
    const proof = buildProofExportPackage({
      exportedAt: new Date("2026-08-13T00:00:00.000Z"),
      proofIntegrity: { valid: true, checkedEvents: 2, failedEventId: null },
      metrics: { totalEvents: 2 },
      policies: [{ version: "sentra-policy-v1" }],
      keys: [{ keyId: "sentra-hmac-k2026-08" }],
      events: [{ eventId: "evt-1" }, { eventId: "evt-2" }],
    });
    expect(proof).toMatchObject({ format: "sentra-local-proof-package/v1", exportedAt: "2026-08-13T00:00:00.000Z", verifier: { valid: true, checkedEvents: 2 }, eventsChronological: [{ eventId: "evt-1" }, { eventId: "evt-2" }] });
    expect(proof.scope).toContain("not an external audit");
  });
});
