export type PolicyStatus = "ACTIVE" | "RETIRED" | "UNAVAILABLE";

export type PolicySnapshot = {
  version: string;
  status: PolicyStatus;
  issuedAt: string;
  summary: string;
  rules: readonly {
    id: string;
    subject: string;
    action: string;
    resource: string;
    constraints: string;
    decision: "ALLOW" | "DENY" | "ESCALATE" | "FREEZE";
    reasonCode: string;
  }[];
};

export const ACTIVE_POLICY_VERSION = "sentra-policy-v1";

const policyCatalog: readonly PolicySnapshot[] = [
  {
    version: "sentra-policy-v1",
    status: "ACTIVE",
    issuedAt: "2026-08-13T00:00:00.000Z",
    summary: "Approve one scoped vendor workflow only when the canonical request, purpose, amount limit, workflow step, and single-use gateway proof agree.",
    rules: [
      { id: "allow-scoped-vendor", subject: "procurement-agent-01", action: "approve_vendor", resource: "workspace/vendor-intake/contoso", constraints: "tenant demo-procurement-tenant; USD limit ≤ 12,000; purpose matches workflow; step vendor_approval; budget 1", decision: "ALLOW", reasonCode: "POLICY_ALLOW" },
      { id: "deny-tool-scope", subject: "any agent", action: "outside approved action", resource: "outside scoped vendor resource", constraints: "tool, action, or resource differs from the authority envelope", decision: "DENY", reasonCode: "TOOL_OUT_OF_SCOPE" },
      { id: "escalate-untrusted-instruction", subject: "any agent", action: "high-risk request", resource: "any", constraints: "untrusted instruction attempts to alter the requested authority", decision: "ESCALATE", reasonCode: "UNTRUSTED_INSTRUCTION" },
      { id: "freeze-burst", subject: "procurement-agent-01", action: "approval burst", resource: "workspace/vendor-intake/contoso", constraints: "more than 8 approval proposals in 20 seconds", decision: "FREEZE", reasonCode: "BURST_THRESHOLD" },
    ],
  },
  {
    version: "sentra-policy-v0",
    status: "RETIRED",
    issuedAt: "2026-08-12T00:00:00.000Z",
    summary: "Retired pre-demo policy snapshot retained only for history; it cannot issue or validate new authority.",
    rules: [],
  },
  {
    version: "sentra-policy-maintenance",
    status: "UNAVAILABLE",
    issuedAt: "2026-08-13T00:00:00.000Z",
    summary: "Explicit fail-closed maintenance state used only by automated fault-injection tests; no authority can be issued or verified.",
    rules: [],
  },
];

export const reasonCodeDescriptions: Record<string, string> = {
  POLICY_ALLOW: "Allowed: this exact vendor approval matches the active policy and its bounded workflow.",
  TOOL_OUT_OF_SCOPE: "Blocked: the requested tool or resource is outside the authority that was requested.",
  UNTRUSTED_INSTRUCTION: "Escalated: untrusted instructions cannot change authority without a human review.",
  REQUEST_HASH_MISMATCH: "Blocked: request details changed after approval, so the stored proof no longer matches.",
  BURST_THRESHOLD: "Frozen: the agent exceeded the explicit approval-rate threshold and must be contained.",
  CAPABILITY_REPLAY: "Blocked: this capability was already consumed, so it cannot cause a second change.",
  INVALID_SIGNATURE: "Blocked: the capability integrity check failed.",
  EXPIRED_CAPABILITY: "Blocked: the capability is past its allowed time window.",
  SCOPE_MISMATCH: "Blocked: the tool, resource, action, or requested state differs from the signed scope.",
  WORKFLOW_SCOPE_MISMATCH: "Blocked: the workflow, step, tenant, or single-step budget differs from the signed scope.",
  IDEMPOTENCY_KEY_MISMATCH: "Blocked: this attempt does not carry the operation key bound to the original request.",
  POLICY_VERSION_MISMATCH: "Blocked: the capability and request do not point to the same policy version.",
  UNKNOWN_POLICY: "Blocked: the requested policy version is not known to Sentra.",
  POLICY_UNAVAILABLE: "Blocked: policy evaluation is unavailable, so Sentra fails closed.",
  POLICY_RETIRED: "Blocked: this policy version is retired and cannot authorize a new action.",
  CAPABILITY_ALREADY_CONSUMED: "Blocked: the gateway records that this capability was already used.",
};

export function getPolicySnapshot(version: string): PolicySnapshot | undefined {
  return policyCatalog.find(policy => policy.version === version);
}

export function listPolicyHistory(): PolicySnapshot[] {
  return policyCatalog.map(policy => ({ ...policy, rules: [...policy.rules] }));
}

export function getPolicyAvailabilityReason(version: string): "POLICY_AVAILABLE" | "UNKNOWN_POLICY" | "POLICY_UNAVAILABLE" | "POLICY_RETIRED" {
  const policy = getPolicySnapshot(version);
  if (!policy) return "UNKNOWN_POLICY";
  if (policy.status === "UNAVAILABLE") return "POLICY_UNAVAILABLE";
  if (policy.status === "RETIRED") return "POLICY_RETIRED";
  return "POLICY_AVAILABLE";
}
