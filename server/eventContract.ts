import { nanoid } from "nanoid";
import { sha256, stableStringify, type Outcome } from "./authority";

export const authorityEventTypes = ["authority.decision.created", "review.lifecycle.resolved"] as const;
export type AuthorityEventType = (typeof authorityEventTypes)[number];

export type AuthorityOutboxContract = {
  outboxId: string;
  eventType: AuthorityEventType;
  schemaVersion: "1.0";
  occurredAt: string;
  tenantId: string;
  correlationId: string;
  causationId: string | null;
  payload: {
    sourceEventId: string;
    outcome: Outcome;
    reasonCode: string;
    requestHash: string;
    capabilityHash: string | null;
    approvalHash: string | null;
    executionChanged: boolean;
  };
  payloadHash: string;
};

export function buildAuthorityOutboxEvent(input: {
  eventType: AuthorityEventType;
  tenantId: string;
  correlationId: string;
  causationId?: string | null;
  sourceEventId: string;
  outcome: Outcome;
  reasonCode: string;
  requestHash: string;
  capabilityHash?: string | null;
  approvalHash?: string | null;
  executionChanged?: boolean;
  now?: Date;
}): AuthorityOutboxContract {
  const payload = {
    sourceEventId: input.sourceEventId,
    outcome: input.outcome,
    reasonCode: input.reasonCode,
    requestHash: input.requestHash,
    capabilityHash: input.capabilityHash ?? null,
    approvalHash: input.approvalHash ?? null,
    executionChanged: input.executionChanged ?? false,
  };
  return {
    outboxId: `obx_${nanoid(16)}`,
    eventType: input.eventType,
    schemaVersion: "1.0",
    occurredAt: (input.now || new Date()).toISOString(),
    tenantId: input.tenantId,
    correlationId: input.correlationId,
    causationId: input.causationId ?? null,
    payload,
    payloadHash: sha256(stableStringify(payload)),
  };
}
