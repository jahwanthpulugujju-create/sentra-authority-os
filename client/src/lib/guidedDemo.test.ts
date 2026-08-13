import { describe, expect, it } from "vitest";
import { formatGuidedDemoDuration, getUndispatchedGuidedScenario, guidedDemoDurationMs, guidedDemoSteps } from "./guidedDemo";

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
});
