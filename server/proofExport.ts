export function buildProofExportPackage(input: {
  exportedAt?: Date;
  proofIntegrity: { valid: boolean; checkedEvents: number; failedEventId: string | null };
  metrics: Record<string, unknown>;
  policies: unknown[];
  keys: unknown[];
  events: unknown[];
}) {
  return {
    format: "sentra-local-proof-package/v1",
    exportedAt: (input.exportedAt || new Date()).toISOString(),
    scope: "Controlled software MVP; local persisted demonstration evidence, not an external audit or production attestation.",
    verifier: {
      algorithm: "SHA-256 hash-linked authority-event records",
      valid: input.proofIntegrity.valid,
      checkedEvents: input.proofIntegrity.checkedEvents,
      failedEventId: input.proofIntegrity.failedEventId,
    },
    localMetrics: input.metrics,
    policyHistory: input.policies,
    keyLifecycle: input.keys,
    eventsChronological: input.events,
  };
}
