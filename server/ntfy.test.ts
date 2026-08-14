import { describe, expect, it, vi } from "vitest";
import { getNtfyDemoStatus, publishNtfyDemoAlert } from "./ntfy";

describe("ntfy controlled demo channel", () => {
  it("creates an ephemeral randomized topic and documents that proof payloads remain local", () => {
    const status = getNtfyDemoStatus();
    expect(status.server).toBe("https://ntfy.sh");
    expect(status.topic).toMatch(/^sentra-demo-[a-f0-9]{20}$/);
    expect(status.scope).toContain("canonical requests");
    expect(status.subscribeUrl).toBe(`https://ntfy.sh/${status.topic}`);
  });

  it("publishes only a high-level outcome summary", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const result = await publishNtfyDemoAlert({ outcome: "DENY", reasonCode: "REQUEST_HASH_MISMATCH", eventId: "evt_demo" });
    expect(result.delivered).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("https://ntfy.sh/sentra-demo-"), expect.objectContaining({
      method: "POST",
      body: "Local Sentra authority event evt_demo completed with DENY (REQUEST_HASH_MISMATCH). Open the Sentra demo to inspect the local proof record.",
    }));
    vi.unstubAllGlobals();
  });
});
