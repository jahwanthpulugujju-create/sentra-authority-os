import { verifyCapability, type AuthorityRequest, type SignedCapability } from "./authority";

const gatewayExecutionSeal = Symbol("sentra.gateway.execution.seal");

type GatewayExecutionPermit = {
  capabilityId: string;
  requestHash: string;
  [gatewayExecutionSeal]: true;
};

export type GatewayAuthorization =
  | { allowed: true; permit: GatewayExecutionPermit; reason: "VERIFIED" }
  | { allowed: false; permit: null; reason: string };

export type ProtectedToolExecution = {
  executionChanged: 1;
  executionState: 1;
  result: "EXECUTED: protected vendor approval was committed by the workspace tool";
};

/**
 * The only gateway entry point that can create a permit for the protected tool.
 * The permit is sealed with a module-private symbol, so direct callers cannot
 * construct a value accepted by executeProtectedVendorApproval at runtime.
 */
export function authorizeProtectedVendorApproval(input: {
  capability: SignedCapability;
  request: AuthorityRequest;
  requestHash: string;
  now?: number;
}): GatewayAuthorization {
  const verification = verifyCapability(input.capability, input.request, input.requestHash, input.now);
  if (!verification.valid) return { allowed: false, permit: null, reason: verification.reason };
  return {
    allowed: true,
    reason: "VERIFIED",
    permit: {
      capabilityId: input.capability.capabilityId,
      requestHash: input.requestHash,
      [gatewayExecutionSeal]: true,
    },
  };
}

/**
 * A deliberately narrow tool adapter. It accepts only the module-sealed gateway
 * permit and returns the sole state transition the controlled MVP supports.
 */
export function executeProtectedVendorApproval(permit: GatewayExecutionPermit | null | undefined): ProtectedToolExecution {
  if (!permit || permit[gatewayExecutionSeal] !== true) {
    throw new Error("DIRECT_TOOL_BYPASS_REJECTED: protected vendor approval requires a gateway-verified capability.");
  }
  return {
    executionChanged: 1,
    executionState: 1,
    result: "EXECUTED: protected vendor approval was committed by the workspace tool",
  };
}
