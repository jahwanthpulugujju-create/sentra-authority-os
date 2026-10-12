# Baseline and First Workflow Decision

## Approved first workflow

Sentra’s first design-partner workflow is **AI-assisted procurement vendor approval**. A procurement agent may propose vendor approval, but it cannot execute directly. Sentra canonicalizes the request, applies a policy, issues a one-time scoped capability only when permitted, and requires the gateway to verify that capability before the protected workspace adapter changes vendor state.

The working control owner is the **procurement controller**. The working agent owner is the internal **agent-platform or procurement-automation team**. These assumptions must be revalidated with a real design partner before commercial commitments.

| Decision | Current proof | Production gap |
|---|---|---|
| Canonical request | Request ID, tenant, agent, tool, resource, action, purpose, workflow, limit, nonce, and policy version are persisted and hashed. | Multi-tenant schema, field-level retention policy, identity provenance, and schema registry. |
| Deterministic outcome | `ALLOW`, `DENY`, `ESCALATE`, and `FREEZE` scenarios are implemented with explicit reason codes. | Customer-authored policy language, signed policy bundles, test/rollout/rollback workflow. |
| Scoped capability | HMAC-SHA256 capability binds request hash, tool, resource, workflow, nonce, expiry, and idempotency key. | KMS-backed asymmetric signing, key rotation automation, verifier-distributed public keys. |
| Enforcement | Protected vendor approval adapter verifies the permit before state change; replay and changed request paths are refused. | Real SaaS adapter, transactional receipt reconciliation, concurrency/error semantics. |
| Human review | Prompt Injection creates a one-time review; link plus reviewer code resolves only the review. | Authenticated reviewer identity, entitlement checks, review queue, step-up verification, audit-grade notification provider. |
| Evidence | Hash-linked event records and proof export are implemented. | Tenant isolation, immutable retention store, export access control, third-party audit trail. |

## Explicit non-claims

The current project does not claim production multi-region availability, independent security certification, million-request-per-second capacity, external identity federation, KMS/HSM signing, or a real production procurement integration. Every design document and demo must retain these boundaries.

## Product success metric

The north-star metric is **safe action throughput**: consequential actions completed through an independently verified authority path, without duplicate side effects or unauditable exceptions. Supporting metrics are evidence completeness, policy clarity, reviewer burden, false escalation rate, gateway verification latency, and time-to-safe-deploy.
