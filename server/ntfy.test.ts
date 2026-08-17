import { describe, expect, it, vi } from "vitest";
import { getNtfyDemoStatus, publishNtfyDemoAlert, shouldNotifyPhoneForOutcome } from "./ntfy";

describe("ntfy controlled demo channel", () => {
  it("uses a stable high-entropy delivery topic and documents that proof payloads remain local", () => {
    const status = getNtfyDemoStatus();
    expect(status.server).toBe("https://ntfy.sh");
    expect(status.topic).toBe("sentra-demo-b3457500d095decaf168");
    expect(status.scope).toContain("canonical requests");
    expect(status.scope).toContain("dashboard-held reviewer code");
    expect(status.subscribeUrl).toBe(`https://ntfy.sh/${status.topic}`);
  });

  it("reserves phone delivery for the single ESCALATE outcome", () => {
    expect(shouldNotifyPhoneForOutcome("ESCALATE")).toBe(true);
    expect(shouldNotifyPhoneForOutcome("ALLOW")).toBe(false);
    expect(shouldNotifyPhoneForOutcome("DENY")).toBe(false);
    expect(shouldNotifyPhoneForOutcome("FREEZE")).toBe(false);
  });

  it("publishes only a high-level escalation summary", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const result = await publishNtfyDemoAlert({ outcome: "ESCALATE" });
    expect(result.delivered).toBe(true);
    expect(result.skipped).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("https://ntfy.sh/sentra-demo-"), expect.objectContaining({
      method: "POST",
      body: "Sentra escalated an untrusted instruction for human review. Open the Sentra demo to inspect the local proof record.",
    }));
    vi.unstubAllGlobals();
  });

  it("does not contact ntfy for any non-escalation outcome", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await publishNtfyDemoAlert({ outcome: "DENY" });
    expect(result.delivered).toBe(false);
    expect(result.skipped).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
