import { describe, expect, it } from "vitest";
import { formatEvidenceScope } from "./evidenceDisplay";

describe("evidence display scope", () => {
  it("formats a protected-tool request without changing its canonical action or resource tail", () => {
    expect(formatEvidenceScope({ action: "approve_vendor", resource: "workspace/vendor-intake/contoso" })).toEqual({ action: "approve_vendor", resource: "workspace/vendor-intake/contoso", resourceLabel: "contoso" });
  });

  it("renders a mobile-review evidence record that intentionally has no protected-tool fields", () => {
    expect(formatEvidenceScope({ type: "MOBILE_ESCALATION_REVIEW" })).toEqual({ action: "MOBILE_REVIEW", resource: "review evidence", resourceLabel: "review evidence" });
  });
});
