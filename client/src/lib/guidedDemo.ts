export type GuidedScenario = "Valid Action" | "Unauthorized Tool" | "Prompt Injection" | "Changed Request" | "Burst Anomaly" | "Replay Attempt";
export type GuidedDemoStatus = "idle" | "running" | "paused" | "complete";
export type GuidedReplayContrastState = "waiting" | "fresh-execution" | "protected-once" | "replay-refused" | "complete";

export type GuidedDemoStep = {
  title: string;
  narration: string;
  evidence: string;
  durationMs: number;
  scenario?: GuidedScenario;
};

// The walkthrough intentionally uses the same real scenarios exposed to judges.
export const guidedDemoSteps: GuidedDemoStep[] = [
  { title: "Frame the decision", narration: "The agent proposes a vendor approval. Sentra receives a canonical request, not a permission.", evidence: "Agent request → canonical contract", durationMs: 18_000 },
  { title: "Grant only the scoped action", narration: "A valid, in-scope request earns a short-lived signed capability. The gateway then commits the protected change.", evidence: "ALLOW → signed capability → executed", durationMs: 20_000, scenario: "Valid Action" },
  { title: "Refuse tool-scope escape", narration: "The same agent asks for an unapproved employee-export tool. Policy refuses it before any tool call is issued.", evidence: "DENY → no capability → no side effect", durationMs: 20_000, scenario: "Unauthorized Tool" },
  { title: "Escalate untrusted instructions", narration: "A vendor note attempts to override policy. Sentra treats the input as untrusted and routes it to human review.", evidence: "ESCALATE → execution withheld", durationMs: 20_000, scenario: "Prompt Injection" },
  { title: "Bind approval to the exact request", narration: "Changing the approved request invalidates its request hash. A capability cannot be used for a different action.", evidence: "DENY → request hash mismatch", durationMs: 20_000, scenario: "Changed Request" },
  { title: "Contain burst behavior", narration: "A burst of high-risk requests crosses the context threshold. Sentra freezes the agent session without changing the workspace.", evidence: "FREEZE → contained → state unchanged", durationMs: 20_000, scenario: "Burst Anomaly" },
  { title: "Reject replay", narration: "The gateway sees a consumed capability reused. Replay attempts produce a visible refusal and zero additional side effects.", evidence: "DENY → consumed capability rejected", durationMs: 20_000, scenario: "Replay Attempt" },
  { title: "Inspect the proof", narration: "Every result is persisted with its request, decision, gateway outcome, execution result, and predecessor hash for inspection.", evidence: "Proof chain → replayable evidence", durationMs: 18_000 },
];

export const guidedDemoDurationMs = guidedDemoSteps.reduce((total, step) => total + step.durationMs, 0);

export function formatGuidedDemoDuration(durationMs = guidedDemoDurationMs) {
  const seconds = Math.round(durationMs / 1_000);
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

export function getUndispatchedGuidedScenario(stepIndex: number, dispatchedSteps: ReadonlySet<number>) {
  const scenario = guidedDemoSteps[stepIndex]?.scenario;
  return scenario && !dispatchedSteps.has(stepIndex) ? scenario : undefined;
}

export function getGuidedDemoProgress(stepIndex: number, status: GuidedDemoStatus) {
  if (status === "idle") return 0;
  if (status === "complete") return 100;
  return Math.min(100, Math.max(0, Math.round(((stepIndex + 1) / guidedDemoSteps.length) * 100)));
}

export function getGuidedReplayContrastState(stepIndex: number, status: GuidedDemoStatus): GuidedReplayContrastState {
  if (status === "idle") return "waiting";
  const validStep = guidedDemoSteps.findIndex(step => step.scenario === "Valid Action");
  const replayStep = guidedDemoSteps.findIndex(step => step.scenario === "Replay Attempt");
  if (status === "complete" || stepIndex > replayStep) return "complete";
  if (stepIndex < validStep) return "waiting";
  if (stepIndex === validStep) return "fresh-execution";
  if (stepIndex < replayStep) return "protected-once";
  return "replay-refused";
}
