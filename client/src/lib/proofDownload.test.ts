import { describe, expect, it } from "vitest";
import { buildProofDownloadName, buildProofEmailHref, copyTextToClipboard, serializeProofPackage } from "./proofDownload";

describe("local proof download helper", () => {
  it("builds a portable JSON filename and preserves the proof package for the UI download handler", () => {
    expect(buildProofDownloadName(new Date("2026-08-13T01:02:03.456Z"))).toBe("sentra-local-proof-2026-08-13T01-02-03-456Z.json");
    expect(serializeProofPackage({ format: "sentra-local-proof-package/v1", verifier: { valid: true } })).toContain('"format": "sentra-local-proof-package/v1"');
  });

  it("copies generated proof JSON through a supplied clipboard writer and reports an unavailable clipboard safely", async () => {
    const writeText = async (value: string) => expect(value).toContain('"verifier"');
    await expect(copyTextToClipboard('{"verifier":{"valid":true}}', { writeText })).resolves.toBe(true);
    await expect(copyTextToClipboard("proof", null)).resolves.toBe(false);
  });

  it("creates a mailto draft with the truthful local proof summary rather than an attachment or production claim", () => {
    const href = decodeURIComponent(buildProofEmailHref({ exportedAt: "2026-08-14T00:00:00.000Z", verifier: { valid: true, checkedEvents: 6 }, eventsChronological: [{}, {}] }));
    expect(href).toContain("mailto:?subject=Sentra local proof summary");
    expect(href).toContain("Verifier status: VERIFIED");
    expect(href).toContain("Authority records checked: 6");
    expect(href).toContain("Controlled software MVP");
  });
});
