import { describe, expect, it } from "vitest";
import { formatGuidedDemoDuration, getGuidedDemoProgress, getGuidedReplayContrastState, getUndispatchedGuidedScenario, guidedDemoDurationMs, guidedDemoSteps } from "./guidedDemo";

describe("guided judge demo", () => {
  it("covers every persisted authority scenario in a judge-sized walkthrough", () => {
    expect(guidedDemoSteps.map(step => step.scenario).filter(Boolean)).toEqual([
      "Valid Action", "Unauthorized Tool", "Prompt Injection", "Changed Request", "Burst Anomaly", "Replay Attempt",
    ]);
    expect(guidedDemoDurationMs).toBeGreaterThanOrEqual(120_000);
    expect(guidedDemoDurationMs).toBeLessThanOrEqual(180_000);
  });

  it("formats the planned duration for the judge-facing control", () => {
    expect(formatGuidedDemoDuration()).toBe("2m 36s");
  });

  it("does not redispatch a scenario when a paused stage is resumed", () => {
    const dispatched = new Set<number>();
    expect(getUndispatchedGuidedScenario(1, dispatched)).toBe("Valid Action");
    dispatched.add(1);
    expect(getUndispatchedGuidedScenario(1, dispatched)).toBeUndefined();
    expect(getUndispatchedGuidedScenario(2, dispatched)).toBe("Unauthorized Tool");
  });

  it("reports stable stage progress for idle, active, paused, and completed walkthroughs", () => {
    expect(getGuidedDemoProgress(0, "idle")).toBe(0);
    expect(getGuidedDemoProgress(0, "running")).toBe(13);
    expect(getGuidedDemoProgress(3, "paused")).toBe(50);
    expect(getGuidedDemoProgress(7, "complete")).toBe(100);
  });

  it("contrasts the fresh one-time capability with the refused replay at the right walkthrough stages", () => {
    expect(getGuidedReplayContrastState(0, "idle")).toBe("waiting");
    expect(getGuidedReplayContrastState(1, "running")).toBe("fresh-execution");
    expect(getGuidedReplayContrastState(4, "paused")).toBe("protected-once");
    expect(getGuidedReplayContrastState(6, "running")).toBe("replay-refused");
    expect(getGuidedReplayContrastState(7, "complete")).toBe("complete");
  });
});
