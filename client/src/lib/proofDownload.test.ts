import { describe, expect, it } from "vitest";
import { buildProofDownloadName, serializeProofPackage } from "./proofDownload";

describe("local proof download helper", () => {
  it("builds a portable JSON filename and preserves the proof package for the UI download handler", () => {
    expect(buildProofDownloadName(new Date("2026-08-13T01:02:03.456Z"))).toBe("sentra-local-proof-2026-08-13T01-02-03-456Z.json");
    expect(serializeProofPackage({ format: "sentra-local-proof-package/v1", verifier: { valid: true } })).toContain('"format": "sentra-local-proof-package/v1"');
  });
});
